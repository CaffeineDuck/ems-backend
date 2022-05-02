import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient, VechileType } from '@prisma/client';

type TPrisma = PrismaClient | Prisma.TransactionClient;

@Injectable()
export class WorkshopQueryService {
  async findAll(
    prisma: TPrisma,
    lat: number,
    lng: number,
    vechile: VechileType,
  ) {
    return prisma.$queryRaw`
      SELECT
        name,
        id,
        location,
        St_Distance(
          geolocation,
          St_SetSRID(St_MakePoint(${lng}, ${lng}), 4326)
        ) AS displacement 
      FROM
        "Workshop"
      WHERE
        ${vechile} = ANY("Workshop"."vechileTypes")
        AND St_Distance(
          geolocation,
          St_SetSRID(St_MakePoint(${lng}, ${lat}), 4326)
        ) < 15000
      ORDER BY
        displacement; 
    `;
  }

  async addGeolocation(prisma: TPrisma, id: number, lat: number, lng: number) {
    return prisma.$queryRaw`
      UPDATE "Workshop"
      SET
        geolocation = St_MakePoint(${lng}, ${lat})
      WHERE
        id = ${id}
    `;
  }
}
