import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { OtpFlowDto } from './dto/otp/flow.dto';
import { VerifyOtpDto } from './dto/otp/verify.dto';
import { TokensDto } from './dto/tokens.dto';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Start the authentication flow for both login and register.
   */
  @Post('flow')
  async otpFlow(@Body() otpFlowDto: OtpFlowDto): Promise<{ userId: string }> {
    const userId = await this.authService.authFlow(otpFlowDto);
    return { userId };
  }

  /**
   * Verify the started authentication flow using otp.
   */
  @Post('verify')
  @ApiCreatedResponse({ type: TokensDto })
  async verify(@Body() verifyOtpDto: VerifyOtpDto): Promise<TokensDto> {
    return this.authService.verifyOtp(verifyOtpDto);
  }
}
