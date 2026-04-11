import { Controller, Get, Post, Body } from '@nestjs/common';
import { RoomsService } from './rooms.service';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  getAll() { return this.roomsService.findAll(); }

  @Post()
  create(@Body() body: { name: string; description?: string }) {
    return this.roomsService.create(body);
  }
}