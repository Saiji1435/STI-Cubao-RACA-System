import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { RequestService } from './request.service';

@Controller('request')
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  @Get('pending')
  async getPending() {
    return this.requestService.findPending();
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string, 
    @Body('status') status: string
  ) {
    return this.requestService.updateStatus(id, status);
  }
}