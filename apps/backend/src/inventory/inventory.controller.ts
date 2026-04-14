import { Controller, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { AuthGuard } from '@/auth/auth.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('inventory')
@UseGuards(AuthGuard) // Protects the entire inventory route
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // Anyone logged in can view the inventory
  @Get()
  async findAll() {
    return this.inventoryService.findAll();
  }

  // ONLY Admin or Head can update item status or location
  @Patch(':id')
  @Roles(Role.ADMIN, Role.HEAD) 
  async update(
    @Param('id') id: string, 
    @Body() updateData: { condition?: any; roomId?: number; quantity?: number }
  ) {
    return this.inventoryService.update(id, updateData);
  }
}