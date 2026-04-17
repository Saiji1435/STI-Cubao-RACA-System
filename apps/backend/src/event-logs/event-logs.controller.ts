import { Controller, Get, UseGuards } from '@nestjs/common';
import { EventLogsService } from './event-logs.service';
import { AuthGuard } from '@/auth/auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('event-logs')
@UseGuards(AuthGuard, RolesGuard)
export class EventLogsController {
  constructor(private readonly eventLogsService: EventLogsService) {}

  @Get('history')
  // All specific Admins and Heads can see the history
  @Roles(Role.ADMIN_MAIN, Role.ADMIN_MIS, Role.ADMIN_DSA, Role.ADMIN_BUILDING, Role.HEAD_ACADEMIC)
  async getHistory() {
    return this.eventLogsService.getSystemHistory();
  }
}