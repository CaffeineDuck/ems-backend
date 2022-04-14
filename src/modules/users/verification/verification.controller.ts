import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { HasRoles } from 'src/modules/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { UserId } from '../decorators/user-id.decorator';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { VerifyService } from './services/verify.service';

@Controller()
@ApiBearerAuth()
@ApiTags('users-verification')
@UseGuards(JwtAuthGuard)
@HasRoles(Role.USER)
export class VerificationController {
  constructor(private readonly verifyService: VerifyService) {}

  /**
   * Get the user verification status
   */
  @Get('status')
  @HasRoles(Role.USER)
  async verification(@UserId() userId: string) {
    return this.verifyService.getStatus(userId);
  }

  /**
   * Verify phone number
   */
  @Post('phone')
  @HasRoles(Role.USER)
  async verifyPhone(@UserId() userId: string, @Body() { otp }: VerifyOtpDto) {
    this.verifyService.verifyPhone(userId, otp);
  }

  /**
   * Verify user email
   */
  @Post('email')
  async verifyEmail(@UserId() userId: string, @Body() { otp }: VerifyOtpDto) {
    this.verifyService.verifyEmail(userId, otp);
  }
}
