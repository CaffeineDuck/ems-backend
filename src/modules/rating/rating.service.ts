import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../commons/prisma/prisma.service';
import { CreateRatingDto } from './dto/create-rating.dto';

@Injectable()
export class RatingService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(userId: string, createRatingDto: CreateRatingDto) {
    const { serviceId, ...rest } = createRatingDto;
    const service = await this.prismaService.urgentService.findUnique({
      where: { id: serviceId },
      select: { workshopId: true, userId: true, completed: true },
    });

    if (!service?.completed)
      throw new ForbiddenException(
        'Rating can not be given before service ends',
      );

    if (service.userId !== userId)
      throw new ForbiddenException('User can not rate this service');

    const { workshopId } = service;

    return this.prismaService.rating.create({
      data: {
        workshop: { connect: { id: workshopId! } },
        user: { connect: { id: userId } },
        service: { connect: { id: serviceId } },
        ...rest,
      },
    });
  }

  async findAvgByWorkshop(workshopId: number) {
    return this.prismaService.rating.aggregate({
      _avg: { score: true },
      where: { workshopId },
    });
  }

  async findAllByWorkshop(workshopId: number) {
    return this.prismaService.rating.findMany({ where: { workshopId } });
  }

  async findOne(id: number) {
    return this.prismaService.rating.findUnique({ where: { id } });
  }
}
