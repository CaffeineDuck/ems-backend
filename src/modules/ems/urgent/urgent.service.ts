import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/commons/prisma/prisma.service';
import { UrgentQueryService } from 'src/modules/raw-query/services/urgent-query.service';
import { StopUrgentDto } from './dto/stop-urgent.dto';
import { RequestUrgentDto } from './dto/request-urgent.dto';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { randomUUID } from 'crypto';
import { RequestUrgentJob } from './entities/urgent.entity';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class UrgentService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly urgentQuery: UrgentQueryService,
    @InjectQueue('urgentService') private readonly urgentQueue: Queue,
  ) {}

  getUrgentName(name: string): string {
    return `urgentService:${name}`;
  }

  async requestService(userId: string, requestUrgentDto: RequestUrgentDto) {
    const workshop = await this.prismaService.workshop.findUnique({
      where: { id: requestUrgentDto.workshopId },
      select: { ownerId: true },
    });
    if (!workshop) throw new WsException('Workshop not found');

    const existingService = await this.prismaService.urgentService.findFirst({
      where: {
        OR: [{ userId }, { workshop: { id: requestUrgentDto.workshopId } }],
        completed: false,
      },
      select: { id: true },
    });

    const existingJob = await this.urgentQueue.getDelayed();

    const found = await Promise.all(
      existingJob.map((job) => job.id.toString().startsWith(userId)),
    );

    if (existingService || found.some((existing) => existing === true))
      throw new WsException('User or workshop has a open urgent service');

    const randomJobId = `${userId}:${randomUUID()}`;
    const job = await this.urgentQueue.add(
      `cancelRequest`,
      { userId, ...requestUrgentDto } as RequestUrgentJob,
      { delay: 120 * 1000, jobId: randomJobId },
    );

    return [job.id, workshop.ownerId];
  }

  async acceptRequest(workshopUserId: string, requestId: string) {
    // Getting the job data
    const job = await this.urgentQueue.getJob(requestId);
    if (!job || !(await job?.isDelayed()))
      throw new WsException('Request ID does not exist or has expired');
    const { lat, lng, workshopId, userId, ...service }: RequestUrgentJob =
      job.data;

    // Check if the workshop belongs to the user
    const workshop = await this.prismaService.workshop.findUnique({
      where: { id: workshopId },
      select: { ownerId: true },
    });
    if (!workshop || workshop.ownerId !== workshopUserId)
      throw new WsException('User not the given workshop owner');

    // Create urgent service as transaction as it may fail at any time
    const createdServiceId = await this.prismaService.$transaction(
      async (prisma) => {
        const urgentService = await prisma.urgentService.create({
          data: {
            workshop: { connect: { id: workshopId } },
            ...service,
            started: true,
            startTime: new Date(),
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

    // Removing job as it's no longer necessary to cancel the request
    await job.remove();

    return createdServiceId;
  }

  async rejectRequest(workshopUserId: string, requestId: string) {
    const job = await this.urgentQueue.getJob(requestId);
    if (!job || !(await job?.isDelayed()))
      throw new WsException('No request with that ID found or has expired');

    const { workshopId }: RequestUrgentJob = job.data;

    const workshop = await this.prismaService.workshop.findUnique({
      where: { id: workshopId },
    });
    if (workshop?.ownerId !== workshopUserId) {
      throw new WsException('User not allowed to cancel this request');
    }

    await job.promote();
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
      throw new WsException('Service not found for current workshop');
    if (urgentService?.completed)
      throw new WsException('Urgent service has already ended');

    return this.prismaService.urgentService.update({
      where: { id },
      data: {
        endTime: new Date(),
        ...service,
        completed: true,
      },
    });
  }

  async cancelRequest(userId: string, requestId: string) {
    const job = await this.urgentQueue.getJob(requestId);

    // Check for job existance and if user is allowed to cancel it
    if (!job) throw new WsException('No request with that ID found');
    if (job.data.userId !== userId)
      throw new WsException('User not allowed to cancel this request');

    // Cancel the job
    const { workshopId }: RequestUrgentJob = job.data;
    await job.remove();

    // Get userid from workshopId
    const workshop = await this.prismaService.workshop.findUnique({
      where: { id: workshopId },
      select: { ownerId: true },
    });
    if (!workshop) throw new WsException('Workshop not found');

    return { ownerId: workshop.ownerId };
  }

  async reachedDestination(userId: string, serviceId: string) {
    const urgentService = await this.prismaService.urgentService.findUnique({
      where: { id: serviceId },
      select: {
        reachedDestination: true,
        workshop: { select: { ownerId: true } },
      },
    });

    if (urgentService?.workshop?.ownerId !== userId)
      throw new WsException(
        'Workshop not allowed to modify this urgent service',
      );

    if (urgentService?.reachedDestination)
      throw new WsException(
        'Already reached the destination once for this request',
      );

    return this.prismaService.urgentService.update({
      where: { id: serviceId },
      data: { reachedDestination: true },
      select: { userId: true },
    });
  }

  async getCurrentRequest(userId: string) {
    const currentRequest = await this.prismaService.urgentService.findFirst({
      where: {
        OR: [{ userId }, { workshop: { ownerId: userId } }],
        started: true,
        completed: false,
      },
      select: { id: true },
    });

    if (!currentRequest?.id)
      throw new WsException('User has no open urgent requests');

    return { serviceId: currentRequest.id };
  }

  async getLocation(id: string) {
    return this.urgentQuery.getLocation(this.prismaService, id);
  }

  async updateLocation(id: string, lat: number, lng: number) {
    return this.urgentQuery.updateLocation(this.prismaService, id, lat, lng);
  }
}
