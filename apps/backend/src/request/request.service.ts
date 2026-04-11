import { Injectable } from '@nestjs/common';
import { PrismaService } from '../core/prisma/prisma.service';

@Injectable()
export class RequestService {
  constructor(private prisma: PrismaService) {}

  async findPending() {
    return this.prisma.request.findMany({
      where: { status: 'PENDING' },
      include: { room: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.request.update({
      where: { id },
      data: { status: status as any }, 
    });
  }
}