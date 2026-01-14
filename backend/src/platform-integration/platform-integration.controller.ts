import { 
  Controller, 
  Post, 
  Get, 
  Put, 
  Delete, 
  Body, 
  Param, 
  HttpCode, 
  HttpStatus,
  ValidationPipe 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PlatformIntegrationService } from './core/platform-integration.service';
import { PlatformCredentials } from './interfaces/platform-adapter.interface';

@ApiTags('platform-integration')
@Controller('platform-integration')
export class PlatformIntegrationController {
  constructor(private readonly platformIntegrationService: PlatformIntegrationService) {}

  @Get('supported')
  @ApiOperation({ summary: 'Get supported platforms' })
  @ApiResponse({ status: 200, description: 'List of supported platforms' })
  async getSupportedPlatforms() {
    return this.platformIntegrationService.getSupportedPlatforms();
  }

  @Post('connect')
  @ApiOperation({ summary: 'Connect a platform' })
  @ApiResponse({ status: 201, description: 'Platform connected successfully' })
  @ApiResponse({ status: 400, description: 'Invalid credentials or platform not supported' })
  async connectPlatform(@Body() connectDto: ConnectPlatformDto) {
    try {
      const integration = await this.platformIntegrationService.addPlatformIntegration(
        'demo-user', // Hardcoded for now
        connectDto.platformId,
        connectDto.credentials,
        connectDto.accessMethod as any, // Cast to any for now
        connectDto.skillsTargeted,
        connectDto.timeRange as any // Cast to any for now
      );

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Platform connected successfully',
        data: integration
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message,
        data: null
      };
    }
  }

  @Put(':integrationId')
  @ApiOperation({ summary: 'Update platform integration' })
  @ApiResponse({ status: 200, description: 'Platform updated successfully' })
  async updatePlatform(
    @Param('integrationId') integrationId: string,
    @Body() updateDto: UpdatePlatformDto
  ) {
    try {
      const integration = await this.platformIntegrationService.updatePlatformIntegration(
        integrationId,
        updateDto as any // Cast to any for now
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'Platform updated successfully',
        data: integration
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message,
        data: null
      };
    }
  }

  @Delete(':integrationId')
  @ApiOperation({ summary: 'Disconnect platform' })
  @ApiResponse({ status: 200, description: 'Platform disconnected successfully' })
  async disconnectPlatform(@Param('integrationId') integrationId: string) {
    try {
      await this.platformIntegrationService.removePlatformIntegration(integrationId);

      return {
        statusCode: HttpStatus.OK,
        message: 'Platform disconnected successfully',
        data: null
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message,
        data: null
      };
    }
  }

  @Post(':integrationId/sync')
  @ApiOperation({ summary: 'Sync platform data' })
  @ApiResponse({ status: 200, description: 'Data synced successfully' })
  async syncPlatform(@Param('integrationId') integrationId: string) {
    try {
      // In a real implementation, we'd fetch integration from database
      // For now, we'll use credentials from request body
      const evidence = await this.platformIntegrationService.syncPlatformData(
        'demo-user', // Hardcoded for now
        integrationId,
        {} // credentials would come from database
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'Data synced successfully',
        data: {
          evidenceCount: evidence.length,
          syncedAt: new Date()
        }
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Sync failed: ' + error.message,
        data: null
      };
    }
  }

  @Post('sync-all')
  @ApiOperation({ summary: 'Sync all platforms' })
  @ApiResponse({ status: 200, description: 'All data synced successfully' })
  async syncAllPlatforms() {
    try {
      // In a real implementation, we'd fetch all integrations from database
      // For now, we'll return a mock response
      const evidence = await this.platformIntegrationService.syncAllPlatforms(
        'demo-user', // Hardcoded for now
        [] // integrations would come from database
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'All platforms synced successfully',
        data: {
          totalEvidence: evidence.length,
          syncedAt: new Date()
        }
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Sync failed: ' + error.message,
        data: null
      };
    }
  }

  @Post(':platformId/test')
  @ApiOperation({ summary: 'Test platform connection' })
  @ApiResponse({ status: 200, description: 'Connection test successful' })
  async testConnection(
    @Param('platformId') platformId: string,
    @Body() credentials: PlatformCredentials
  ) {
    try {
      const isValid = await this.platformIntegrationService.testPlatformConnection(
        platformId,
        credentials
      );

      return {
        statusCode: HttpStatus.OK,
        message: isValid ? 'Connection test successful' : 'Connection test failed',
        data: { isValid }
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Connection test failed: ' + error.message,
        data: null
      };
    }
  }
}

// DTOs
export class ConnectPlatformDto {
  platformId: string;
  credentials: PlatformCredentials;
  accessMethod: string;
  skillsTargeted: string[];
  timeRange: string;
}

export class UpdatePlatformDto {
  skillsTargeted?: string[];
  timeRange?: string;
  credentials?: PlatformCredentials;
}
