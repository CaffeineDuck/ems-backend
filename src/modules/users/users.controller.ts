import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { HasRoles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserId } from './decorators/user-id.decorator';
import { UserOnboardDto } from './dto/user-onboard.dto';
import { UsersService } from './users.service';

@Controller('users')
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
   * Get the user verification status
   */
  @Get('verification')
  @HasRoles(Role.USER)
  async verification(@UserId() userId: string) {
    return this.usersService.isVerified(userId);
  }
}
