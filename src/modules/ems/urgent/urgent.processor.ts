import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { EmistriLogger } from 'src/modules/commons/logger/logger.service';
import { PrismaService } from 'src/modules/commons/prisma/prisma.service';
import { UrgentQueryService } from 'src/modules/raw-query/services/urgent-query.service';
import { RequestUrgentJob } from './entities/urgent.entity';

@Processor('urgentService')
export class UrgentConsumer {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly urgentQueryService: UrgentQueryService,
    private readonly loggerService: EmistriLogger,
  ) {}

  @Process('cancelRequest')
  async handle(job: Job<RequestUrgentJob>) {
    this.loggerService.debug(`[handleCancelRequest] Running Job ${job.id}`);

    const { userId, workshopId, lat, lng, ...rest } = job.data;
    await this.prismaService.$transaction(async (prisma) => {
      const urgentService = await this.prismaService.urgentService.create({
        data: {
          user: { connect: { id: userId } },
          workshop: { connect: { id: workshopId } },
          rejected: true,
          completed: true,
          ...rest,
        },
      });

      await this.urgentQueryService.updateEndLocation(
        prisma,
        urgentService.id,
        lat,
        lng,
      );
    });

    this.loggerService.log('[handleCancelRequest] Job completed');
  }
}
