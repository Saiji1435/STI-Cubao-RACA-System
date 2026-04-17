import { Controller, Patch, Param, Body, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { AuthGuard } from '@/auth/auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('rooms')
@UseGuards(AuthGuard, RolesGuard)
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Patch(':id/status')
  // Only the Building Admin or Super Admin can manually override room status
  @Roles(Role.ADMIN_MAIN, Role.ADMIN_BUILDING)
  async toggleAvailability(
    @Param('id', ParseIntPipe) id: number,
    @Body('isAvailable') isAvailable: boolean,
    @Req() req: any
  ) {
    return this.roomsService.updateStatus(id, isAvailable, req.user.id);
  }
}