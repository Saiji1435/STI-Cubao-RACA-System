// request.controller.ts
import { 
  Controller, Get, Post, Patch, Body, Param, UseGuards, ForbiddenException 
} from '@nestjs/common';
import { AuthGuard, Session, UserSession } from '@thallesp/nestjs-better-auth';
import { RequestService } from './request.service';
import { Role } from '@prisma/client';
import { CreateRequestDto } from './domain/create-request.dto';

@Controller('requests')
@UseGuards(AuthGuard)
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  @Get()
  async getRequests(@Session() session: UserSession) {
    const { user } = session;
    console.log(`User ${user.id} with role ${user.role} is fetching requests.`);
    if (user.role === Role.ADMIN || user.role === Role.HEAD) {
      return this.requestService.findAll();
    }
    return this.requestService.findByUser(user.id);
  }

// request.controller.ts
  @Post()
  async createRequest(
    @Session() session: UserSession,
    @Body() createRequestDto: CreateRequestDto // Enforces the DTO rules
  ) {
    if (session.user.role === Role.ADMIN) {
      throw new ForbiddenException('Admins should use the Schedule module.');
    }

    return this.requestService.create(session.user.id, createRequestDto);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Session() session: UserSession
  ) {
    if (session.user.role !== Role.ADMIN && session.user.role !== Role.HEAD) {
      throw new ForbiddenException('Permission denied.');
    }
    return this.requestService.updateStatus(id, status);
  }
}