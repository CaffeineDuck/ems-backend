import { Module } from '@nestjs/common';
import { UrgentQueryService } from './services/urgent-query.service';
import { WorkshopQueryService } from './services/workshop-query.service';

@Module({
  providers: [WorkshopQueryService, UrgentQueryService],
  exports: [WorkshopQueryService, UrgentQueryService],
})
export class RawQueryModule {}
