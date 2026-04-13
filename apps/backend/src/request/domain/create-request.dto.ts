// create-request.dto.ts
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateRequestDto {
  @IsNotEmpty()
  @IsString()
  purpose!: string; // Maps to Schema 'title'

  @IsNotEmpty()
  @IsString()
  roomName!: string; // We will use this to find the roomId

  @IsOptional()
  @IsString()
  items?: string; // Maps to Schema 'description'

  @IsNotEmpty()
  @IsString()
  startTime!: string;

  @IsNotEmpty()
  @IsString()
  endTime!: string;
}