import { IsString, IsInt, IsOptional, Min, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateItemDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsInt()
  @Min(0)
  quantity!: number;

  @IsInt()
  @IsOptional()
  roomId?: number;
}