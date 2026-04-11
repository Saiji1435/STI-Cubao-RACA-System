import { Injectable } from '@nestjs/common';
import { PrismaService } from '../core/prisma/prisma.service';
import { CreateUserDto } from './domain/create-user.dto';
import * as bcrypt from 'bcrypt'; // Don't forget this import!

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
  }

  async create(data: CreateUserDto) {
    const { password, ...rest } = data;
    
    const hashedPassword = await bcrypt.hash(password, 10);

    return this.prisma.user.create({ 
      data: {
        ...rest,
        password: hashedPassword,
      }
    });
  }
}