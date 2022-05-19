import { CacheModule, Module } from '@nestjs/common';
import { UrgentService } from './urgent.service';
import { UrgentGateway } from './urgent.gateway';
import { RawQueryModule } from 'src/modules/raw-query/raw-query.module';
import { BullModule } from '@nestjs/bull';
import { UrgentController } from './urgent.controller';
import { UrgentConsumer } from './urgent.processor';

@Module({
  imports: [
    CacheModule.register(),
    RawQueryModule,
    BullModule.registerQueue({ name: 'urgentService' }),
  ],
  controllers: [UrgentController],
  providers: [UrgentService, UrgentGateway, UrgentConsumer],
})
export class UrgentModule {}
