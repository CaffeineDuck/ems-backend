import { Module } from '@nestjs/common';
import { WorkshopService } from './workshop.service';
import { WorkshopController } from './workshop.controller';
import { RawQueryModule } from '../raw-query/raw-query.module';

@Module({
  controllers: [WorkshopController],
  providers: [WorkshopService],
  imports: [RawQueryModule],
})
export class WorkshopModule {}
