import { Injectable } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  async getCompanyByUser(userId: string) {
    return this.prisma.company.findUnique({
      where: { userId },
      include: {
        user: true,
        jobs: true,
      },
    });
  }

  async updateCompany(userId: string, updateData: any) {
    return this.prisma.company.update({
      where: { userId },
      data: updateData,
      include: {
        user: true,
      },
    });
  }
}
