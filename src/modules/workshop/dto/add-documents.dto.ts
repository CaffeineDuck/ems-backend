import { IsString } from 'class-validator';

export class AddDocumentsDto {
  @IsString()
  citizenShipId: string;

  @IsString()
  citizenshipImage: string;

  @IsString()
  panNumber: string;

  @IsString()
  panImage: string;

  @IsString()
  vatNumber: string;

  @IsString()
  vatImage: string;

  @IsString()
  shopImage: string;
}
