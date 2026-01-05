import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production');
    }

    // Tabla order matters due to foreign key constraints
    const tablenames = [
      'audit_logs',
      'sessions',
      'refresh_tokens',
      'notifications',
      'payments',
      'subscriptions',
      'applications',
      'project_badges',
      'user_badges',
      'project_skills',
      'skill_verifications',
      'jobs',
      'badges',
      'projects',
      'student_profiles',
      'companies',
      'skills',
      'users',
    ];

    for (const tablename of tablenames) {
      try {
        await this.$executeRawUnsafe(`DELETE FROM "${tablename}";`);
      } catch (error) {
        console.log({ error });
      }
    }
  }

  async healthCheck() {
    try {
      await this.$queryRaw`SELECT 1`;
      return { status: 'healthy', timestamp: new Date().toISOString() };
    } catch (error) {
      return { status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() };
    }
  }
}
