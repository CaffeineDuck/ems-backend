import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { HasRoles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserId } from './decorators/user-id.decorator';
import { UserOnboardDto } from './dto/user-onboard.dto';
import { UserUpdateEmailDto } from './dto/user-update-email.dto';
import { UserUpdatePhoneDto } from './dto/user-update-phone.dto';
import { UserProfile } from './entity/user-profile.entity';
import { UsersService } from './users.service';

@Controller()
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Get the current logged in user profile
   */
  @Get('profile')
  @HasRoles(Role.USER)
  @ApiOkResponse({ type: UserProfile, description: 'User profile' })
  async profile(@UserId() userId: string) {
    return this.usersService.getProfile(userId);
  }

  /**
   * Onboard the user after registration
   */
  @Post('onboard')
  @HasRoles(Role.USER)
  async onboard(
    @UserId() userId: string,
    @Body() userOnBoardDto: UserOnboardDto,
  ) {
    return this.usersService.onBoard(userId, userOnBoardDto);
  }

  /**
   * Update user email
   */
  @Patch('email')
  async updateEmail(
    @UserId() userId: string,
    @Body() { email }: UserUpdateEmailDto,
  ) {
    return this.usersService.updateEmail(userId, email);
  }

  /**
   * Update user phone
   */
  @Patch('phone')
  async updatePhone(
    @UserId() userId: string,
    @Body() { phone }: UserUpdatePhoneDto,
  ) {
    return this.usersService.updatePhone(userId, phone);
  }
}
