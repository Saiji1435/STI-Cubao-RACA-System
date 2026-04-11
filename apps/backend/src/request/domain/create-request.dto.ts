import { IsNotEmpty, IsString, IsInt, IsOptional } from 'class-validator';

export class CreateRequestDto {
  @IsNotEmpty()
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsInt()
  roomId!: number;

  @IsNotEmpty()
  @IsString()
  userId!: string;

  @IsOptional()
  @IsString()
  status?: string; 
}