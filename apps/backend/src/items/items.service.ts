import { Injectable } from '@nestjs/common';
import { PrismaService } from '../core/prisma/prisma.service';
import { CreateItemDto } from './domain/create-item.dto';

@Injectable()
export class ItemsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.item.findMany();
  }

  async create(data: CreateItemDto) {
  return this.prisma.item.upsert({
    where: { name: data.name },
    update: {
      quantity: { increment: data.quantity ?? 0 },
    },
    create: {
      name: data.name,
      quantity: data.quantity ?? 0,

      ...(data.roomId && { room: { connect: { id: data.roomId } } }),
    },
  });
}
}
