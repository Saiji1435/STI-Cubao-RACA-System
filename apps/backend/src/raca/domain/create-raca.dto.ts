import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRacaDto {
  @IsString()
  @IsNotEmpty()
  natureOfActivity!: string;

  @IsString()
  @IsNotEmpty()
  objectives!: string;

  @Type(() => Date)
  startDate!: Date;

  @Type(() => Date)
  endDate!: Date;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  expectedAudience?: number;

  @IsOptional()
  @IsString()
  speaker?: string;

  @IsOptional()
  @Type(() => Number)
  roomId?: number;

  @IsOptional()
  @IsString()
  otherVenue?: string;

  @IsString()
  @IsNotEmpty()
  userId!: string; // The requestor's ID
}