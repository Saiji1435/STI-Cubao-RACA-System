import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../core/prisma/prisma.service';

@Injectable()
export class EventLogsService {
  constructor(private prisma: PrismaService) {}

  async getSystemHistory() {
    return this.prisma.raca.findMany({
      where: {
        OR: [
          { status: 'APPROVED' },
          { endDate: { lt: new Date() } } // Past events
        ]
      },
      include: { 
        requestor: { select: { name: true } }, 
        room: true 
      },
      orderBy: { endDate: 'desc' }
    });
  }
}