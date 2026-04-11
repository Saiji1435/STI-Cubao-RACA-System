import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    dotenv.config({ path: path.join(process.cwd(), '../../.env') });
    
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }

  async onModuleInit() {
    try {
      if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL is missing from environment');
      }
      await this.$connect();
      this.logger.log('✅ Database connected successfully');
    } catch (error: unknown) {
      this.logger.error('❌ Failed to connect to database');
      if (error instanceof Error) {
        this.logger.error(`Error details: ${error.message}`);
      } else {
        this.logger.error(`Error details: ${String(error)}`);
      }
      process.exit(1); // Stop the app so you can see the error
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}