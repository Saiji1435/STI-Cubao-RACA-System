import { IsNotEmpty, IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateEventLogDto {
  @IsNotEmpty()
  @IsString()
  action!: string;

  @IsNotEmpty()
  @IsString()
  summary!: string;

  @IsNotEmpty()
  @IsUUID()
  userId!: string;

  @IsOptional()
  @IsUUID()
  racaId?: string;
}