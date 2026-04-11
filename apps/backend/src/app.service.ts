import { Module } from '@nestjs/common';
import { PrismaModule } from './core/prisma/prisma.module';
import { InventoryModule } from './inventory/inventory.module';

@Module({
  imports: [
    PrismaModule, // Globally shares Database Connection
    InventoryModule, // Loads GET /inventory and POST /inventory
  ],
})
export class AppModule {}