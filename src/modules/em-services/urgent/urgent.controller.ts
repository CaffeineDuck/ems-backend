import { Controller, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { HasRoles } from 'src/modules/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { UserId } from 'src/modules/user/decorators/user-id.decorator';
import { StartServiceDto } from './dto/start-service.dto';
import { StopServiceDto } from './dto/stop-service.dto';
import { UrgentService } from './urgent.service';

@Controller()
@ApiTags('urgent')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@HasRoles(Role.USER)
export class UrgentController {
  constructor(private readonly urgentService: UrgentService) {}

  @Post()
  async startUrgent(
    @UserId() userId: string,
    startServiceDto: StartServiceDto,
  ) {
    return this.urgentService.startService(userId, startServiceDto);
  }

  @Patch(':id')
  async stopUrgent(
    @Param('id') serviceId: string,
    @UserId() userId: string,
    stopServiceDto: StopServiceDto,
  ) {
    return this.urgentService.stopService(+serviceId, userId, stopServiceDto);
  }
}
