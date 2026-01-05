import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async createProject(userId: string, projectData: any) {
    return this.prisma.project.create({
      data: {
        ...projectData,
        userId,
      },
      include: {
        user: true,
        skillVerifications: true,
      },
    });
  }

  async getProject(id: string) {
    return this.prisma.project.findUnique({
      where: { id },
      include: {
        user: true,
        skillVerifications: {
          include: {
            skill: true,
          },
        },
      },
    });
  }

  async getProjectsByUser(userId: string) {
    return this.prisma.project.findMany({
      where: { userId },
      include: {
        skillVerifications: {
          include: {
            skill: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateProject(id: string, updateData: any) {
    return this.prisma.project.update({
      where: { id },
      data: updateData,
      include: {
        user: true,
        skillVerifications: true,
      },
    });
  }

  async deleteProject(id: string) {
    return this.prisma.project.delete({
      where: { id },
    });
  }
}
