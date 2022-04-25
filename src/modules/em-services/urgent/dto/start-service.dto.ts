import { VechileType } from '@prisma/client';
import { IsEnum, IsNumber } from 'class-validator';

export class StartServiceDto {
  @IsNumber()
  workShopId: number;

  @IsEnum(VechileType)
  vechileType: VechileType;

  @IsNumber()
  distance: number;
}
