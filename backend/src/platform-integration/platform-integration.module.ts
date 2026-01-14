import { Module } from '@nestjs/common';
import { PlatformIntegrationController } from './platform-integration.controller';
import { PlatformIntegrationService } from './core/platform-integration.service';

@Module({
  controllers: [PlatformIntegrationController],
  providers: [PlatformIntegrationService],
  exports: [PlatformIntegrationService],
})
export class PlatformIntegrationModule {}
