import { IsLatitude, IsLongitude, IsNumber } from 'class-validator';

export class UpdateLocationDto {
  @IsNumber()
  id: string;

  @IsLatitude()
  lat: number;

  @IsLongitude()
  lng: number;
}
