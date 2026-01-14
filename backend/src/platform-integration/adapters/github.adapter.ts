import { PlatformAdapter, PlatformCredentials, RawPlatformData, SkillEvidence, EvidenceType, PlatformType, RateLimitInfo, EvidenceMetrics } from '../interfaces/platform-adapter.interface';
import axios from 'axios';

export class GitHubAdapter implements PlatformAdapter {
  platformId = 'github';
  platformName = 'GitHub';
  platformType = PlatformType.CODE_REPOSITORY;

  async fetchRawData(credentials: PlatformCredentials): Promise<RawPlatformData[]> {
    const { accessToken } = credentials;
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/vnd.github.v3+json'
    };

    try {
      // Fetch user data
      const userResponse = await axios.get('https://api.github.com/user', { headers });
      const user = userResponse.data;

      // Fetch repositories
      const reposResponse = await axios.get('https://api.github.com/user/repos?per_page=100&type=owner', { headers });
      const repos = reposResponse.data;

      // Fetch commits (last 100)
      const eventsResponse = await axios.get('https://api.github.com/user/events?per_page=100', { headers });
      const events = eventsResponse.data;

      // Fetch pull requests
      const prsResponse = await axios.get('https://api.github.com/search/issues?q=author:@me+type:pr&per_page=100', { headers });
      const prs = prsResponse.data.items;

      const rawData: RawPlatformData[] = [
        ...this.processRepositories(repos, user),
        ...this.processEvents(events, user),
        ...this.processPullRequests(prs, user)
      ];

      return rawData;
    } catch (error) {
      console.error('GitHub API error:', error);
      throw new Error(`Failed to fetch GitHub data: ${error.message}`);
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
    const timeSpan = (Math.max(...timestamps) - Math.min(...timestamps)) / (1000 * 60 * 60 * 24); // days
    const frequency = (totalEvidence / timeSpan) * 7; // per week

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
      const response = await axios.get('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${credentials.accessToken}`
        }
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  getProfileUrl(credentials: PlatformCredentials): string {
    return `https://github.com/${credentials.username}`;
  }

  getRateLimit(): RateLimitInfo {
    return {
      requestsPerHour: 5000,
      requestsPerDay: 5000,
      currentUsage: 0,
      resetTime: new Date()
    };
  }

  private processRepositories(repos: any[], user: any): RawPlatformData[] {
    return repos.map(repo => ({
      id: `repo_${repo.id}`,
      type: EvidenceType.PROJECT_CREATION,
      timestamp: new Date(repo.created_at),
      metadata: {
        platform: 'github',
        repository: {
          id: repo.id,
          name: repo.name,
          description: repo.description,
          language: repo.language,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          size: repo.size,
          isPrivate: repo.private,
          topics: repo.topics,
          createdAt: repo.created_at,
          updatedAt: repo.updated_at,
          pushedAt: repo.pushed_at,
          owner: {
            login: repo.owner.login,
            type: repo.owner.type
          }
        }
      }
    }));
  }

  private processEvents(events: any[], user: any): RawPlatformData[] {
    return events
      .filter(event => ['PushEvent', 'PullRequestEvent', 'IssuesEvent'].includes(event.type))
      .map(event => ({
        id: `event_${event.id}`,
        type: EvidenceType.CODE_COMMIT,
        timestamp: new Date(event.created_at),
        metadata: {
          platform: 'github',
          event: {
            type: event.type,
            repo: event.repo.name,
            payload: event.payload,
            actor: event.actor.login,
            public: event.public
          }
        }
      }));
  }

  private processPullRequests(prs: any[], user: any): RawPlatformData[] {
    return prs.map(pr => ({
      id: `pr_${pr.id}`,
      type: EvidenceType.OPEN_SOURCE_CONTRIBUTION,
      timestamp: new Date(pr.created_at),
      metadata: {
        platform: 'github',
        pullRequest: {
          id: pr.id,
          title: pr.title,
          body: pr.body,
          state: pr.state,
          mergedAt: pr.pull_request?.merged_at,
          additions: pr.additions,
          deletions: pr.deletions,
          changedFiles: pr.changed_files,
          repo: pr.repository_url,
          author: pr.user.login
        }
      }
    }));
  }

  private async createSkillEvidence(rawData: RawPlatformData, userId: string): Promise<SkillEvidence | null> {
    const techStack = this.extractTechStack(rawData.metadata);
    
    return {
      id: `github_${rawData.id}_${userId}`,
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
    
    if (metadata.repository?.language) {
      techStack.push(metadata.repository.language);
    }
    
    if (metadata.repository?.topics) {
      techStack.push(...metadata.repository.topics);
    }
    
    if (metadata.event?.repo) {
      const repoName = metadata.event.repo.split('/')[1];
      // Extract tech from repo name patterns
      if (repoName.includes('react') || repoName.includes('vue') || repoName.includes('angular')) {
        techStack.push('frontend');
      }
      if (repoName.includes('node') || repoName.includes('express') || repoName.includes('nest')) {
        techStack.push('backend');
      }
    }
    
    return [...new Set(techStack)];
  }

  private calculateActivityFrequency(rawData: RawPlatformData): number {
    // Calculate based on recency and type
    const daysSinceCreation = (Date.now() - rawData.timestamp.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceCreation < 7) return 10; // Very recent
    if (daysSinceCreation < 30) return 8; // Recent
    if (daysSinceCreation < 90) return 6; // Moderately recent
    return 4; // Older
  }

  private calculateComplexity(rawData: RawPlatformData): number {
    let score = 5; // Base score
    
    if (rawData.metadata.repository) {
      const repo = rawData.metadata.repository;
      if (repo.size > 1000) score += 2;
      if (repo.forks_count > 10) score += 1;
      if (repo.stargazers_count > 50) score += 1;
      if (repo.topics && repo.topics.length > 3) score += 1;
    }
    
    if (rawData.metadata.pullRequest) {
      const pr = rawData.metadata.pullRequest;
      if (pr.additions > 500) score += 2;
      if (pr.changedFiles > 10) score += 1;
      if (pr.mergedAt) score += 1;
    }
    
    return Math.min(score, 10);
  }

  private calculateOriginality(rawData: RawPlatformData): number {
    let score = 5; // Base score
    
    if (rawData.metadata.repository) {
      const repo = rawData.metadata.repository;
      if (!repo.isPrivate) score += 1; // Public repos show confidence
      if (repo.description && repo.description.length > 100) score += 1;
      if (repo.topics && repo.topics.length > 0) score += 1;
    }
    
    return Math.min(score, 10);
  }

  private calculateConsistency(rawData: RawPlatformData): number {
    // Consistency based on regular activity patterns
    let score = 5; // Base score
    
    if (rawData.metadata.repository) {
      const repo = rawData.metadata.repository;
      const daysBetweenUpdates = (new Date(repo.updated_at).getTime() - new Date(repo.created_at).getTime()) / (1000 * 60 * 60 * 24);
      if (daysBetweenUpdates > 30 && repo.pushed_at) score += 2; // Regular updates
    }
    
    return Math.min(score, 10);
  }

  private calculateGrowth(rawData: RawPlatformData): number {
    let score = 5; // Base score
    
    if (rawData.metadata.repository) {
      const repo = rawData.metadata.repository;
      if (repo.stargazers_count > 0) score += 1;
      if (repo.forks_count > 0) score += 1;
      if (repo.watchers_count > 0) score += 1;
    }
    
    return Math.min(score, 10);
  }
}
