import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { PrismaModule } from '../core/prisma/prisma.module'; // 👈 Adjust this path to your PrismaModule

@Module({
  imports: [PrismaModule], // 👈 This gives InventoryService access to Prisma
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class InventoryModule {}