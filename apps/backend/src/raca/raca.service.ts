import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../core/prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class RacaService {
  constructor(private prisma: PrismaService) {}

  // The 6 specific heads from your STI Cubao flowchart
  private readonly REQUIRED_SIGNATORIES = [
    Role.ADMIN_MIS,
    Role.HEAD_ACADEMIC,
    Role.ADMIN_DSA,
    Role.ADMIN_BUILDING,
    Role.HEAD_DEPT,
    Role.HEAD_SA
  ];

  async createRaca(dto: any, userId: string) {
    const startDate = new Date(dto.startDate);
    const now = new Date();
    
    // FLOWCHART RULE: 1 week (7 days) lead time required
    const leadTimeLimit = new Date();
    leadTimeLimit.setDate(now.getDate() + 7);

    if (startDate < leadTimeLimit) {
      throw new BadRequestException('RACA must be filed at least 7 days before the start date.');
    }

    return this.prisma.raca.create({
      data: {
        ...dto,
        requestorId: userId,
        status: 'PENDING',
      },
    });
  }

  // FLOWCHART RULE: Auto-archive done events
  async getActiveRacas() {
    return this.prisma.raca.findMany({
      where: {
        endDate: { gte: new Date() }, // Only show events that haven't ended yet
      },
      include: {
        requestor: { select: { name: true, role: true } },
        room: { select: { name: true } },
        approvals: true
      },
      orderBy: { startDate: 'asc' }
    });
  }
}