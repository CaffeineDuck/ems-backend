import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { HasRoles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserId } from '../user/decorators/user-id.decorator';
import { ClientService } from './client.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ClientProfile } from './entity/profile.entity';

@Controller('client')
@ApiTags('client')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@HasRoles(Role.USER)
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  /*
   * Get the profile of the currently logged in user
   */
  @Get('profile')
  @ApiOkResponse({
    description: 'Get user profile',
    type: ClientProfile,
  })
  async getProfile(@UserId() userId: string) {
    const profile = await this.clientService.getProfile(userId);
    if (!profile)
      throw new NotFoundException(
        'There is no profile linked with current user',
      );
    return profile;
  }

  /*
   * Create the profile of the currently logged in user
   */
  @Post('profile')
  @ApiCreatedResponse({
    description: 'Create user profile',
    type: ClientProfile,
  })
  async createProfile(
    @UserId() userId: string,
    @Body() createProfileDto: CreateProfileDto,
  ) {
    return this.clientService.createProfile(userId, createProfileDto);
  }

  /*
   * Update the profile of the currently logged in user
   */
  @Patch('profile')
  @ApiOkResponse({ description: 'Update profile', type: ClientProfile })
  async updateProfile(
    @UserId() userId: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.clientService.updateProfile(userId, updateProfileDto);
  }
}
