// apps/backend/src/event-logs/event-logs.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../core/prisma/prisma.service';

@Injectable()
export class EventLogsService {
  constructor(private prisma: PrismaService) {}

  // Ensure this is INSIDE the class braces!
  async getSystemHistory() {
    return this.prisma.raca.findMany({
      where: {
        OR: [
          { status: 'APPROVED' },
          { endDate: { lt: new Date() } } 
        ]
      },
      include: {
        requestor: { select: { name: true, role: true } },
        room: { select: { name: true } },
        approvals: true
      },
      orderBy: { endDate: 'desc' }
    });
  }

  // If you have other methods like create(), they go here too
}