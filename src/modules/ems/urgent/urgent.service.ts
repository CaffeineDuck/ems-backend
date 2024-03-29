import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/modules/commons/prisma/prisma.service';
import { UrgentQueryService } from 'src/modules/raw-query/services/urgent-query.service';
import { StopUrgentDto } from './dto/stop-urgent.dto';
import { RequestUrgentDto } from './dto/request-urgent.dto';
import { NotificationService } from 'src/modules/commons/notification/notification.service';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { randomUUID } from 'crypto';
import { RequestUrgentJob } from './entities/urgent.entity';

@Injectable()
export class UrgentService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly urgentQuery: UrgentQueryService,
    private readonly notificationService: NotificationService,
    @InjectQueue('urgentService') private readonly urgentQueue: Queue,
  ) {}

  async requestService(userId: string, requestUrgentDto: RequestUrgentDto) {
    const workshopUser = await this.prismaService.user.findUnique({
      where: { workshopId: requestUrgentDto.workshopId },
    });
    if (!workshopUser || workshopUser.id)
      throw new ForbiddenException('Workshop not found');

    const existingService = await this.prismaService.urgentService.findFirst({
      where: { OR: [{ userId }, { workshopId: requestUrgentDto.workshopId }] },
      select: { id: true },
    });
    if (existingService)
      throw new ForbiddenException(
        'User or workshop has a open urgent service',
      );

    const job = await this.urgentQueue.add(
      `cancelRequest`,
      { userId, ...requestUrgentDto } as RequestUrgentJob,
      { delay: 1000 * 60, jobId: randomUUID() },
    );

    await this.notificationService.sendNotifToUser(workshopUser.id, {
      apns: { aps: {}, data: { requestId: job.id } },
    });
  }

  async acceptRequest(workshopUserId: string, requestId: string) {
    // Getting the job data
    const job = await this.urgentQueue.getJob(requestId);
    if (!job || (await job?.finished()))
      throw new BadRequestException('Request ID does not exist or has expired');
    const { lat, lng, workshopId, userId, ...service }: RequestUrgentJob =
      job.data;

    // Check if the workshop belongs to the user
    const workshop = await this.prismaService.workshop.findUnique({
      where: { id: workshopId },
      select: { ownerId: true },
    });
    if (!workshop || workshop.ownerId !== workshopUserId)
      throw new ForbiddenException('User not the given workshop owner');

    // Create urgent service as transaction as it may fail at any time
    const createdServiceId = await this.prismaService.$transaction(
      async (prisma) => {
        const urgentService = await prisma.urgentService.create({
          data: {
            workshop: { connect: { id: workshopId } },
            ...service,
            user: { connect: { id: userId } },
          },
        });

        await this.urgentQuery.updateEndLocation(
          prisma,
          urgentService.id,
          lat,
          lng,
        );

        return urgentService.id;
      },
    );

    // Send notification to the user requesting the data
    await this.notificationService.sendNotifToUser(userId, {
      apns: { aps: {}, data: { urgentServiceId: createdServiceId } },
    });

    // Removing job as it's no longer necessary to cancel the request
    await job.remove();

    return createdServiceId;
  }

  async rejectRequest(workshopUserId: string, requestId: string) {
    const job = await this.urgentQueue.getJob(requestId);
    if (!job) throw new BadRequestException('No request with that ID found');

    const { userId, workshopId }: RequestUrgentJob = job.data;

    const workshop = await this.prismaService.workshop.findUnique({
      where: { id: workshopId },
    });
    if (workshop?.ownerId !== workshopUserId) {
      throw new ForbiddenException('User not allowed to cancel this request');
    }

    await this.notificationService.sendNotifToUser(userId, {
      apns: { aps: {}, data: { message: 'request rejected' } },
    });
  }

  async stopService(userId: string, stopServiceDto: StopUrgentDto) {
    const { id, ...service } = stopServiceDto;

    const getUrgent = this.prismaService.urgentService.findUnique({
      where: { id },
      select: { workshopId: true, completed: true },
    });
    const getUser = this.prismaService.workshop.findUnique({
      where: { ownerId: userId },
    });
    const [urgentService, workshopUser] = await this.prismaService.$transaction(
      [getUrgent, getUser],
    );

    if (urgentService?.workshopId !== workshopUser?.id)
      throw new ForbiddenException('Service not found for current workshop');
    if (urgentService?.completed)
      throw new BadRequestException('Urgent service has already ended');

    return this.prismaService.urgentService.update({
      where: { id },
      data: {
        endTime: new Date(),
        ...service,
      },
    });
  }

  async cancelRequest(userId: string, requestId: string) {
    const job = await this.urgentQueue.getJob(requestId);

    // Check for job existance and if user is allowed to cancel it
    if (!job) throw new BadRequestException('No request with that ID found');
    if (job.data.userId !== userId)
      throw new ForbiddenException('User not allowed to cancel this request');

    // Cancel the job
    const { workshopId }: RequestUrgentJob = job.data;
    await job.remove();

    // Get userid from workshopId
    const workshop = await this.prismaService.workshop.findUnique({
      where: { id: workshopId },
      select: { ownerId: true },
    });
    if (!workshop) throw new BadRequestException('Workshop not found');

    // Send notification to the workshop regarding cancellation
    await this.notificationService.sendNotifToUser(workshop.ownerId, {
      apns: { data: { message: 'request cancelled' }, aps: {} },
    });
  }

  async getLocation(id: string) {
    return this.urgentQuery.getLocation(this.prismaService, id);
  }

  async updateLocation(id: string, lat: number, lng: number) {
    return this.urgentQuery.updateLocation(this.prismaService, id, lat, lng);
  }
}
