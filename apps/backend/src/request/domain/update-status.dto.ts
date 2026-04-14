import { IsEnum, IsNotEmpty } from 'class-validator';

export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DENIED = 'DENIED',
}

export class UpdateStatusDto {
  @IsNotEmpty()
  @IsEnum(RequestStatus, {
    message: 'Status must be PENDING, APPROVED, or DENIED',
  })
  status!: RequestStatus;
}