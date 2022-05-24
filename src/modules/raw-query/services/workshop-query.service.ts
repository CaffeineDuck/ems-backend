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
        "Workshop".id,
        location,
        images,
        ST_AsText(geolocation) AS coordinates,
        ST_Distance(
          geolocation,
          St_SetSRID(St_MakePoint(${lng}, ${lat}), 4326)
        ) AS displacement,
        AVG("Rating"."score") AS rating
      FROM
        "Workshop"
        LEFT OUTER JOIN "Rating" ON "Workshop".id = "Rating"."workshopId"
      WHERE
         ${vechile} = ANY("Workshop"."vechileTypes")
        AND St_Distance(
          geolocation,
          St_SetSRID(St_MakePoint(${lng}, ${lat}), 4326)
        ) < 15000
        AND "Workshop"."verified" = true
      GROUP BY
        "Workshop"."id"
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
