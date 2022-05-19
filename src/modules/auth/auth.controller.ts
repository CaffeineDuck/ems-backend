import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { OtpFlowDto } from './dto/otp/flow.dto';
import { VerifyOtpDto } from './dto/otp/verify.dto';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserIdDto } from './dto/userId.dto';
import { VerifyResponseDto } from './dto/verify-response.dto';
import { NotificationService } from '../commons/notification/notification.service';
import { Tokens } from './entities/tokens.entity';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Start the authentication flow for both login and register.
   */
  @Post('flow')
  @ApiCreatedResponse({ type: UserIdDto })
  async otpFlow(@Body() otpFlowDto: OtpFlowDto): Promise<UserIdDto> {
    const userId = await this.authService.authFlow(otpFlowDto);
    return { userId };
  }

  /**
   * Verify the started authentication flow using otp.
   */
  @Post('verify')
  @ApiCreatedResponse({ type: VerifyResponseDto })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiBadRequestResponse({
    description: 'OTP has not been requested for the number',
  })
  @ApiForbiddenResponse({
    description: 'Wrong OTP',
  })
  async verify(@Body() verifyOtpDto: VerifyOtpDto): Promise<VerifyResponseDto> {
    const tokens = await this.authService.verifyOtp(verifyOtpDto);
    const beamToken = this.notificationService.generateBeamsToken(
      verifyOtpDto.userId,
    );
    return { ...tokens, beamToken };
  }

  /**
   * Get the access token from the refreshToken
   */
  @Post('refresh')
  @ApiCreatedResponse({ type: Tokens })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiBadRequestResponse({
    description: 'Refresh token has expired',
  })
  @ApiForbiddenResponse({
    description: 'Token version changed (Password recovery flow)',
  })
  async refresh(@Body() tokensDto: Tokens): Promise<Tokens> {
    return this.authService.refreshToken(tokensDto.refreshToken);
  }
}
