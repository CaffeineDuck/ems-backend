import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { WorkshopService } from './workshop.service';
import { CreateWorkshopDto } from './dto/create-workshop.dto';
import { UpdateWorkshopDto } from './dto/update-workshop.dto';
import { UserId } from '../users/decorators/user-id.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { HasRoles } from '../auth/decorators/roles.decorator';
import { Role, VechileType } from '@prisma/client';

@Controller('workshop')
@ApiTags('workshop')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class WorkshopController {
  constructor(private readonly workshopService: WorkshopService) {}

  /**
   * Create an workshop
   */
  @Post()
  create(
    @Body() createWorkshopDto: CreateWorkshopDto,
    @UserId() userId: string,
  ) {
    return this.workshopService.create(createWorkshopDto, userId);
  }

  /**
   * Find all workshops near you
   */
  @Get()
  @HasRoles(Role.WORKSHOP)
  findAll(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('vechile') vechile: VechileType,
  ) {
    return this.workshopService.findAll(+lat, +lng, vechile);
  }

  /**
   * Find an workshop by id
   */
  @Get(':id')
  @HasRoles(Role.WORKSHOP)
  findOne(@Param('id') id: string) {
    return this.workshopService.findOne(+id);
  }

  /**
   * Update a workshop
   */
  @Patch(':id')
  @HasRoles(Role.WORKSHOP)
  update(
    @Param('id') id: string,
    @Body() updateWorkshopDto: UpdateWorkshopDto,
  ) {
    return this.workshopService.update(+id, updateWorkshopDto);
  }
}
