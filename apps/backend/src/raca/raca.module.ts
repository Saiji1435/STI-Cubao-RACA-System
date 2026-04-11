import { Module } from '@nestjs/common';
import { RacaController } from './raca.controller';
import { RacaService } from './raca.service';

@Module({
  controllers: [RacaController],
  providers: [RacaService],
  exports: [RacaService],
})
export class RacaModule {}