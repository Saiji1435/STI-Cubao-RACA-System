import { Module } from '@nestjs/common';
import { RequestController } from './request.controller';
import { RequestService } from './request.service';
import { PrismaService } from '../core/prisma/prisma.service';

@Module({
  controllers: [RequestController],
  providers: [RequestService, PrismaService],
  exports: [RequestService],
})
export class RequestModule {}