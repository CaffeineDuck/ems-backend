import { IsNumber, IsString, Max, Min } from 'class-validator';

export class CreateRatingDto {
  @IsNumber()
  @Max(10)
  @Min(1)
  score: number;

  @IsString()
  serviceId: string;

  @IsString()
  comment?: string;
}
