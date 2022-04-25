import { VechileType } from '@prisma/client';
import { IsEnum, IsLatitude, IsLongitude, IsString } from 'class-validator';

export class CreateWorkshopDto {
  @IsString()
  name: string;

  @IsString()
  location: string;

  @IsEnum(VechileType)
  vechileType: VechileType;

  @IsLatitude()
  lat: number;

  @IsLongitude()
  lng: number;
}
