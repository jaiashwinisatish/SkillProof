import { Injectable, Logger } from '@nestjs/common';
import { SkillConstructionService, SkillConstructionResult } from './skill-construction.service';
import { EvidenceNormalizationService } from './evidence-normalization.service';
import { PlatformIntegrationService } from '../../platform-integration/core/platform-integration.service';

export interface SkillAnalysisResult {
  overallSkillScore: number;
  confidenceLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  skills: Array<{
    name: string;
    score: number;
    confidence: number;
    evidenceCount: number;
    explanation: string;
    platforms: string[];
    techStack: string[];
  }>;
  strengths: string[];
  gaps: string[];
  lastUpdated: Date;
}

@Injectable()
export class SkillAnalysisService {
  private readonly logger = new Logger(SkillAnalysisService.name);

  constructor(
    private readonly skillConstructionService: SkillConstructionService,
    private readonly evidenceNormalizationService: EvidenceNormalizationService,
    private readonly platformIntegrationService: PlatformIntegrationService
  ) {}

  async analyzeUserSkills(userId: string, forceRefresh = false): Promise<SkillAnalysisResult> {
    try {
      this.logger.log(`Starting skill analysis for user: ${userId}`);
      
      // Get all platform integrations for user (in real implementation, from database)
      // For now, we'll use mock integrations
      const mockIntegrations = await this.getMockIntegrations(userId);
      
      if (mockIntegrations.length === 0) {
        return {
          overallSkillScore: 0,
          confidenceLevel: 'LOW',
          skills: [],
          strengths: [],
          gaps: ['No platform integrations found'],
          lastUpdated: new Date()
        };
      }

      // Sync all platform data
      const allEvidence = await this.platformIntegrationService.syncAllPlatforms(userId, mockIntegrations);
      
      if (allEvidence.length === 0) {
        return {
          overallSkillScore: 0,
          confidenceLevel: 'LOW',
          skills: [],
          strengths: [],
          gaps: ['Insufficient evidence from integrated platforms'],
          lastUpdated: new Date()
        };
      }

      // Construct skills from evidence
      const skillResult = this.skillConstructionService.constructSkills(allEvidence);
      
      this.logger.log(`Skill analysis completed for user ${userId}: ${skillResult.skills.length} skills constructed`);
      
      return {
        overallSkillScore: skillResult.overallSkillScore,
        confidenceLevel: skillResult.confidenceLevel,
        skills: skillResult.skills.map(skill => ({
          name: skill.name,
          score: skill.score,
          confidence: skill.confidence,
          evidenceCount: skill.evidenceCount,
          explanation: skill.explanation,
          platforms: skill.platforms,
          techStack: skill.techStack
        })),
        strengths: skillResult.strengths,
        gaps: skillResult.gaps,
        lastUpdated: skillResult.lastUpdated
      };
    } catch (error) {
      this.logger.error(`Skill analysis failed for user ${userId}:`, error);
      throw error;
    }
  }

  async getUserSkills(userId: string): Promise<Array<{ name: string; score: number; confidence: number }>> {
    const analysis = await this.analyzeUserSkills(userId);
    return analysis.skills.map(skill => ({
      name: skill.name,
      score: skill.score,
      confidence: skill.confidence
    }));
  }

  async getUserEvidence(userId: string): Promise<Array<{
    id: string;
    platformId: string;
    evidenceType: string;
    activityFrequency: number;
    complexityScore: number;
    originalityScore: number;
    consistencyScore: number;
    growthScore: number;
    techStack: string[];
    createdAt: Date;
  }>> {
    // Get all platform integrations for user
    const mockIntegrations = await this.getMockIntegrations(userId);
    
    // Sync all platform data
    const allEvidence = await this.platformIntegrationService.syncAllPlatforms(userId, mockIntegrations);
    
    return allEvidence.map(evidence => ({
      id: evidence.id,
      platformId: evidence.platformId,
      evidenceType: evidence.evidenceType,
      activityFrequency: evidence.activityFrequency,
      complexityScore: evidence.complexityScore,
      originalityScore: evidence.originalityScore,
      consistencyScore: evidence.consistencyScore,
      growthScore: evidence.growthScore,
      techStack: evidence.techStack,
      createdAt: evidence.createdAt
    }));
  }

  async getAnalysisMetrics(userId: string): Promise<{
    totalEvidence: number;
    totalSkills: number;
    averageConfidence: number;
    overallQuality: number;
    platformDiversity: number;
    timeSpan: number;
  }> {
    const analysis = await this.analyzeUserSkills(userId);
    
    const totalEvidence = analysis.skills.reduce((sum, skill) => sum + skill.evidenceCount, 0);
    const totalSkills = analysis.skills.length;
    const averageConfidence = totalSkills > 0 
      ? analysis.skills.reduce((sum, skill) => sum + skill.confidence, 0) / totalSkills 
      : 0;
    
    const overallQuality = analysis.skills.length > 0 
      ? analysis.skills.reduce((sum, skill) => sum + skill.score, 0) / totalSkills 
      : 0;
    
    const platformDiversity = [...new Set(analysis.skills.flatMap(skill => skill.platforms))].length;
    
    const timeSpan = this.calculateTimeSpanFromSkills(analysis.skills);

    return {
      totalEvidence,
      totalSkills,
      averageConfidence,
      overallQuality,
      platformDiversity,
      timeSpan
    };
  }

  private async getMockIntegrations(userId: string): Promise<any[]> {
    // Mock integrations for demonstration
    // In real implementation, this would fetch from database
    return [
      {
        id: 'github_123',
        userId,
        platformId: 'github',
        platformName: 'GitHub',
        platformType: 'code_repository',
        profileUrl: 'https://github.com/demo-user',
        accessMethod: 'api_token',
        skillsTargeted: ['javascript', 'react', 'node.js'],
        timeRange: 'last_6_months',
        lastSyncedAt: new Date(),
        connectionStatus: 'connected',
        credentials: { accessToken: 'mock_token' },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  private calculateTimeSpanFromSkills(skills: any[]): number {
    if (skills.length === 0) return 0;
    
    const allDates = skills.flatMap(skill => 
      skill.platforms ? [new Date()] : []
    );
    
    if (allDates.length === 0) return 0;
    
    const timeSpan = (Math.max(...allDates.map(d => d.getTime())) - 
                     Math.min(...allDates.map(d => d.getTime()))) / 
                    (1000 * 60 * 60 * 24);
    
    return Math.max(0, timeSpan);
  }
}
