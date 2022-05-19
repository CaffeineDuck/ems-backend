import { IsString } from 'class-validator';

export class CreateProfileDto {
  @IsString()
  name: string;

  @IsString()
  address: string;
}
