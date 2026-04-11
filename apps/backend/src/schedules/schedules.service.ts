import { Injectable } from '@nestjs/common';
import { PrismaService } from '../core/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateScheduleDto } from './domain/create-schedule.dto';

export interface ExtractedData {
  roomName: string;
  date: Date;
  endDate: Date;
  items: { name: string; qty: number }[];
}

@Injectable()
export class SchedulesService {
  constructor(private prisma: PrismaService) {}

  // ✅ 1. ADDED THIS: The missing method that the controller is looking for
  async findAll() {
    return this.prisma.schedule.findMany({
      include: { 
        room: true, 
        itemsUsed: true 
      },
    });
  }

  // 2. RACA Logic: Create Schedule with Policy & Capacity Checks
  async createSchedule(data: CreateScheduleDto) {
    // A. Policy Check: Must be 2 days (48 hours) in advance
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
    
    if (new Date(data.startTime) < twoDaysFromNow) {
      throw new Error('Requests must be filed at least 48 hours in advance.');
    }

    // B. Capacity Check: Get room data first
    const room = await this.prisma.room.findUnique({ 
      where: { id: data.roomId } 
    });
    
    if (!room) throw new Error('Room not found');
    
    if (data.attendees > room.capacity) {
      throw new Error(`Capacity exceeded! ${room.name} only holds ${room.capacity} people.`);
    }

    // C. Conflict Check: Existing Overlap logic
    const overlap = await this.prisma.schedule.findFirst({
      where: {
        roomId: data.roomId,
        OR: [
          {
            startTime: { lte: data.endTime },
            endTime: { gte: data.startTime },
          },
        ],
      },
    });

    if (overlap) {
      throw new Error('Conflict: This room is already reserved for the selected time.');
    }

    // D. Final Creation
    return this.prisma.schedule.create({ 
      data: {
        startTime: data.startTime,
        endTime: data.endTime,
        roomId: data.roomId,
        attendees: data.attendees,
        racaId: data.racaId,
        status: 'PENDING' 
      } 
    });
  }

  // 3. Automation: Create Schedule from Summary
  async createScheduleFromSummary(summary: ExtractedData, racaId: string) {
    return this.prisma.$transaction(async (tx) => {
      const room = await tx.room.findUnique({ where: { name: summary.roomName } });
      if (!room) throw new Error(`Room ${summary.roomName} not found`);

      const schedule = await tx.schedule.create({
        data: {
          startTime: summary.date,
          endTime: summary.endDate,
          roomId: room.id,
          racaId: racaId
        }
      });

      for (const item of summary.items) {
        const inventoryItem = await tx.inventory.findFirst({
          where: { 
            itemName: { contains: item.name, mode: 'insensitive' }, 
            roomId: room.id 
          }
        });

        if (inventoryItem) {
          await tx.itemCheckout.create({
            data: {
              inventoryId: inventoryItem.id,
              scheduleId: schedule.id,
              quantity: item.qty
            }
          });
        }
      }
      return schedule;
    });
  }
}