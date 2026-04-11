import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return 'STI Cubao RACA API is Online! 🚀';
  }
}