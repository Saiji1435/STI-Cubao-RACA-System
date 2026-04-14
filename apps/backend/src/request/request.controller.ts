import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Body, 
  Param, 
  UseGuards, 
  ForbiddenException, 
  ParseUUIDPipe 
} from '@nestjs/common';
import { AuthGuard, Session, UserSession } from '@thallesp/nestjs-better-auth';
import { RequestService } from './request.service';
import { Role } from '@prisma/client';
import { CreateRequestDto } from './domain/create-request.dto';
import { UpdateStatusDto } from './domain/update-status.dto';

@Controller('requests')
@UseGuards(AuthGuard)
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  /**
   * Fetch requests based on role. 
   * Admins/Heads see everything; Staff see only their own.
   */
  @Get()
  async getRequests(@Session() session: UserSession) {
    const { user } = session;
    
    const isManagement = user.role === Role.ADMIN || user.role === Role.HEAD;
    
    if (isManagement) {
      return this.requestService.findAll();
    }
    
    return this.requestService.findByUser(user.id);
  }

  /**
   * Create a new RACA request.
   */
  @Post()
  async createRequest(
    @Session() session: UserSession,
    @Body() createRequestDto: CreateRequestDto 
  ) {
    // Restricts Admins from filing to keep the database clean
    if (session.user.role === Role.ADMIN) {
      throw new ForbiddenException('Admins should manage schedules directly in the Schedule module.');
    }

    return this.requestService.create(session.user.id, createRequestDto);
  }

  /**
   * Update Request Status (Multi-Admin Approval logic).
   * Restricted to ADMIN and HEAD roles.
   */
  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string, // Validate UUID format
    @Body() updateStatusDto: UpdateStatusDto,
    @Session() session: UserSession
  ) {
    const { user } = session;

    // 1. Role Security Check
    const isAuthorized = user.role === Role.ADMIN || user.role === Role.HEAD;
    if (!isAuthorized) {
      throw new ForbiddenException('Only Admins or Department Heads can approve requests.');
    }

    // 2. Call Service with all 3 required arguments:
    // - id: The Request ID
    // - status: 'APPROVED' or 'DENIED' from the DTO
    // - user.id: The ID of the Admin/Head currently clicking the button
    return this.requestService.updateStatus(id, updateStatusDto.status, user.id);
  }
}