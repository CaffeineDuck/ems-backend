import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { PrismaService } from 'src/modules/commons/prisma/prisma.service';
import { UrgentQueryService } from 'src/modules/raw-query/services/urgent-query.service';
import { RequestUrgentJob } from './entities/urgent.entity';

@Processor('urgent')
export class UrgentConsumer {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly urgentQueryService: UrgentQueryService,
  ) {}

  @Process()
  async handle(job: Job<RequestUrgentJob>) {
    const { userId, workshopId, lat, lng, ...rest } = job.data;
    await this.prismaService.$transaction(async (prisma) => {
      const urgentService = await this.prismaService.urgentService.create({
        data: {
          user: { connect: { id: userId } },
          workshop: { connect: { id: workshopId } },
          cancelled: true,
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
  }
}
