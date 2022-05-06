import { Module } from '@nestjs/common';
import { WorkshopModule } from './workshop/workshop.module';

@Module({
  imports: [WorkshopModule]
})
export class AdminModule {}
