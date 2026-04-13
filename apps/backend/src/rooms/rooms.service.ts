import { Injectable } from '@nestjs/common';
import { PrismaService } from '../core/prisma/prisma.service';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
      return this.prisma.room.findMany({
        orderBy: { name: 'asc' }, // Keeps the list organized
      });
    }

  async create(data: { name: string; description?: string }) {
    return this.prisma.room.create({ data });
  }
}