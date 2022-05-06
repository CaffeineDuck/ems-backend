import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { HasRoles } from 'src/modules/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { WorkshopService } from './workshop.service';

@Controller('admin/workshop')
@ApiTags('admin-workshop')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@HasRoles(Role.ADMIN)
export class WorkshopController {
  constructor(private readonly workshopService: WorkshopService) {}

  @Get()
  findAll(@Query('verify') verify: boolean) {
    return this.workshopService.getWorkshops(verify);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workshopService.getWorkshop(+id);
  }

  @Get(':id/documents')
  findDocuments(@Param('id') id: string) {
    return this.workshopService.getWorkshopDocuments(+id);
  }

  @Patch(':id')
  verify(@Param('id') id: string, @Query('verify') verify: boolean) {
    return this.workshopService.verifyWorkshop(+id, verify);
  }
}
