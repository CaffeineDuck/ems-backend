import { Injectable } from '@nestjs/common';

@Injectable()
export class UrgentQueryService {
  async getLocation(
    prisma: TPrisma,
    id: string,
  ): Promise<{ lat: number; lng: number }> {
    return prisma.$queryRaw`
      SELECT ST_AsText(geolocation) AS coordinates
      FROM "UrgentService"
      WHERE id = ${id};
    `;
  }

  async updateLocation(
    prisma: TPrisma,
    id: string,
    lat: number,
    lng: number,
  ): Promise<void> {
    await prisma.$queryRaw`
      UPDATE "UrgentService"
      SET geolocation = ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)
      WHERE id = ${id};
      `;
  }

  async updateEndLocation(
    prisma: TPrisma,
    id: string,
    lat: number,
    lng: number,
  ): Promise<void> {
    await prisma.$queryRaw`
      UPDATE "UrgentService"
      SET "finalGeolocation" = ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)
      WHERE id = ${id};
      `;
  }
}
