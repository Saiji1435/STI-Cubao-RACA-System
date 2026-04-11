import { Injectable } from '@nestjs/common';
import { PrismaService } from '../core/prisma/prisma.service';
import { Prisma } from '@prisma/client'; // Import the Prisma namespace

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  // Fetch all inventory items
  async findAll() {
    return this.prisma.inventory.findMany({
      include: { room: true },
    });
  }

  // Add a new item using Prisma's generated Create Input type
  async create(data: Prisma.InventoryUncheckedCreateInput) {
    // InventoryUncheckedCreateInput allows you to pass roomId directly as a string
    return this.prisma.inventory.create({ 
      data 
    });
  }
}