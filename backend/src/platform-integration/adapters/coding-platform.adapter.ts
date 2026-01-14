import { PlatformAdapter, PlatformCredentials, RawPlatformData, SkillEvidence, EvidenceType, PlatformType, RateLimitInfo, EvidenceMetrics } from '../interfaces/platform-adapter.interface';
import axios from 'axios';

export class CodingPlatformAdapter implements PlatformAdapter {
  platformId: string;
  platformName: string;
  platformType = PlatformType.CODING_PLATFORM;
  private apiUrl: string;

  constructor(platformId: string, platformName: string, apiUrl: string) {
    this.platformId = platformId;
    this.platformName = platformName;
    this.apiUrl = apiUrl;
  }

  async fetchRawData(credentials: PlatformCredentials): Promise<RawPlatformData[]> {
    try {
      const rawData: RawPlatformData[] = [];
      
      if (this.platformId === 'leetcode') {
        rawData.push(...await this.fetchLeetCodeData(credentials));
      } else if (this.platformId === 'codeforces') {
        rawData.push(...await this.fetchCodeforcesData(credentials));
      } else if (this.platformId === 'hackerrank') {
        rawData.push(...await this.fetchHackerRankData(credentials));
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
      if (this.platformId === 'leetcode') {
        return await this.validateLeetCodeCredentials(credentials);
      } else if (this.platformId === 'codeforces') {
        return await this.validateCodeforcesCredentials(credentials);
      } else if (this.platformId === 'hackerrank') {
        return await this.validateHackerRankCredentials(credentials);
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  getProfileUrl(credentials: PlatformCredentials): string {
    if (this.platformId === 'leetcode') {
      return `https://leetcode.com/${credentials.username}`;
    } else if (this.platformId === 'codeforces') {
      return `https://codeforces.com/profile/${credentials.username}`;
    } else if (this.platformId === 'hackerrank') {
      return `https://hackerrank.com/profile/${credentials.username}`;
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

  private async fetchLeetCodeData(credentials: PlatformCredentials): Promise<RawPlatformData[]> {
    const rawData: RawPlatformData[] = [];
    
    // Fetch user profile
    const profileQuery = `
      query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          username
          profile {
            realName
            userAvatar
            ranking {
              currentRating
              topPercentage
            }
          }
          submitStats {
            acTotal
            totalSubmissions
          }
        }
      }
    `;

    const profileResponse = await axios.post('https://leetcode.com/graphql', {
      query: profileQuery,
      variables: { username: credentials.username }
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    const userData = profileResponse.data.data?.matchedUser;
    if (userData) {
      rawData.push({
        id: 'leetcode_profile',
        type: EvidenceType.PROBLEM_SOLVING,
        timestamp: new Date(),
        metadata: {
          platform: 'leetcode',
          userProfile: userData
        }
      });
    }

    // Fetch recent submissions
    const submissionsQuery = `
      query getUserSubmissions($username: String!) {
        matchedUser(username: $username) {
          username
          submitStats {
            acSubmissionNum {
            difficulty
            count
          }
          }
        }
      }
    `;

    const submissionsResponse = await axios.post('https://leetcode.com/graphql', {
      query: submissionsQuery,
      variables: { username: credentials.username }
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    const submissionData = submissionsResponse.data.data?.matchedUser;
    if (submissionData?.submitStats?.acSubmissionNum) {
      submissionData.submitStats.acSubmissionNum.forEach((submission: any) => {
        rawData.push({
          id: `leetcode_submission_${submission.difficulty}`,
          type: EvidenceType.PROBLEM_SOLVING,
          timestamp: new Date(),
          metadata: {
            platform: 'leetcode',
            submission: {
              difficulty: submission.difficulty,
              count: submission.count
            }
          }
        });
      });
    }

    return rawData;
  }

  private async fetchCodeforcesData(credentials: PlatformCredentials): Promise<RawPlatformData[]> {
    const rawData: RawPlatformData[] = [];
    
    // Fetch user info
    const userResponse = await axios.get(`https://codeforces.com/api/user.info?handles=${credentials.username}`);
    const userData = userResponse.data.result?.[0];
    
    if (userData) {
      rawData.push({
        id: 'codeforces_profile',
        type: EvidenceType.PROBLEM_SOLVING,
        timestamp: new Date(),
        metadata: {
          platform: 'codeforces',
          userProfile: userData
        }
      });
    }

    // Fetch user submissions
    const submissionsResponse = await axios.get(`https://codeforces.com/api/user.status?handle=${credentials.username}&count=100`);
    const submissions = submissionsResponse.data.result || [];
    
    submissions.forEach((submission: any) => {
      rawData.push({
        id: `codeforces_submission_${submission.id}`,
        type: EvidenceType.PROBLEM_SOLVING,
        timestamp: new Date(submission.creationTimeSeconds * 1000),
        metadata: {
          platform: 'codeforces',
          submission: {
            problemId: submission.problem.id,
            problemName: submission.problem.name,
            verdict: submission.verdict,
            programmingLanguage: submission.programmingLanguage,
            timeConsumed: submission.timeConsumedMillis,
            memoryConsumed: submission.memoryConsumedBytes
          }
        }
      });
    });

    // Fetch contest ratings
    const ratingResponse = await axios.get(`https://codeforces.com/api/user.rating?handle=${credentials.username}`);
    const ratings = ratingResponse.data.result || [];
    
    ratings.forEach((rating: any) => {
      rawData.push({
        id: `codeforces_contest_${rating.contestId}`,
        type: EvidenceType.COMPETITION_PARTICIPATION,
        timestamp: new Date(rating.ratingUpdateTimeSeconds * 1000),
        metadata: {
          platform: 'codeforces',
          contest: {
            contestId: rating.contestId,
            contestName: rating.contestName,
            rank: rating.rank,
            ratingChange: rating.newRating - rating.oldRating,
            newRating: rating.newRating
          }
        }
      });
    });

    return rawData;
  }

  private async fetchHackerRankData(credentials: PlatformCredentials): Promise<RawPlatformData[]> {
    const rawData: RawPlatformData[] = [];
    
    // HackerRank API is limited, so we'll fetch what's available
    try {
      const authHeader = credentials.cookie ? { 'Cookie': credentials.cookie } : {};
      
      // Fetch profile (if available through public API)
      const profileResponse = await axios.get(`https://www.hackerrank.com/rest/hackers/${credentials.username}`, {
        headers: authHeader
      });
      
      const userData = profileResponse.data;
      if (userData) {
        rawData.push({
          id: 'hackerrank_profile',
          type: EvidenceType.PROBLEM_SOLVING,
          timestamp: new Date(),
          metadata: {
            platform: 'hackerrank',
            userProfile: userData
          }
        });
      }
    } catch (error) {
      console.error('HackerRank API may not be publicly accessible:', error);
    }

    return rawData;
  }

  private async validateLeetCodeCredentials(credentials: PlatformCredentials): Promise<boolean> {
    try {
      const response = await axios.post('https://leetcode.com/graphql', {
        query: `
          query getUserProfile($username: String!) {
            matchedUser(username: $username) {
              username
            }
          }
        `,
        variables: { username: credentials.username }
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      return response.data.data?.matchedUser !== null;
    } catch (error) {
      return false;
    }
  }

  private async validateCodeforcesCredentials(credentials: PlatformCredentials): Promise<boolean> {
    try {
      const response = await axios.get(`https://codeforces.com/api/user.info?handles=${credentials.username}`);
      return response.data.result && response.data.result.length > 0;
    } catch (error) {
      return false;
    }
  }

  private async validateHackerRankCredentials(credentials: PlatformCredentials): Promise<boolean> {
    try {
      const authHeader = credentials.cookie ? { 'Cookie': credentials.cookie } : {};
      const response = await axios.get(`https://www.hackerrank.com/rest/hackers/${credentials.username}`, {
        headers: authHeader
      });
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
    
    if (metadata.submission?.programmingLanguage) {
      techStack.push(metadata.submission.programmingLanguage.toLowerCase());
    }
    
    if (metadata.userProfile?.rating) {
      // High rating suggests strong algorithmic skills
      techStack.push('algorithms', 'data-structures');
    }
    
    if (metadata.userProfile?.submitStats?.acSubmissionNum) {
      metadata.userProfile.submitStats.acSubmissionNum.forEach((submission: any) => {
        if (submission.difficulty === 'Easy') techStack.push('problem-solving');
        if (submission.difficulty === 'Medium') techStack.push('intermediate-problem-solving');
        if (submission.difficulty === 'Hard') techStack.push('advanced-problem-solving');
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
    
    if (rawData.metadata.submission) {
      const submission = rawData.metadata.submission;
      if (submission.difficulty === 'Hard') score += 3;
      else if (submission.difficulty === 'Medium') score += 2;
      else if (submission.difficulty === 'Easy') score += 1;
    }
    
    if (rawData.metadata.contest) {
      const contest = rawData.metadata.contest;
      if (contest.newRating > 2000) score += 3;
      else if (contest.newRating > 1600) score += 2;
      else if (contest.newRating > 1200) score += 1;
    }
    
    return Math.min(score, 10);
  }

  private calculateOriginality(rawData: RawPlatformData): number {
    // Originality in coding platforms is based on problem diversity
    let score = 5;
    
    if (rawData.metadata.userProfile?.submitStats?.acTotal) {
      const totalSolved = rawData.metadata.userProfile.submitStats.acTotal;
      if (totalSolved > 500) score += 3;
      else if (totalSolved > 200) score += 2;
      else if (totalSolved > 50) score += 1;
    }
    
    return Math.min(score, 10);
  }

  private calculateConsistency(rawData: RawPlatformData): number {
    let score = 5;
    
    if (rawData.metadata.userProfile?.ranking?.currentRating) {
      const rating = rawData.metadata.userProfile.ranking.currentRating;
      // Consistent high rating indicates consistency
      if (rating > 2000) score += 3;
      else if (rating > 1600) score += 2;
      else if (rating > 1200) score += 1;
    }
    
    return Math.min(score, 10);
  }

  private calculateGrowth(rawData: RawPlatformData): number {
    let score = 5;
    
    if (rawData.metadata.contest?.ratingChange) {
      const change = rawData.metadata.contest.ratingChange;
      if (change > 0) score += 3; // Positive growth
      else if (change > -50) score += 1; // Small decline
    }
    
    return Math.min(score, 10);
  }
}
