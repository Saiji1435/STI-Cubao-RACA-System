// request.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../core/prisma/prisma.service';
import { CreateRequestDto } from './domain/create-request.dto';
import { Role } from '@prisma/client';
@Injectable()
export class RequestService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.request.findMany({
      include: { 
        room: true, 
        user: { select: { name: true, email: true, role: true } } 
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.request.findMany({
      where: { userId },
      include: { room: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, data: CreateRequestDto) {
    const room = await this.prisma.room.findFirst({
      where: { name: { equals: data.roomName, mode: 'insensitive' } }
    });

    if (!room) throw new NotFoundException(`Room "${data.roomName}" not found.`);

    return this.prisma.request.create({
      data: {
        title: data.purpose,
        description: data.items,
        startDate: new Date(data.startTime), // Convert string to Date object
        endDate: new Date(data.endTime),     // Convert string to Date object
        userId: userId,
        roomId: room.id,
        status: 'PENDING',
      },
    });
  }

async updateStatus(id: string, status: string, adminId: string) {
    // 1. Immediate Denial Logic
    // If any Admin/Head denies, the request is immediately rejected for everyone.
    if (status === 'DENIED') {
      return this.prisma.request.update({
        where: { id },
        data: { status: 'DENIED' },
      });
    }

    // 2. Register the "Vote"
    // We use 'upsert' to prevent duplicate approvals from the same admin
    await this.prisma.approval.upsert({
      where: { 
        // Note: You might need a unique composite constraint in prisma (approverId_requestId) 
        // if you want to use upsert properly, otherwise use findFirst/create logic:
        id: (await this.prisma.approval.findFirst({ 
          where: { requestId: id, approverId: adminId } 
        }))?.id || 'new-id', 
      },
      update: { status: 'APPROVED' },
      create: {
        requestId: id,
        approverId: adminId,
        status: 'APPROVED',
        roleType: Role.ADMIN, // Or dynamic role based on session
      },
    });

    // 3. Count total required signatories (All ADMINs and HEADs)
    const totalRequired = await this.prisma.user.count({
      where: {
        role: { in: [Role.ADMIN, Role.HEAD] },
      },
    });

    // 4. Count current approval records for this request
    const currentApprovals = await this.prisma.approval.count({
      where: { requestId: id, status: 'APPROVED' },
    });

    // 5. Finalize status if threshold is met
    if (currentApprovals >= totalRequired) {
      return this.prisma.request.update({
        where: { id },
        data: { status: 'APPROVED' },
      });
    }

    // Return the request with its current approval count so the frontend can show "1/3"
    return this.prisma.request.findUnique({
      where: { id },
      include: { approvals: true },
    });
  }
}