import { Controller, Get, Post, Body } from '@nestjs/common';
import { ItemsService } from './items.service';
import { CreateItemDto } from './domain/create-item.dto';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get()
  getAllItems() {
    return this.itemsService.findAll();
  }

  @Post()
  addItem(@Body() createItemDto: CreateItemDto) {
    return this.itemsService.create(createItemDto);
  }
}