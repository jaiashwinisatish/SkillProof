import { Injectable, Logger } from '@nestjs/common';
import { SkillEvidence, EvidenceType, EvidenceMetrics } from '../../platform-integration/interfaces/platform-adapter.interface';

@Injectable()
export class EvidenceNormalizationService {
  private readonly logger = new Logger(EvidenceNormalizationService.name);

  constructor() {}

  normalizeEvidenceAcrossPlatforms(allEvidence: SkillEvidence[]): SkillEvidence[] {
    const normalizedEvidence: SkillEvidence[] = [];
    
    // Group evidence by type and apply platform-agnostic normalization
    const groupedEvidence = this.groupByType(allEvidence);
    
    for (const [evidenceType, evidenceList] of groupedEvidence.entries()) {
      const normalized = this.normalizeEvidenceByType(evidenceType, evidenceList);
      normalizedEvidence.push(...normalized);
    }
    
    this.logger.log(`Normalized ${normalizedEvidence.length} evidence items across platforms`);
    return normalizedEvidence;
  }

  calculateEvidenceMetrics(evidence: SkillEvidence[]): EvidenceMetrics {
    if (evidence.length === 0) {
      return {
        totalEvidence: 0,
        averageComplexity: 0,
        averageOriginality: 0,
        averageConsistency: 0,
        averageGrowth: 0,
        timeSpan: 0,
        frequency: 0,
        qualityScore: 0
      };
    }

    const totalEvidence = evidence.length;
    const avgComplexity = evidence.reduce((sum, e) => sum + e.complexityScore, 0) / totalEvidence;
    const avgOriginality = evidence.reduce((sum, e) => sum + e.originalityScore, 0) / totalEvidence;
    const avgConsistency = evidence.reduce((sum, e) => sum + e.consistencyScore, 0) / totalEvidence;
    const avgGrowth = evidence.reduce((sum, e) => sum + e.growthScore, 0) / totalEvidence;

    const timestamps = evidence.map(e => e.createdAt.getTime());
    const timeSpan = (Math.max(...timestamps) - Math.min(...timestamps)) / (1000 * 60 * 60 * 24);
    const frequency = timeSpan > 0 ? (totalEvidence / timeSpan) * 7 : 0;

    const qualityScore = (avgComplexity + avgOriginality + avgConsistency + avgGrowth) / 4;

    return {
      totalEvidence,
      averageComplexity: avgComplexity,
      averageOriginality: avgOriginality,
      averageConsistency: avgConsistency,
      averageGrowth: avgGrowth,
      timeSpan,
      frequency,
      qualityScore
    };
  }

  filterEvidenceByTimeRange(evidence: SkillEvidence[], days: number): SkillEvidence[] {
    const cutoffDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
    return evidence.filter(e => e.createdAt >= cutoffDate);
  }

  filterEvidenceByTechStack(evidence: SkillEvidence[], techStack: string[]): SkillEvidence[] {
    return evidence.filter(e => 
      e.techStack.some(tech => 
        techStack.some(targetTech => 
          tech.toLowerCase().includes(targetTech.toLowerCase()) || 
          targetTech.toLowerCase().includes(tech.toLowerCase())
        )
      )
    );
  }

  getEvidenceQualityDistribution(evidence: SkillEvidence[]): {
    high: number;
    medium: number;
    low: number;
  } {
    const high = evidence.filter(e => 
      e.complexityScore >= 8 && 
      e.originalityScore >= 8 && 
      e.consistencyScore >= 8
    ).length;

    const medium = evidence.filter(e => 
      e.complexityScore >= 5 && 
      e.originalityScore >= 5 && 
      e.consistencyScore >= 5 &&
      e.complexityScore < 8
    ).length;

    const low = evidence.length - high - medium;

    return { high, medium, low };
  }

  private groupByType(evidence: SkillEvidence[]): Map<EvidenceType, SkillEvidence[]> {
    const grouped = new Map<EvidenceType, SkillEvidence[]>();
    
    for (const item of evidence) {
      const type = item.evidenceType;
      if (!grouped.has(type)) {
        grouped.set(type, []);
      }
      grouped.get(type)!.push(item);
    }
    
    return grouped;
  }

  private normalizeEvidenceByType(evidenceType: EvidenceType, evidenceList: SkillEvidence[]): SkillEvidence[] {
    switch (evidenceType) {
      case EvidenceType.CODE_COMMIT:
        return this.normalizeCodeCommits(evidenceList);
      case EvidenceType.PROJECT_CREATION:
        return this.normalizeProjectCreations(evidenceList);
      case EvidenceType.PROBLEM_SOLVING:
        return this.normalizeProblemSolving(evidenceList);
      case EvidenceType.ARTICLE_PUBLICATION:
        return this.normalizeArticlePublications(evidenceList);
      case EvidenceType.FREELANCE_PROJECT:
        return this.normalizeFreelanceProjects(evidenceList);
      case EvidenceType.DEPLOYED_APP:
        return this.normalizeDeployedApps(evidenceList);
      case EvidenceType.COMPETITION_PARTICIPATION:
        return this.normalizeCompetitionParticipation(evidenceList);
      default:
        return evidenceList; // Return as-is for unknown types
    }
  }

  private normalizeCodeCommits(evidence: SkillEvidence[]): SkillEvidence[] {
    // Apply platform-agnostic normalization for code commits
    return evidence.map(e => ({
      ...e,
      complexityScore: this.normalizeScore(e.complexityScore, 'code_commit'),
      originalityScore: this.normalizeScore(e.originalityScore, 'code_commit'),
      consistencyScore: this.normalizeScore(e.consistencyScore, 'code_commit'),
      growthScore: this.normalizeScore(e.growthScore, 'code_commit')
    }));
  }

  private normalizeProjectCreations(evidence: SkillEvidence[]): SkillEvidence[] {
    return evidence.map(e => ({
      ...e,
      complexityScore: this.normalizeScore(e.complexityScore, 'project_creation'),
      originalityScore: this.normalizeScore(e.originalityScore, 'project_creation'),
      consistencyScore: this.normalizeScore(e.consistencyScore, 'project_creation'),
      growthScore: this.normalizeScore(e.growthScore, 'project_creation')
    }));
  }

  private normalizeProblemSolving(evidence: SkillEvidence[]): SkillEvidence[] {
    return evidence.map(e => ({
      ...e,
      complexityScore: this.normalizeScore(e.complexityScore, 'problem_solving'),
      originalityScore: this.normalizeScore(e.originalityScore, 'problem_solving'),
      consistencyScore: this.normalizeScore(e.consistencyScore, 'problem_solving'),
      growthScore: this.normalizeScore(e.growthScore, 'problem_solving')
    }));
  }

  private normalizeArticlePublications(evidence: SkillEvidence[]): SkillEvidence[] {
    return evidence.map(e => ({
      ...e,
      complexityScore: this.normalizeScore(e.complexityScore, 'article_publication'),
      originalityScore: this.normalizeScore(e.originalityScore, 'article_publication'),
      consistencyScore: this.normalizeScore(e.consistencyScore, 'article_publication'),
      growthScore: this.normalizeScore(e.growthScore, 'article_publication')
    }));
  }

  private normalizeFreelanceProjects(evidence: SkillEvidence[]): SkillEvidence[] {
    return evidence.map(e => ({
      ...e,
      complexityScore: this.normalizeScore(e.complexityScore, 'freelance_project'),
      originalityScore: this.normalizeScore(e.originalityScore, 'freelance_project'),
      consistencyScore: this.normalizeScore(e.consistencyScore, 'freelance_project'),
      growthScore: this.normalizeScore(e.growthScore, 'freelance_project')
    }));
  }

  private normalizeDeployedApps(evidence: SkillEvidence[]): SkillEvidence[] {
    return evidence.map(e => ({
      ...e,
      complexityScore: this.normalizeScore(e.complexityScore, 'deployed_app'),
      originalityScore: this.normalizeScore(e.originalityScore, 'deployed_apps'),
      consistencyScore: this.normalizeScore(e.consistencyScore, 'deployed_apps'),
      growthScore: this.normalizeScore(e.growthScore, 'deployed_apps')
    }));
  }

  private normalizeCompetitionParticipation(evidence: SkillEvidence[]): SkillEvidence[] {
    return evidence.map(e => ({
      ...e,
      complexityScore: this.normalizeScore(e.complexityScore, 'competition_participation'),
      originalityScore: this.normalizeScore(e.originalityScore, 'competition_participation'),
      consistencyScore: this.normalizeScore(e.consistencyScore, 'competition_participation'),
      growthScore: this.normalizeScore(e.growthScore, 'competition_participation')
    }));
  }

  private normalizeScore(score: number, evidenceType: string): number {
    // Apply platform-agnostic normalization rules
    // This ensures consistent scoring across different platforms
    const normalizedScore = Math.max(0, Math.min(10, score));
    
    // Apply type-specific adjustments if needed
    switch (evidenceType) {
      case 'code_commit':
        return normalizedScore * 0.9; // Slightly lower weight for routine commits
      case 'project_creation':
        return normalizedScore * 1.1; // Higher weight for complete projects
      case 'problem_solving':
        return normalizedScore * 1.0; // Standard weight for problem solving
      case 'article_publication':
        return normalizedScore * 0.8; // Lower weight for articles (less technical)
      case 'freelance_project':
        return normalizedScore * 1.2; // Higher weight for paid work
      case 'deployed_apps':
        return normalizedScore * 1.1; // Higher weight for deployed applications
      case 'competition_participation':
        return normalizedScore * 0.9; // Slightly lower for participation
      default:
        return normalizedScore;
    }
  }
}
