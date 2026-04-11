import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../core/prisma/prisma.service';
import { CreateRacaDto } from './domain/create-raca.dto';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import pdf = require('pdf-parse');

@Injectable()
export class RacaService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.raca.findMany({
      include: { 
        room: true, 
        requestor: true, 
        approvals: { include: { approver: true } } 
      },
      orderBy: { createdAt: 'desc' }
    });
  }

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
        approvals: {
          create: {
            approverId: approverId,
            roleType: role as any,
            signatureUrl: signaturePath,
            status: 'APPROVED'
          }
        }
      }
    });

    // If this was the final approval, generate the PDF automatically
    if (nextStatus === 'APPROVED') {
      await this.generateRacaPdf(racaId);
    }

    return updated;
  }

  // --- THE PDF GENERATOR (Matches your image format) ---
  private async generateRacaPdf(racaId: string) {
    const raca = await this.prisma.raca.findUnique({
      where: { id: racaId },
      include: { requestor: true, approvals: { include: { approver: true } }, room: true }
    });

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]); // Standard Letter size
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // 1. Draw Header Box
    page.drawRectangle({ x: 50, y: 700, width: 512, height: 60, borderWidth: 2, borderColor: rgb(0,0,0) });
    page.drawText('STI ACADEMIC CENTER CUBAO', { x: 180, y: 725, size: 20, font: boldFont });
    page.drawText('REQUEST FOR APPROVAL OF CAMPUS ACTIVITY/VENUE', { x: 155, y: 685, size: 11, font });

    // 2. Main Content Details
    const startY = 640;
    const lineSpacing = 30;

    page.drawText(`Date of filing: ${raca.createdAt.toLocaleDateString()}`, { x: 60, y: startY, size: 11 });
    page.drawText(`I. Nature of Activity and Theme: ${raca.natureOfActivity}`, { x: 60, y: startY - lineSpacing, size: 11 });
    page.drawText(`II. Objectives: ${raca.objectives}`, { x: 60, y: startY - (lineSpacing * 2), size: 11 });
    page.drawText(`III. Date and Time: ${raca.startDate.toLocaleString()} to ${raca.endDate.toLocaleString()}`, { x: 60, y: startY - (lineSpacing * 3), size: 11 });
    page.drawText(`IV. Venue: ${raca.room?.name || raca.otherVenue}`, { x: 60, y: startY - (lineSpacing * 4), size: 11 });
    page.drawText(`V. Equipment: Matches scanned inventory items`, { x: 60, y: startY - (lineSpacing * 5), size: 11 });

    // 3. Signature Mapping Logic
    for (const app of raca.approvals) {
      if (!app.signatureUrl) continue;
      
      const sigImage = await pdfDoc.embedPng(readFileSync(app.signatureUrl));
      let x = 60; let y = 350; 
      let label = "";

      if (app.roleType === 'STAFF') { x = 60; label = "Requestor"; }
      if (app.roleType === 'HEAD') { x = 420; label = "Dept Head"; }
      if (app.roleType === 'ADMIN') { x = 420; y = 250; label = "School Admin"; }

      page.drawImage(sigImage, { x, y: y + 10, width: 100, height: 40 });
      page.drawText(app.approver.name || '', { x, y: y - 5, size: 9, font: boldFont });
      page.drawText(label, { x, y: y - 15, size: 8, font });
    }

    // 4. Save to the Web Public folder for instant download
    const dir = './apps/web/public/generated';
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    const fileName = `RACA_${raca.id}.pdf`;
    const pdfBytes = await pdfDoc.save();
    writeFileSync(join(dir, fileName), pdfBytes);

    // Update DB with the public URL
    await this.prisma.raca.update({
      where: { id: racaId },
      data: { filePath: `/generated/${fileName}` }
    });
  }

  async scanFileAndSuggestItems(file: Express.Multer.File) {
    // ... (Keep your existing scan logic here)
  }
}