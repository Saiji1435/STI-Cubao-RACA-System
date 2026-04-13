import { Controller, Get, Post, Body } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  @AllowAnonymous()
  async getAll() { return await this.roomsService.findAll(); }

  @Post()
  async create(@Body() body: { name: string; description?: string }) {
    return await this.roomsService.create(body);
  }
}