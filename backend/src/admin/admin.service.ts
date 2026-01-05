import { Injectable } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalUsers,
      totalProjects,
      totalCompanies,
      totalSkills,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.project.count(),
      this.prisma.company.count(),
      this.prisma.skill.count(),
    ]);

    return {
      totalUsers,
      totalProjects,
      totalCompanies,
      totalSkills,
    };
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      include: {
        profile: true,
        company: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
