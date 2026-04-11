import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto } from './domain/create-schedule.dto';
import { AuthGuard } from '@thallesp/nestjs-better-auth';
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Get()
  getAllSchedules() {
    return this.schedulesService.findAll();
  }

  @Post()
  @UseGuards(AuthGuard) // 👈 Protect this specific route
  createSchedule(@Body() body: CreateScheduleDto, @Req() req: any) {
    // Now you can even see WHO is creating it
    console.log('Created by user:', req.user.id); 
    return this.schedulesService.createSchedule(body);
  }
}