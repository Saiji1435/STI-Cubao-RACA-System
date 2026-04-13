import { 
  Controller, Get, Post, Patch, UseGuards, ForbiddenException, 
  UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, 
  FileTypeValidator, Param, Body 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard, Session, UserSession } from '@thallesp/nestjs-better-auth';
import { RacaService } from './raca.service';
import { Role } from '@prisma/client';

@Controller('raca')
@UseGuards(AuthGuard)
export class RacaController { // Ensure 'export' is here
  constructor(private readonly racaService: RacaService) {}

  @Get('files')
  async getFiles(@Session() session: UserSession) {
    const { user } = session;
    if (user.role === Role.ADMIN || user.role === Role.HEAD) {
      return this.racaService.findAll();
    }
    return this.racaService.findByUser(user.id);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Session() session: UserSession,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
          new FileTypeValidator({ fileType: /(pdf|text\/plain)/ }),
        ],
      }),
    ) file: Express.Multer.File,
  ) {
    if (session.user.role === Role.ADMIN) {
        throw new ForbiddenException('Admins review records; Faculty/Staff upload them.');
    }
    return this.racaService.scanFileAndSuggestItems(file);
  }

  @Patch(':id/edit-official')
  async adminEdit(@Param('id') id: string, @Session() session: UserSession) {
    if (session.user.role !== Role.ADMIN && session.user.role !== Role.HEAD) {
      throw new ForbiddenException('Unauthorized.');
    }
    return this.racaService.updateOfficialRecord(id); 
  }
}