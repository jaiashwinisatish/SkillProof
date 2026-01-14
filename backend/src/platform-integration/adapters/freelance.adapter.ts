import { PlatformAdapter, PlatformCredentials, RawPlatformData, SkillEvidence, EvidenceType, PlatformType, RateLimitInfo, EvidenceMetrics } from '../interfaces/platform-adapter.interface';

export class FreelanceAdapter implements PlatformAdapter {
  platformId = 'freelance';
  platformName = 'Freelance Projects';
  platformType = PlatformType.FREELANCE_PLATFORM;

  async fetchRawData(credentials: PlatformCredentials): Promise<RawPlatformData[]> {
    try {
      const rawData: RawPlatformData[] = [];
      
      // Freelance platforms often require manual submission
      // We'll fetch manually submitted projects
      rawData.push(...await this.fetchManualProjects(credentials));
      
      return rawData;
    } catch (error) {
      console.error('Freelance platform error:', error);
      throw new Error(`Failed to fetch freelance data: ${error.message}`);
    }
  }

  async normalizeEvidence(rawData: RawPlatformData[], userId: string): Promise<SkillEvidence[]> {
    const evidence: SkillEvidence[] = [];

    for (const item of rawData) {
      const normalized = await this.createSkillEvidence(item, userId);
      if (normalized) {
        evidence.push(normalized);
      }
    }

    return evidence;
  }

  calculateMetrics(evidence: SkillEvidence[]): EvidenceMetrics {
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
    const frequency = (totalEvidence / timeSpan) * 7;

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

  async validateCredentials(credentials: PlatformCredentials): Promise<boolean> {
    // Freelance platforms often use API keys or OAuth
    // For manual submission, we'll validate basic structure
    return !!(credentials.projectData || credentials.apiKey);
  }

  getProfileUrl(credentials: PlatformCredentials): string {
    return credentials.profileUrl || '#';
  }

  getRateLimit(): RateLimitInfo {
    return {
      requestsPerHour: 1000,
      requestsPerDay: 10000,
      currentUsage: 0,
      resetTime: new Date()
    };
  }

  private async fetchManualProjects(credentials: PlatformCredentials): Promise<RawPlatformData[]> {
    const rawData: RawPlatformData[] = [];
    
    if (credentials.projectData) {
      const projects = Array.isArray(credentials.projectData) ? credentials.projectData : [credentials.projectData];
      
      projects.forEach((project: any, index) => {
        rawData.push({
          id: `freelance_project_${index}`,
          type: EvidenceType.FREELANCE_PROJECT,
          timestamp: new Date(project.completedAt || project.createdAt),
          metadata: {
            platform: 'freelance',
            project: {
              title: project.title,
              description: project.description,
              client: project.client,
              budget: project.budget,
              duration: project.duration,
              technologies: project.technologies,
              status: project.status,
              rating: project.rating,
              review: project.review,
              completedAt: project.completedAt,
              createdAt: project.createdAt
            }
          }
        });
      });
    }
    
    return rawData;
  }

  private async createSkillEvidence(rawData: RawPlatformData, userId: string): Promise<SkillEvidence | null> {
    const techStack = this.extractTechStack(rawData.metadata);
    
    return {
      id: `${this.platformId}_${rawData.id}_${userId}`,
      userId,
      platformId: this.platformId,
      evidenceType: rawData.type as EvidenceType,
      activityFrequency: this.calculateActivityFrequency(rawData),
      complexityScore: this.calculateComplexity(rawData),
      originalityScore: this.calculateOriginality(rawData),
      consistencyScore: this.calculateConsistency(rawData),
      growthScore: this.calculateGrowth(rawData),
      techStack,
      createdAt: rawData.timestamp,
      rawMetadata: rawData.metadata
    };
  }

  private extractTechStack(metadata: any): string[] {
    const techStack: string[] = [];
    
    if (metadata.project?.technologies) {
      if (Array.isArray(metadata.project.technologies)) {
        techStack.push(...metadata.project.technologies);
      } else if (typeof metadata.project.technologies === 'string') {
        techStack.push(...metadata.project.technologies.split(',').map((t: string) => t.trim()));
      }
    }
    
    // Extract tech from project description
    if (metadata.project?.description) {
      const description = metadata.project.description.toLowerCase();
      const techKeywords = [
        'react', 'vue', 'angular', 'javascript', 'typescript',
        'node', 'express', 'nest', 'python', 'django', 'flask',
        'docker', 'kubernetes', 'aws', 'azure', 'gcp',
        'mongodb', 'postgresql', 'mysql', 'redis',
        'graphql', 'rest', 'api', 'microservices',
        'machine learning', 'ai', 'data science', 'blockchain',
        'react native', 'flutter', 'swift', 'kotlin',
        'html', 'css', 'sass', 'tailwind', 'bootstrap'
      ];
      
      techKeywords.forEach(tech => {
        if (description.includes(tech)) {
          techStack.push(tech);
        }
      });
    }
    
    return [...new Set(techStack)];
  }

  private calculateActivityFrequency(rawData: RawPlatformData): number {
    const daysSinceCreation = (Date.now() - rawData.timestamp.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceCreation < 7) return 10;
    if (daysSinceCreation < 30) return 8;
    if (daysSinceCreation < 90) return 6;
    return 4;
  }

  private calculateComplexity(rawData: RawPlatformData): number {
    let score = 5;
    
    if (rawData.metadata.project) {
      const project = rawData.metadata.project;
      if (project.budget && project.budget > 1000) score += 2;
      if (project.duration && project.duration > 30) score += 1; // Longer project
      if (project.technologies && project.technologies.length > 5) score += 1;
      if (project.rating && project.rating >= 4) score += 1; // High client rating
    }
    
    return Math.min(score, 10);
  }

  private calculateOriginality(rawData: RawPlatformData): number {
    let score = 5;
    
    if (rawData.metadata.project) {
      const project = rawData.metadata.project;
      if (project.description && project.description.length > 200) score += 1;
      if (project.client) score += 1; // Real client work
      if (project.rating) score += 1; // Completed and reviewed
    }
    
    return Math.min(score, 10);
  }

  private calculateConsistency(rawData: RawPlatformData): number {
    let score = 5;
    
    if (rawData.metadata.project) {
      const project = rawData.metadata.project;
      if (project.status === 'completed') score += 3;
      if (project.rating && project.rating >= 4) score += 2; // Consistently good work
    }
    
    return Math.min(score, 10);
  }

  private calculateGrowth(rawData: RawPlatformData): number {
    let score = 5;
    
    if (rawData.metadata.project) {
      const project = rawData.metadata.project;
      if (project.budget && project.budget > 2000) score += 2; // Higher value projects
      if (project.rating && project.rating >= 4.5) score += 2; // Excellent reviews
      if (project.review && project.review.length > 100) score += 1; // Detailed feedback
    }
    
    return Math.min(score, 10);
  }
}
