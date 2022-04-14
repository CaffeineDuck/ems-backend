import { IsPhoneNumber } from 'class-validator';

export class OtpFlowDto {
  @IsPhoneNumber('NP')
  phoneNumber: string;
}
