import { Injectable, Logger } from '@nestjs/common';
import { PlatformAdapter, PlatformCredentials, RawPlatformData, SkillEvidence, PlatformIntegration, AccessMethod, TimeRange, ConnectionStatus } from '../interfaces/platform-adapter.interface';
import { GitHubAdapter } from '../adapters/github.adapter';
import { CodingPlatformAdapter } from '../adapters/coding-platform.adapter';
import { BlogAdapter } from '../adapters/blog.adapter';
import { FreelanceAdapter } from '../adapters/freelance.adapter';

@Injectable()
export class PlatformIntegrationService {
  private readonly logger = new Logger(PlatformIntegrationService.name);
  private adapters: Map<string, PlatformAdapter> = new Map();

  constructor() {
    this.initializeAdapters();
  }

  private initializeAdapters() {
    // Code repositories
    this.adapters.set('github', new GitHubAdapter());

    // Coding platforms
    this.adapters.set('leetcode', new CodingPlatformAdapter('leetcode', 'LeetCode', 'https://leetcode.com'));
    this.adapters.set('codeforces', new CodingPlatformAdapter('codeforces', 'Codeforces', 'https://codeforces.com'));
    this.adapters.set('hackerrank', new CodingPlatformAdapter('hackerrank', 'HackerRank', 'https://hackerrank.com'));

    // Blog platforms
    this.adapters.set('devto', new BlogAdapter('devto', 'Dev.to', 'https://dev.to'));
    this.adapters.set('medium', new BlogAdapter('medium', 'Medium', 'https://medium.com'));

    // Freelance platforms
    this.adapters.set('freelance', new FreelanceAdapter());
  }

  async addPlatformIntegration(
    userId: string,
    platformId: string,
    credentials: PlatformCredentials,
    accessMethod: AccessMethod,
    skillsTargeted: string[] = [],
    timeRange: TimeRange = TimeRange.ALL_TIME
  ): Promise<PlatformIntegration> {
    const adapter = this.getAdapter(platformId);
    if (!adapter) {
      throw new Error(`Platform ${platformId} is not supported`);
    }

    // Validate credentials
    const isValid = await adapter.validateCredentials(credentials);
    if (!isValid) {
      throw new Error(`Invalid credentials for ${platformId}`);
    }

    const integration: PlatformIntegration = {
      id: `${platformId}_${userId}_${Date.now()}`,
      userId,
      platformId,
      platformName: adapter.platformName,
      platformType: adapter.platformType,
      profileUrl: adapter.getProfileUrl(credentials),
      accessMethod,
      skillsTargeted,
      timeRange,
      lastSyncedAt: new Date(),
      connectionStatus: ConnectionStatus.CONNECTED,
      credentials,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.logger.log(`Added platform integration for user ${userId}: ${platformId}`);
    return integration;
  }

  async updatePlatformIntegration(
    integrationId: string,
    updates: Partial<PlatformIntegration>
  ): Promise<PlatformIntegration> {
    // Implementation would update in database
    this.logger.log(`Updated platform integration: ${integrationId}`);
    throw new Error('Not implemented - database integration required');
  }

  async removePlatformIntegration(integrationId: string): Promise<void> {
    // Implementation would remove from database
    this.logger.log(`Removed platform integration: ${integrationId}`);
    throw new Error('Not implemented - database integration required');
  }

  async syncPlatformData(
    userId: string,
    platformId: string,
    credentials: PlatformCredentials
  ): Promise<SkillEvidence[]> {
    const adapter = this.getAdapter(platformId);
    if (!adapter) {
      throw new Error(`Platform ${platformId} is not supported`);
    }

    try {
      this.logger.log(`Syncing data for user ${userId} from ${platformId}`);
      
      // Fetch raw data from platform
      const rawData = await adapter.fetchRawData(credentials);
      
      // Normalize to skill evidence
      const evidence = await adapter.normalizeEvidence(rawData, userId);
      
      this.logger.log(`Synced ${evidence.length} evidence items from ${platformId}`);
      return evidence;
    } catch (error) {
      this.logger.error(`Failed to sync ${platformId} for user ${userId}:`, error);
      throw error;
    }
  }

  async syncAllPlatforms(userId: string, integrations: PlatformIntegration[]): Promise<SkillEvidence[]> {
    const allEvidence: SkillEvidence[] = [];
    
    for (const integration of integrations) {
      try {
        const evidence = await this.syncPlatformData(userId, integration.platformId, integration.credentials);
        allEvidence.push(...evidence);
      } catch (error) {
        this.logger.error(`Failed to sync ${integration.platformId}:`, error);
        // Continue with other platforms
      }
    }
    
    this.logger.log(`Total evidence synced for user ${userId}: ${allEvidence.length}`);
    return allEvidence;
  }

  getAdapter(platformId: string): PlatformAdapter | undefined {
    return this.adapters.get(platformId);
  }

  getSupportedPlatforms(): Array<{ id: string; name: string; type: string }> {
    return Array.from(this.adapters.entries()).map(([id, adapter]) => ({
      id,
      name: adapter.platformName,
      type: adapter.platformType
    }));
  }

  async testPlatformConnection(platformId: string, credentials: PlatformCredentials): Promise<boolean> {
    const adapter = this.getAdapter(platformId);
    if (!adapter) {
      return false;
    }

    try {
      return await adapter.validateCredentials(credentials);
    } catch (error) {
      this.logger.error(`Platform connection test failed for ${platformId}:`, error);
      return false;
    }
  }

  getPlatformRateLimit(platformId: string) {
    const adapter = this.getAdapter(platformId);
    return adapter ? adapter.getRateLimit() : null;
  }
}
