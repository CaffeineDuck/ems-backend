import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { RatingService } from './rating.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { HasRoles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserId } from '../user/decorators/user-id.decorator';

@Controller('rating')
@ApiTags('rating')
@UseGuards(JwtAuthGuard, RolesGuard)
@HasRoles(Role.USER)
@ApiBearerAuth()
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Post()
  create(@UserId() userId: string, @Body() createRatingDto: CreateRatingDto) {
    return this.ratingService.create(userId, createRatingDto);
  }

  @Get('workshop/average/:id')
  findAverage(@Query('id') workshopId: string) {
    return this.ratingService.findAvgByWorkshop(+workshopId);
  }

  @Get('workshop/:id')
  findAll(@Query('id') workshopId: string) {
    return this.ratingService.findAllByWorkshop(+workshopId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ratingService.findOne(+id);
  }
}
