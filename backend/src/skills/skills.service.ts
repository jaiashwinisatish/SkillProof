import { Injectable } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';

@Injectable()
export class SkillsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllSkills() {
    return this.prisma.skill.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async getSkillsByCategory(category: string) {
    return this.prisma.skill.findMany({
      where: { category },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async getSkill(id: string) {
    return this.prisma.skill.findUnique({
      where: { id },
      include: {
        skillVerifications: true,
      },
    });
  }
}
