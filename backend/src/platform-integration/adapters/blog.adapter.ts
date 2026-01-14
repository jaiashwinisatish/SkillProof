import { PlatformAdapter, PlatformCredentials, RawPlatformData, SkillEvidence, EvidenceType, PlatformType, RateLimitInfo, EvidenceMetrics } from '../interfaces/platform-adapter.interface';
import axios from 'axios';

export class BlogAdapter implements PlatformAdapter {
  platformId: string;
  platformName: string;
  platformType = PlatformType.BLOG_PLATFORM;
  private apiUrl: string;

  constructor(platformId: string, platformName: string, apiUrl: string) {
    this.platformId = platformId;
    this.platformName = platformName;
    this.apiUrl = apiUrl;
  }

  async fetchRawData(credentials: PlatformCredentials): Promise<RawPlatformData[]> {
    try {
      const rawData: RawPlatformData[] = [];
      
      if (this.platformId === 'devto') {
        rawData.push(...await this.fetchDevToData(credentials));
      } else if (this.platformId === 'medium') {
        rawData.push(...await this.fetchMediumData(credentials));
      }
      
      return rawData;
    } catch (error) {
      console.error(`${this.platformName} API error:`, error);
      throw new Error(`Failed to fetch ${this.platformName} data: ${error.message}`);
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
    try {
      if (this.platformId === 'devto') {
        return await this.validateDevToCredentials(credentials);
      } else if (this.platformId === 'medium') {
        return await this.validateMediumCredentials(credentials);
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  getProfileUrl(credentials: PlatformCredentials): string {
    if (this.platformId === 'devto') {
      return `https://dev.to/${credentials.username}`;
    } else if (this.platformId === 'medium') {
      return `https://${credentials.username}.medium.com`;
    }
    return '';
  }

  getRateLimit(): RateLimitInfo {
    return {
      requestsPerHour: 1000,
      requestsPerDay: 10000,
      currentUsage: 0,
      resetTime: new Date()
    };
  }

  private async fetchDevToData(credentials: PlatformCredentials): Promise<RawPlatformData[]> {
    const rawData: RawPlatformData[] = [];
    
    try {
      // Fetch user articles
      const response = await axios.get(`https://dev.to/api/articles/me?per_page=100`, {
        headers: {
          'api-key': credentials.apiKey
        }
      });

      const articles = response.data;
      articles.forEach((article: any) => {
        rawData.push({
          id: `devto_article_${article.id}`,
          type: EvidenceType.ARTICLE_PUBLICATION,
          timestamp: new Date(article.published_at),
          metadata: {
            platform: 'devto',
            article: {
              id: article.id,
              title: article.title,
              description: article.description,
              url: article.url,
              tags: article.tag_list,
              positiveReactionsCount: article.positive_reactions_count,
              commentsCount: article.comments_count,
              readingTimeMinutes: article.reading_time_minutes,
              publishedAt: article.published_at,
              createdAt: article.created_at
            }
          }
        });
      });
    } catch (error) {
      console.error('Dev.to API error:', error);
    }

    return rawData;
  }

  private async fetchMediumData(credentials: PlatformCredentials): Promise<RawPlatformData[]> {
    const rawData: RawPlatformData[] = [];
    
    try {
      // Medium RSS feed (public) - simplified for now
      const rssUrl = `https://medium.com/feed/${credentials.username}`;
      const response = await axios.get(rssUrl);
      
      // For now, return empty array since xml2js is not available
      // In production, install xml2js or use alternative XML parser
    } catch (error) {
      console.error('Medium RSS error:', error);
    }

    return rawData;
  }

  private async validateDevToCredentials(credentials: PlatformCredentials): Promise<boolean> {
    try {
      const response = await axios.get('https://dev.to/api/users/me', {
        headers: {
          'api-key': credentials.apiKey
        }
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  private async validateMediumCredentials(credentials: PlatformCredentials): Promise<boolean> {
    try {
      // Medium doesn't have a public API for validation
      // We'll check if the RSS feed exists
      const response = await axios.get(`https://medium.com/feed/${credentials.username}`);
      return response.status === 200;
    } catch (error) {
      return false;
    }
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
    
    if (metadata.article?.tags) {
      techStack.push(...metadata.article.tags);
    }
    
    // Extract tech from article title and description
    if (metadata.article?.title || metadata.article?.description) {
      const content = `${metadata.article.title} ${metadata.article.description}`.toLowerCase();
      
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
        if (content.includes(tech)) {
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
    
    if (rawData.metadata.article) {
      const article = rawData.metadata.article;
      if (article.description && article.description.length > 1000) score += 2;
      if (article.readingTimeMinutes && article.readingTimeMinutes > 10) score += 2;
      if (article.tags && article.tags.length > 5) score += 1;
    }
    
    return Math.min(score, 10);
  }

  private calculateOriginality(rawData: RawPlatformData): number {
    let score = 5;
    
    if (rawData.metadata.article) {
      const article = rawData.metadata.article;
      if (article.title && article.title.length > 50) score += 1;
      if (article.description && article.description.length > 500) score += 1;
      if (article.tags && article.tags.length > 0) score += 1;
    }
    
    return Math.min(score, 10);
  }

  private calculateConsistency(rawData: RawPlatformData): number {
    // Consistency based on regular publishing
    let score = 5;
    
    if (rawData.metadata.article?.publishedAt) {
      const publishedAt = new Date(rawData.metadata.article.publishedAt);
      const daysSincePublication = (Date.now() - publishedAt.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSincePublication < 30) score += 3; // Recent activity
      else if (daysSincePublication < 90) score += 2;
      else if (daysSincePublication < 180) score += 1;
    }
    
    return Math.min(score, 10);
  }

  private calculateGrowth(rawData: RawPlatformData): number {
    let score = 5;
    
    if (rawData.metadata.article) {
      const article = rawData.metadata.article;
      if (article.positiveReactionsCount > 10) score += 2;
      if (article.commentsCount > 5) score += 1;
    }
    
    return Math.min(score, 10);
  }
}
