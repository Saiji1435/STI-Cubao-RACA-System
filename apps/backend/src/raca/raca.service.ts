import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../core/prisma/prisma.service';
import { CreateRacaDto } from './domain/create-raca.dto';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class RacaService {
  constructor(private prisma: PrismaService) {}

  // 1. Used by Controller.getFiles (ADMIN/HEAD)
  async findAll() {
    return this.prisma.raca.findMany({
      include: { room: true, requestor: true, approvals: { include: { approver: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  // 2. Used by Controller.getFiles (STAFF/FACULTY)
  async findByUser(userId: string) {
    return this.prisma.raca.findMany({
      where: { requestorId: userId },
      include: { room: true, approvals: { include: { approver: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  // 3. Used by Controller.adminEdit
  async updateOfficialRecord(id: string) {
    const existing = await this.prisma.raca.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('RACA not found');
    return this.prisma.raca.update({ where: { id }, data: { updatedAt: new Date() } });
  }

  // 4. Used by Controller.uploadFile
  async scanFileAndSuggestItems(file: Express.Multer.File) {
    return { message: 'Scanned', suggestedItems: [], tempFilePath: file.path };
  }

  // 5. Your Workflow Logic
  async createWithWorkflow(dto: CreateRacaDto, signaturePath: string) {
    const minLeadTime = new Date();
    minLeadTime.setDate(minLeadTime.getDate() + 14);
    if (new Date(dto.startDate) < minLeadTime) {
      throw new BadRequestException('RACA must be filed at least 2 weeks before the event.');
    }
    return this.prisma.raca.create({
      data: {
        natureOfActivity: dto.natureOfActivity,
        objectives: dto.objectives,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        expectedAudience: Number(dto.expectedAudience),
        speaker: dto.speaker,
        roomId: dto.roomId ? Number(dto.roomId) : null,
        otherVenue: dto.otherVenue,
        requestorId: dto.userId,
        status: 'PENDING_HEAD_APPROVAL',
        approvals: {
          create: {
            approverId: dto.userId,
            roleType: 'STAFF', 
            signatureUrl: signaturePath,
            status: 'SIGNED_BY_REQUESTOR'
          }
        }
      }
    });
  }

  // 6. Final Approval & PDF Trigger
  async approveRaca(racaId: string, approverId: string, role: string, signaturePath: string) {
    const raca = await this.prisma.raca.findUnique({ where: { id: racaId } });
    if (!raca) throw new NotFoundException('RACA not found');

    let nextStatus = raca.status;
    if (role === 'HEAD') nextStatus = 'PENDING_ADMIN_APPROVAL';
    if (role === 'ADMIN') nextStatus = 'APPROVED';

    const updated = await this.prisma.raca.update({
      where: { id: racaId },
      data: {
        status: nextStatus,
        approvals: { create: { approverId, roleType: role as any, signatureUrl: signaturePath, status: 'APPROVED' } }
      }
    });

    if (nextStatus === 'APPROVED') await this.generateRacaPdf(racaId);
    return updated;
  }

  private async generateRacaPdf(racaId: string) {
    // ... (Your PDF generation code)
  }
}