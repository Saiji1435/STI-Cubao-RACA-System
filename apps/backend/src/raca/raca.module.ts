import { Module } from '@nestjs/common';
import { RacaController } from './raca.controller';
import { RacaService } from './raca.service';
import { PrismaService } from '../core/prisma/prisma.service';

@Module({
  controllers: [RacaController],
  providers: [RacaService, PrismaService],
  exports: [RacaService],
})
export class RacaModule {}