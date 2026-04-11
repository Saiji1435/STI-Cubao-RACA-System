import { 
  Controller, Get, Post, Body, UseInterceptors, UploadedFile, 
  ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, UseGuards 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { RacaService } from './raca.service';
import { CreateRacaDto } from './domain/create-raca.dto';
import { AuthGuard } from '@thallesp/nestjs-better-auth';

@Controller('raca')
export class RacaController {
  constructor(private readonly racaService: RacaService) {}

  @Get()
  @UseGuards(AuthGuard)
  findAll() {
    return this.racaService.findAll();
  }

  // Requestor Submits RACA
  @Post('upload-raca')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('signature', {
    storage: diskStorage({
      destination: './apps/web/components/signatures',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        callback(null, `sig-req-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  create(
    @Body() createRacaDto: CreateRacaDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.racaService.createWithWorkflow(createRacaDto, file.path);
  }

  // NEW: Approver Signs RACA (Head or Admin)
  @Post('approve')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('signature', {
    storage: diskStorage({
      destination: './apps/web/components/signatures',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        callback(null, `sig-appr-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  approve(
    @Body('racaId') racaId: string,
    @Body('approverId') approverId: string,
    @Body('role') role: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.racaService.approveRaca(racaId, approverId, role, file.path);
  }

  @Post('scan')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async scanFile(@UploadedFile() file: Express.Multer.File) {
    return this.racaService.scanFileAndSuggestItems(file);
  }
}