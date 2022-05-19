import { Module } from '@nestjs/common';
import { WorkshopService } from './workshop.service';
import { WorkshopController } from './workshop.controller';

@Module({
  controllers: [WorkshopController],
  providers: [WorkshopService]
})
export class WorkshopModule {}
