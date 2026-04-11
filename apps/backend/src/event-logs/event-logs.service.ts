import { Injectable } from '@nestjs/common';
import { PrismaService } from '../core/prisma/prisma.service';
import { CreateEventLogDto } from './domain/create-event-log.dto';

@Injectable()
export class EventLogsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.eventLog.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: CreateEventLogDto) {
    return this.prisma.eventLog.create({ data });
  }
}