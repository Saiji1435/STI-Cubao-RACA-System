import { Controller, Get, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
// Import AuthGuard and the Session decorators
import { AuthGuard, Session, UserSession } from '@thallesp/nestjs-better-auth';

@Controller('inventory')
@UseGuards(AuthGuard) // Use the standard NestJS Guard pattern
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  getAllItems(@Session() session: UserSession) {
    // Now session.user.role should be accessible if defined in auth.ts
    if (session.user.role === 'admin') {
        console.log("Admin access granted");
    }
    
    return this.inventoryService.findAll();
  }
}