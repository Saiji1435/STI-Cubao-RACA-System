import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../core/prisma/prisma.service';
import { Prisma, ItemCondition } from '@prisma/client';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.inventory.findMany({
      include: { room: true },
    });
  }

  async markDefective(id: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const item = await tx.inventory.update({
        where: { id },
        data: { condition: ItemCondition.DEFECTIVE },
      });

      await tx.eventLog.create({
        data: {
          action: 'REPORT_DAMAGE',
          summary: `Asset ${item.itemName} was marked as DEFECTIVE.`,
          userId: userId,
          inventoryId: id,
        },
      });

      return item;
    });
  }
}