import { ApiProperty } from '@nestjs/swagger';
import { VechileType } from '@prisma/client';
import { IsEnum, IsLatitude, IsLongitude, IsNumber } from 'class-validator';

export class RequestUrgentDto {
  @IsEnum(VechileType)
  @ApiProperty({ enum: VechileType })
  vechileType: VechileType;

  @IsNumber()
  workshopId: number;

  @IsLatitude()
  lat: number;

  @IsLongitude()
  lng: number;
}
