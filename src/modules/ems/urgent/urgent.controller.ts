import { Query, Body, Controller, Post, UseGuards, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { HasRoles } from 'src/modules/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { UserId } from 'src/modules/user/decorators/user-id.decorator';
import { RequestUrgentDto } from './dto/request-urgent.dto';
import { StopUrgentDto } from './dto/stop-urgent.dto';
import { UrgentService } from './urgent.service';

@Controller('ems/urgent')
@ApiTags('ems-urgent')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UrgentController {
  constructor(private readonly urgentService: UrgentService) {}

  @Post('request')
  @HasRoles(Role.USER)
  async requestUrgent(
    @UserId() userId: string,
    @Body() requestUrgent: RequestUrgentDto,
  ) {
    return this.urgentService.requestService(userId, requestUrgent);
  }

  @Get('reject')
  async rejectUrgent(
    @UserId() userId: string,
    @Query('requestId') requestId: string,
  ) {
    return this.urgentService.rejectRequest(userId, requestId);
  }

  @Get('accept')
  @HasRoles(Role.WORKSHOP)
  async acceptUrgent(
    @UserId() userId: string,
    @Query('requestId') requestId: string,
  ) {
    return this.urgentService.acceptRequest(userId, requestId);
  }

  @Post('end')
  @HasRoles(Role.WORKSHOP)
  async endRide(
    @UserId() userId: string,
    @Body() stopUrgentDto: StopUrgentDto,
  ) {
    return this.urgentService.stopService(userId, stopUrgentDto);
  }

  @Get('cancel')
  @HasRoles(Role.USER)
  async cancelRequest(
    @Query('requestId') requestId: string,
    @UserId() userId: string,
  ) {
    return this.urgentService.cancelRequest(userId, requestId);
  }
}
