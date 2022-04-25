import { IsNumber, IsString } from 'class-validator';

export class StopServiceDto {
  @IsNumber()
  price: number;

  @IsString()
  description: string;
}
