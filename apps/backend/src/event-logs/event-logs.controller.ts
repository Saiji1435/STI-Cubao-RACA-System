import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { EventLogsService } from './event-logs.service';
import { CreateEventLogDto } from './domain/create-event-log.dto';
import { AuthGuard } from '@/auth/auth.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('event-logs')
@UseGuards(AuthGuard)
@Roles(Role.ADMIN)
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