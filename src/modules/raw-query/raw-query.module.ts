import { Module } from '@nestjs/common';
import { WorkshopQueryService } from './services/workshop-query.service';

@Module({
  providers: [WorkshopQueryService],
  exports: [WorkshopQueryService],
})
export class RawQueryModule {}
