import { Module } from '@nestjs/common';
import { UrgentModule } from './urgent/urgent.module';

@Module({
  imports: [UrgentModule]
})
export class EmServicesModule {}
