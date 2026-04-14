import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DiscoveryModule } from '@nestjs/core';
import { AuthModule } from '@thallesp/nestjs-better-auth'; 
import { auth } from './auth';

import { PrismaModule } from './core/prisma/prisma.module';
import { InventoryModule } from './inventory/inventory.module';
import { RoomsModule } from './rooms/rooms.module';
import { SchedulesModule } from './schedules/schedules.module';
import { UsersModule } from './users/users.module';
import { ItemsModule } from './items/items.module';
import { RacaModule } from './raca/raca.module';
import { EventLogsModule } from './event-logs/event-logs.module';
import { RequestModule } from './request/request.module';
import { request } from 'http';

@Module({
  imports: [
    
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    DiscoveryModule,
    AuthModule.forRoot({
      auth, 
    }), 
    
    PrismaModule,
    InventoryModule,
    RoomsModule,
    SchedulesModule,
    UsersModule,
    ItemsModule,
    RacaModule,
    EventLogsModule,
    RequestModule,
  ],
})
export class AppModule {}