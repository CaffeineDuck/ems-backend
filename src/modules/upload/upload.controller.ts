// TODO: Make this a queue, too expensive task
import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Query,
  Get,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadService } from './upload.service';

@ApiTags('Uploads')
@Controller('uploads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class UploadsController {
  constructor(private uploadService: UploadService) {}

  @Get(':key')
  async getFile(@Param('key') key: string, @Query('time') time: string) {
    return this.uploadService.getSignedUrl(key, +time);
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  @Post()
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.uploadService.upload(file);
  }
}
