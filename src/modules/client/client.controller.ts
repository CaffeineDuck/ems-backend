import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { HasRoles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserId } from '../users/decorators/user-id.decorator';
import { UserProfile } from '../users/entity/user-profile.entity';
import { ClientService } from './client.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('client')
@ApiTags('client')
@ApiBearerAuth()
@ApiUnauthorizedResponse()
@UseGuards(JwtAuthGuard)
@HasRoles(Role.USER)
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  /*
   * Get the profile of the currently logged in user
   */
  @Get('profile')
  @ApiCreatedResponse({ type: UserProfile, description: 'Get user profile' })
  async getProfile(@UserId() userId: string) {
    return this.clientService.getProfile(userId);
  }

  /*
   * Get the profile of the currently logged in user
   */
  @Post('profile')
  @ApiOkResponse({ type: UserProfile, description: 'Create user profile' })
  async createProfile(
    @UserId() userId: string,
    @Body() createProfileDto: CreateProfileDto,
  ) {
    return this.clientService.createProfile(userId, createProfileDto);
  }

  /*
   * Get the profile of the currently logged in user
   */
  @Patch('profile')
  @ApiOkResponse({ type: UserProfile, description: 'Update user profile' })
  async updateProfile(
    @UserId() userId: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.clientService.updateProfile(userId, updateProfileDto);
  }
}
