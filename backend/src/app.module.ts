import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './config/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PlatformIntegrationModule } from './platform-integration/platform-integration.module';
import { SkillAnalysisModule } from './skill-analysis/skill-analysis.module';
import { CompaniesModule } from './companies/companies.module';
import { AdminModule } from './admin/admin.module';
import { PaymentsModule } from './payments/payments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CommonModule } from './common/common.module';
import { HealthModule } from './config/health.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    
    // Core modules
    PrismaModule,
    CommonModule,
    HealthModule,
    
    // Security & Rate Limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
    
    // Scheduling
    ScheduleModule.forRoot(),
    
    // Feature modules
    AuthModule,
    UsersModule,
    CompaniesModule,
    AdminModule,
    PaymentsModule,
    NotificationsModule,
    PlatformIntegrationModule,
    SkillAnalysisModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
