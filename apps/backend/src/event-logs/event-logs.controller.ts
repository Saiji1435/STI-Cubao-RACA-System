// apps/api/src/event-logs/event-logs.controller.ts
import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { EventLogsService } from './event-logs.service';
import { CreateEventLogDto } from './domain/create-event-log.dto';
import { AuthGuard } from '@/auth/auth.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('event-logs')
@UseGuards(AuthGuard) // This now handles both Session check AND Role check
@Roles(Role.ADMIN, Role.HEAD) 
export class EventLogsController {
  constructor(private readonly eventLogsService: EventLogsService) {}

  @Get()
  getAllLogs() {
    return this.eventLogsService.findAll();
  }

  @Post()
  createLog(@Body() createEventLogDto: CreateEventLogDto) {
    return this.eventLogsService.create(createEventLogDto);
  }
}