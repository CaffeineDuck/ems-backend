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
import { UserId } from '../user/decorators/user-id.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { HasRoles } from '../auth/decorators/roles.decorator';
import { Role, VechileType } from '@prisma/client';
import { AddDocumentsDto } from './dto/add-documents.dto';
import { UpdateDocumentsDto } from './dto/update-documents.dto';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('workshop')
@ApiTags('workshop')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
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
  findOne(@Param('id') id: string) {
    return this.workshopService.findOne(+id);
  }

  /**
   * Update a workshop linked with the user
   */
  @Patch()
  @HasRoles(Role.WORKSHOP)
  update(
    @UserId() userId: string,
    @Body() updateWorkshopDto: UpdateWorkshopDto,
  ) {
    return this.workshopService.update(userId, updateWorkshopDto);
  }

  @Post('documents')
  @HasRoles(Role.WORKSHOP)
  addDocuments(
    @UserId() userId: string,
    @Body() addDocumentsDto: AddDocumentsDto,
  ) {
    return this.workshopService.addDocuments(userId, addDocumentsDto);
  }

  @Patch('documents')
  @HasRoles(Role.WORKSHOP)
  updateDocuments(
    @UserId() userId: string,
    @Body() updateDocumentsDto: UpdateDocumentsDto,
  ) {
    return this.workshopService.updateDocuments(userId, updateDocumentsDto);
  }
}
