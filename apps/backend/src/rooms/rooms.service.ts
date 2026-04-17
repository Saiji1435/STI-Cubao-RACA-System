import { Injectable } from '@nestjs/common';
import { PrismaService } from '../core/prisma/prisma.service';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  async updateStatus(id: number, isAvailable: boolean, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const room = await tx.room.update({
        where: { id },
        data: { isAvailable }
      });

      // Log the event so Staff/Faculty know why the room is gone
      await tx.eventLog.create({
        data: {
          action: 'ROOM_STATUS_CHANGE',
          summary: `Room "${room.name}" was marked as ${isAvailable ? 'AVAILABLE' : 'UNAVAILABLE'} by the Admin.`,
          userId
        }
      });

      return room;
    });
  }
}