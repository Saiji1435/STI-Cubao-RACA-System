import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  UseGuards, 
  ForbiddenException, 
  UseInterceptors, 
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard, Session, UserSession } from '@thallesp/nestjs-better-auth';
import { RacaService } from '../raca/raca.service';
import { Role } from '@prisma/client';

@Controller('raca')
@UseGuards(AuthGuard)
export class RacaController {
  constructor(private readonly racaService: RacaService) {}

  // 1. View Files: Role-based filtering
  @Get('files')
  async getFiles(@Session() session: UserSession) {
    const user = session.user;

    // ADMIN and LAB_CUSTODIAN see everything
    if (user.role === Role.ADMIN || user.role === Role.LAB_CUSTODIAN) {
      return this.racaService.findAll();
    }

    // STAFF can only see files where they are the owner
    // This assumes your findByUser method exists in the service
    // return this.racaService.findByUser(user.id); 
    return { message: 'Filtering for staff user', userId: user.id };
  }

  // 2. Scan/Upload: STAFF and LAB_CUSTODIAN can upload items
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
    // Role check: Only Staff and Lab Custodian allowed to upload
    if (session.user.role === Role.ADMIN) {
        throw new ForbiddenException('Admins review records; Staff/Custodians upload them.');
    }

    return this.racaService.scanFileAndSuggestItems(file);
  }

  // 3. Admin Edit: Only ADMINs can edit the final RACA data
  @Patch(':id/edit-official')
  async adminEdit(@Session() session: UserSession) {
    if (session.user.role !== Role.ADMIN) {
      throw new ForbiddenException('Only Admins can modify official RACA records.');
    }
    
    return { message: 'Official record updated by Admin' };
  }
}