import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Role, VechileType } from '@prisma/client';
import { PrismaService } from '../commons/prisma/prisma.service';
import { CreateWorkshopDto } from './dto/create-workshop.dto';
import { UpdateWorkshopDto } from './dto/update-workshop.dto';

@Injectable()
export class WorkshopService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService<IConfig>,
  ) {}

  async create(createWorkshopDto: CreateWorkshopDto, userId: string) {
    const { lat, lng, ...workshop } = createWorkshopDto;

    const workshopCreated = await this.prismaService.$transaction(
      async (prisma) => {
        await prisma.user.update({
          where: { id: userId },
          data: {
            role: Role.WORKSHOP,
          },
        });

        const create_workshop = await prisma.workshop.create({
          data: {
            ...workshop,
            owner: { connect: { id: userId } },
          },
        });

        return prisma.$queryRaw`
            UPDATE "Workshop" SET "geolocation" = 'POINT(${lng} ${lat})' 
            WHERE "id" = ${create_workshop.id}
          `;
      },
    );

    return workshopCreated;
  }

  async findAll(lat: number, lng: number, vechile: VechileType) {
    const radius = this.configService.get('geolocation.radius', {
      infer: true,
    });

    return this.prismaService.$queryRaw`
      SELECT name, id, location, geolocation, 
        ST_Distance_Sphere(geolocation, 
                           'ST_SetSRID(ST_MakePoint(${lng} ${lat}), 4326)'
                          ) AS distance
      FROM "Workshop"

      WHERE 
          "Workshop"."vechileType" = ${vechile} 
        AND
          ST_DWithin("Workshop"."geolocation", 
                    'ST_SetSRID(ST_MakePoint(${lng} ${lat}), 4326)', 
                    ${radius}
                    )
      ORDER BY 
        distance;
    `;
  }

  async findOne(id: number) {
    return this.prismaService.workshop.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateWorkshopDto: UpdateWorkshopDto) {
    return this.prismaService.workshop.update({
      where: { id },
      data: updateWorkshopDto,
    });
  }
}
