import { Module } from '@nestjs/common';
import { UrgentService } from './urgent.service';
import { UrgentController } from './urgent.controller';

@Module({
  controllers: [UrgentController],
  providers: [UrgentService]
})
export class UrgentModule {}
