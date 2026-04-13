// request.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../core/prisma/prisma.service';
import { CreateRequestDto } from './domain/create-request.dto';
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
  async updateStatus(id: string, status: string) {
    return this.prisma.request.update({
      where: { id },
      data: { status },
    });
  }
}