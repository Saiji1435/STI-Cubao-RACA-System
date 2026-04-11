import { IsDate, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateScheduleDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @Type(() => Date)
  @IsDate()
  startTime!: Date;

  @Type(() => Date)
  @IsDate()
  endTime!: Date;

  @IsNumber()
  roomId!: number; 

  @IsNumber()
  @Min(1)
  attendees!: number; // 👈 Added for Capacity Check

  @IsOptional()
  @IsString()
  racaId?: string;
}