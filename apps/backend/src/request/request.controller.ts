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
    
    // UPDATED: Check for ANY role starting with ADMIN or HEAD
    const isManagement = user.role.startsWith('ADMIN') || user.role.startsWith('HEAD');
    
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
    // UPDATED: Restrict any ADMIN variant from filing (keeps DB clean for STI Cubao)
    if (session.user.role.startsWith('ADMIN')) {
      throw new ForbiddenException('Admins should manage schedules directly in the Schedule module.');
    }

    return this.requestService.create(session.user.id, createRequestDto);
  }

  /**
   * Update Request Status (Multi-Admin Approval logic).
   * Restricted to specific ADMIN and HEAD roles.
   */
  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateStatusDto: UpdateStatusDto,
    @Session() session: UserSession
  ) {
    const { user } = session;

    // UPDATED: Dynamic role check for approval permissions
    const isAuthorized = user.role.startsWith('ADMIN') || user.role.startsWith('HEAD');
    
    if (!isAuthorized) {
      throw new ForbiddenException('Only Admins or Department Heads can approve requests.');
    }

    // Pass Request ID, the new Status, and the Signatory's ID
    return this.requestService.updateStatus(id, updateStatusDto.status, user.id);
  }
}