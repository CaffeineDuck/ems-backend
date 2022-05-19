import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/commons/prisma/prisma.service';

@Injectable()
export class WorkshopService {
  constructor(private readonly prismaService: PrismaService) {}

  getWorkshops(verified: boolean = false) {
    return this.prismaService.workshop.findMany({
      where: {
        verified,
      },
    });
  }

  getAllWorkshops() {
    return this.prismaService.workshop.findMany();
  }

  getWorkshop(id: number) {
    return this.prismaService.workshop.findUnique({ where: { id } });
  }

  getWorkshopByUser(ownerId: string) {
    return this.prismaService.workshop.findUnique({ where: { ownerId } });
  }

  verifyWorkshop(id: number, verify: boolean) {
    return this.prismaService.workshop.update({
      where: { id },
      data: { verified: verify },
    });
  }

  getWorkshopDocuments(workshopId: number) {
    return this.prismaService.workshopDocuments.findUnique({
      where: { workshopId },
    });
  }
}
