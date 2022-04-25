import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/commons/prisma/prisma.service';
import { StartServiceDto } from './dto/start-service.dto';
import { StopServiceDto } from './dto/stop-service.dto';

@Injectable()
export class UrgentService {
  constructor(private readonly prismaService: PrismaService) {}

  async startService(userId: string, startServiceDto: StartServiceDto) {
    const { workShopId, ...service } = startServiceDto;

    const existingService = await this.prismaService.urgentService.findUnique({
      where: { userId },
    });

    if (existingService)
      throw new ForbiddenException('You already have a service open');

    return this.prismaService.urgentService.create({
      data: {
        ...service,
        user: { connect: { id: userId } },
        workShop: { connect: { id: workShopId } },
      },
    });
  }

  async stopService(
    serviceId: number,
    userId: string,
    stopServiceDto: StopServiceDto,
  ) {
    return this.prismaService.urgentService.update({
      where: { id: serviceId, userId: userId },
      data: {
        endTime: new Date(),
        ...stopServiceDto,
      },
    });
  }
}
