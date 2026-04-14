import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../core/prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.inventory.findMany({
      include: { room: true },
      orderBy: { itemName: 'asc' },
    });
  }

  async update(id: string, data: any) {
    // Check if item exists first
    const existing = await this.prisma.inventory.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Inventory item not found');

    return this.prisma.inventory.update({
      where: { id },
      data,
      include: { room: true }
    });
  }
}