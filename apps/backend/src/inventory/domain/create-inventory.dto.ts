import { IsString, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInventoryDto {
  @IsString()
  itemName!: string;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  quantity!: number;

  @IsInt()
  @Type(() => Number)
  roomId!: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}