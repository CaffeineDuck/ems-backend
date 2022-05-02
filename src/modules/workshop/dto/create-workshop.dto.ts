import { ApiProperty } from '@nestjs/swagger';
import { VechileType } from '@prisma/client';
import { IsEnum, IsLatitude, IsLongitude, IsString } from 'class-validator';

export class CreateWorkshopDto {
  @IsString()
  name: string;

  @IsString()
  location: string;

  @IsEnum(VechileType, { each: true })
  @ApiProperty({ enum: VechileType, isArray: true })
  vechileTypes: VechileType[];

  @IsLatitude()
  lat: number;

  @IsLongitude()
  lng: number;
}
