import { ForbiddenException, Injectable } from '@nestjs/common';
import { Role, VechileType } from '@prisma/client';
import { PrismaService } from '../commons/prisma/prisma.service';
import { WorkshopQueryService } from '../raw-query/services/workshop-query.service';
import { AddDocumentsDto } from './dto/add-documents.dto';
import { CreateWorkshopDto } from './dto/create-workshop.dto';
import { UpdateDocumentsDto } from './dto/update-documents.dto';
import { UpdateWorkshopDto } from './dto/update-workshop.dto';

@Injectable()
export class WorkshopService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly workshopQueryService: WorkshopQueryService,
  ) {}

  async create(createWorkshopDto: CreateWorkshopDto, userId: string) {
    const { lat, lng, ...workshop } = createWorkshopDto;
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: { onBoarded: true },
    });

    if (user?.onBoarded)
      throw new ForbiddenException('User has already onboarded');

    const workshopCreated = await this.prismaService.$transaction(
      async (prisma) => {
        const createdWorkshop = await prisma.user.update({
          where: { id: userId },
          data: {
            workshop: { create: workshop },
            onBoarded: true,
            role: Role.WORKSHOP,
          },
          select: { workshop: true },
        });
        if (!createdWorkshop || !createdWorkshop.workshop)
          throw new ForbiddenException('User is not a workshop');

        await this.workshopQueryService.addGeolocation(
          prisma,
          createdWorkshop.workshop.id,
          lat,
          lng,
        );

        return createdWorkshop;
      },
    );

    return workshopCreated;
  }

  async findAll(lat: number, lng: number, vechile: VechileType) {
    return this.workshopQueryService.findAll(
      this.prismaService,
      lat,
      lng,
      vechile,
    );
  }

  async findOne(id: number) {
    return this.prismaService.workshop.findUnique({
      where: { id },
    });
  }

  async update(userId: string, updateWorkshopDto: UpdateWorkshopDto) {
    return this.prismaService.workshop.update({
      where: { ownerId: userId },
      data: updateWorkshopDto,
    });
  }

  async addDocuments(userId: string, documents: AddDocumentsDto) {
    return this.prismaService.workshop.update({
      where: { ownerId: userId },
      data: { documents: { create: documents } },
    });
  }

  async updateDocuments(userId: string, documents: UpdateDocumentsDto) {
    const workshopId = await this.prismaService.workshop.findUnique({
      where: { ownerId: userId },
      select: { id: true },
    });

    if (!workshopId) throw new ForbiddenException('User is not a workshop');

    return this.prismaService.workshop.update({
      where: { id: workshopId.id },
      data: { documents: { update: documents }, verified: false },
    });
  }
}
