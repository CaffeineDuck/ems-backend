import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserId } from './decorators/user-id.decorator';
import { UserUpdateEmailDto } from './dto/user-update-email.dto';
import { UserUpdatePhoneDto } from './dto/user-update-phone.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { UserVerificationStatus } from './entity/user-verification.entity';
import { UserService } from './user.service';
import { VerifyService } from './verify/services/verify.service';

@Controller('user')
@ApiTags('user')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly userService: UserService,
    private readonly verifyService: VerifyService,
  ) {}

  /**
   * Get verfication status
   */
  @Get('verify')
  @ApiOkResponse({
    description: 'Get verification status',
    type: UserVerificationStatus,
  })
  async getVerificationStatus(@UserId() userId: string) {
    return this.userService.getVerificationStatus(userId);
  }

  /**
   * Update user email
   */
  @Patch('email')
  async updateEmail(
    @UserId() userId: string,
    @Body() { email }: UserUpdateEmailDto,
  ) {
    return this.userService.updateEmail(userId, email);
  }

  /**
   * Update user phone
   */
  @Patch('phone')
  async updatePhone(
    @UserId() userId: string,
    @Body() { phone }: UserUpdatePhoneDto,
  ) {
    return this.userService.updatePhone(userId, phone);
  }

  /**
   * Verify the updated phone
   */
  @Put('phone')
  async verifyPhone(@UserId() userId: string, @Body() { otp }: VerifyOtpDto) {
    const verified = await this.verifyService.verifyPhone(userId, otp);
    if (!verified) throw new BadRequestException('Invalid OTP');
  }

  /**
   * Verify the updated email
   */
  @Put('email')
  async verifyEmail(@UserId() userId: string, @Body() { otp }: VerifyOtpDto) {
    const verified = await this.verifyService.verifyEmail(userId, otp);
    if (!verified) throw new BadRequestException('Invalid OTP');
  }
}
