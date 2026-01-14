import { Injectable, Logger } from '@nestjs/common';
import { SkillEvidence, EvidenceType } from '../../platform-integration/interfaces/platform-adapter.interface';
import { EvidenceNormalizationService } from './evidence-normalization.service';

export interface ConstructedSkill {
  name: string;
  score: number;
  confidence: number;
  evidenceCount: number;
  explanation: string;
  platforms: string[];
  techStack: string[];
  lastUpdated: Date;
}

export interface SkillConstructionResult {
  overallSkillScore: number;
  confidenceLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  skills: ConstructedSkill[];
  strengths: string[];
  gaps: string[];
  lastUpdated: Date;
}

@Injectable()
export class SkillConstructionService {
  private readonly logger = new Logger(SkillConstructionService.name);

  constructor(private readonly evidenceNormalizationService: EvidenceNormalizationService) {}

  constructSkills(evidence: SkillEvidence[]): SkillConstructionResult {
    if (evidence.length === 0) {
      return {
        overallSkillScore: 0,
        confidenceLevel: 'LOW',
        skills: [],
        strengths: [],
        gaps: ['No evidence available to construct skills'],
        lastUpdated: new Date()
      };
    }

    // Normalize evidence across platforms
    const normalizedEvidence = this.evidenceNormalizationService.normalizeEvidenceAcrossPlatforms(evidence);
    
    // Group evidence by tech stack
    const techStackGroups = this.groupEvidenceByTechStack(normalizedEvidence);
    
    // Construct skills from tech stack groups
    const constructedSkills: ConstructedSkill[] = [];
    
    for (const [tech, techEvidence] of techStackGroups.entries()) {
      const skill = this.constructSkillFromEvidence(tech, techEvidence);
      if (skill) {
        constructedSkills.push(skill);
      }
    }

    // Calculate overall metrics
    const overallScore = this.calculateOverallScore(constructedSkills);
    const confidenceLevel = this.calculateConfidenceLevel(normalizedEvidence, constructedSkills);
    const strengths = this.identifyStrengths(constructedSkills);
    const gaps = this.identifyGaps(constructedSkills, techStackGroups);

    this.logger.log(`Constructed ${constructedSkills.length} skills from ${evidence.length} evidence items`);

    return {
      overallSkillScore: overallScore,
      confidenceLevel,
      skills: constructedSkills,
      strengths,
      gaps,
      lastUpdated: new Date()
    };
  }

  private groupEvidenceByTechStack(evidence: SkillEvidence[]): Map<string, SkillEvidence[]> {
    const techGroups = new Map<string, SkillEvidence[]>();
    
    for (const item of evidence) {
      for (const tech of item.techStack) {
        const normalizedTech = this.normalizeTechnology(tech);
        
        if (!techGroups.has(normalizedTech)) {
          techGroups.set(normalizedTech, []);
        }
        techGroups.get(normalizedTech)!.push(item);
      }
    }
    
    return techGroups;
  }

  private constructSkillFromEvidence(tech: string, evidence: SkillEvidence[]): ConstructedSkill | null {
    if (evidence.length === 0) {
      return null;
    }

    // Calculate skill metrics
    const avgComplexity = evidence.reduce((sum, e) => sum + e.complexityScore, 0) / evidence.length;
    const avgOriginality = evidence.reduce((sum, e) => sum + e.originalityScore, 0) / evidence.length;
    const avgConsistency = evidence.reduce((sum, e) => sum + e.consistencyScore, 0) / evidence.length;
    const avgGrowth = evidence.reduce((sum, e) => sum + e.growthScore, 0) / evidence.length;

    // Calculate skill score (weighted average)
    const weights = {
      complexity: 0.3,
      originality: 0.25,
      consistency: 0.25,
      growth: 0.2
    };

    const skillScore = Math.min(100, Math.max(0,
      avgComplexity * weights.complexity * 10 +
      avgOriginality * weights.originality * 10 +
      avgConsistency * weights.consistency * 10 +
      avgGrowth * weights.growth * 10
    ));

    // Calculate confidence based on evidence quantity and quality
    const evidenceCount = evidence.length;
    const avgQuality = (avgComplexity + avgOriginality + avgConsistency + avgGrowth) / 4;
    const timeSpan = this.calculateTimeSpan(evidence);
    
    let confidence = 0;
    if (evidenceCount >= 10 && avgQuality >= 7 && timeSpan >= 90) {
      confidence = 90; // Very high confidence
    } else if (evidenceCount >= 5 && avgQuality >= 6 && timeSpan >= 30) {
      confidence = 75; // High confidence
    } else if (evidenceCount >= 3 && avgQuality >= 5 && timeSpan >= 14) {
      confidence = 60; // Medium confidence
    } else if (evidenceCount >= 1) {
      confidence = 40; // Low confidence
    }

    // Generate explanation
    const explanation = this.generateSkillExplanation(tech, evidence, skillScore, confidence);

    // Get unique platforms
    const platforms = [...new Set(evidence.map(e => e.platformId))];

    return {
      name: tech,
      score: Math.round(skillScore),
      confidence,
      evidenceCount,
      explanation,
      platforms,
      techStack: [tech],
      lastUpdated: new Date()
    };
  }

  private calculateOverallScore(skills: ConstructedSkill[]): number {
    if (skills.length === 0) return 0;
    
    // Weight skills by confidence and evidence count
    const totalWeight = skills.reduce((sum, skill) => {
      const weight = (skill.confidence / 100) * Math.log(skill.evidenceCount + 1);
      return sum + skill.score * weight;
    }, 0);
    
    const totalWeightSum = skills.reduce((sum, skill) => {
      const weight = (skill.confidence / 100) * Math.log(skill.evidenceCount + 1);
      return sum + weight;
    }, 0);
    
    return totalWeightSum > 0 ? Math.round(totalWeight / totalWeightSum) : 0;
  }

  private calculateConfidenceLevel(evidence: SkillEvidence[], skills: ConstructedSkill[]): 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH' {
    const avgConfidence = skills.length > 0 
      ? skills.reduce((sum, skill) => sum + skill.confidence, 0) / skills.length 
      : 0;

    const evidenceQuality = this.evidenceNormalizationService.calculateEvidenceMetrics(evidence);
    const totalEvidence = evidence.length;
    const timeSpan = this.calculateTimeSpan(evidence);

    // Multi-factor confidence calculation
    let confidenceScore = 0;
    
    // Evidence quantity factor
    if (totalEvidence >= 20) confidenceScore += 30;
    else if (totalEvidence >= 10) confidenceScore += 20;
    else if (totalEvidence >= 5) confidenceScore += 10;
    
    // Evidence quality factor
    if (evidenceQuality.qualityScore >= 8) confidenceScore += 30;
    else if (evidenceQuality.qualityScore >= 6) confidenceScore += 20;
    else if (evidenceQuality.qualityScore >= 4) confidenceScore += 10;
    
    // Time span factor
    if (timeSpan >= 180) confidenceScore += 20;
    else if (timeSpan >= 90) confidenceScore += 15;
    else if (timeSpan >= 30) confidenceScore += 10;
    
    // Platform diversity factor
    const uniquePlatforms = [...new Set(evidence.map(e => e.platformId))].length;
    if (uniquePlatforms >= 3) confidenceScore += 20;
    else if (uniquePlatforms >= 2) confidenceScore += 10;

    if (confidenceScore >= 80) return 'VERY_HIGH';
    if (confidenceScore >= 60) return 'HIGH';
    if (confidenceScore >= 40) return 'MEDIUM';
    return 'LOW';
  }

  private identifyStrengths(skills: ConstructedSkill[]): string[] {
    const strengths: string[] = [];
    
    // Sort skills by score and confidence
    const topSkills = skills
      .filter(skill => skill.confidence >= 70 && skill.score >= 70)
      .sort((a, b) => (b.score * b.confidence) - (a.score * a.confidence))
      .slice(0, 5);

    for (const skill of topSkills) {
      strengths.push(`${skill.name} (${skill.score}/100 confidence: ${skill.confidence}%)`);
    }

    return strengths;
  }

  private identifyGaps(skills: ConstructedSkill[], techGroups: Map<string, SkillEvidence[]>): string[] {
    const gaps: string[] = [];
    
    // Identify common technologies that should be present
    const commonTechStacks = [
      'javascript', 'typescript', 'python', 'java', 'react', 'node.js',
      'html', 'css', 'sql', 'git', 'docker', 'aws',
      'rest api', 'graphql', 'mongodb', 'postgresql'
    ];

    const presentTechs = new Set(skills.map(skill => skill.name.toLowerCase()));
    
    for (const tech of commonTechStacks) {
      if (!presentTechs.has(tech) && this.shouldHaveSkill(tech, techGroups)) {
        gaps.push(tech);
      }
    }

    // Add skill gaps based on evidence patterns
    const evidenceTypes = new Set();
    for (const evidence of Array.from(techGroups.values()).flat()) {
      evidenceTypes.add(evidence.evidenceType);
    }

    if (!evidenceTypes.has(EvidenceType.CODE_COMMIT)) {
      gaps.push('version control practices');
    }
    
    if (!evidenceTypes.has(EvidenceType.FREELANCE_PROJECT)) {
      gaps.push('freelance experience');
    }

    return gaps;
  }

  private normalizeTechnology(tech: string): string {
    const techMap: Record<string, string> = {
      'node': 'node.js',
      'js': 'javascript',
      'ts': 'typescript',
      'py': 'python',
      'css3': 'css',
      'html5': 'html',
      'reactjs': 'react',
      'vuejs': 'vue'
    };

    return techMap[tech.toLowerCase()] || tech.toLowerCase();
  }

  private calculateTimeSpan(evidence: SkillEvidence[]): number {
    if (evidence.length === 0) return 0;
    
    const timestamps = evidence.map(e => e.createdAt.getTime());
    const timeSpan = (Math.max(...timestamps) - Math.min(...timestamps)) / (1000 * 60 * 60 * 24);
    return Math.round(timeSpan);
  }

  private generateSkillExplanation(tech: string, evidence: SkillEvidence[], score: number, confidence: number): string {
    const evidenceCount = evidence.length;
    const platforms = [...new Set(evidence.map(e => e.platformId))];
    const avgComplexity = Math.round(evidence.reduce((sum, e) => sum + e.complexityScore, 0) / evidence.length);
    
    let explanation = `${tech} skill constructed from ${evidenceCount} evidence items across ${platforms.length} platform(s)`;
    
    if (avgComplexity >= 8) {
      explanation += '. High complexity work indicates advanced proficiency';
    } else if (avgComplexity >= 5) {
      explanation += '. Moderate complexity work indicates intermediate proficiency';
    } else {
      explanation += '. Basic complexity work indicates developing proficiency';
    }
    
    explanation += `. Score: ${score}/100, Confidence: ${confidence}%`;
    
    return explanation;
  }

  private shouldHaveSkill(tech: string, techGroups: Map<string, SkillEvidence[]>): boolean {
    // Heuristic: if user works with related technologies, they should know this one
    const relatedTechs: Record<string, string[]> = {
      'javascript': ['html', 'css', 'react', 'vue', 'angular'],
      'react': ['javascript', 'typescript', 'html', 'css'],
      'node.js': ['javascript', 'express', 'mongodb', 'sql'],
      'python': ['django', 'flask', 'sql', 'machine learning'],
      'docker': ['kubernetes', 'aws', 'azure', 'linux'],
      'aws': ['docker', 'kubernetes', 'lambda', 'ec2'],
      'sql': ['postgresql', 'mysql', 'mongodb', 'database']
    };

    const related = relatedTechs[tech.toLowerCase()] || [];
    return related.some(relatedTech => techGroups.has(relatedTech));
  }
}
