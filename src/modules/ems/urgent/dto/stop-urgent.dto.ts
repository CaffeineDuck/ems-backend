import { IsNumber, IsString } from 'class-validator';

export class StopUrgentDto {
  @IsString()
  id: string;

  @IsNumber()
  price: number;

  @IsString()
  description: string;
}
