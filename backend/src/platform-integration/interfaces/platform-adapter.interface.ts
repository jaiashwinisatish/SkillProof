export interface PlatformCredentials {
  accessToken?: string;
  refreshToken?: string;
  username?: string;
  password?: string;
  apiKey?: string;
  apiSecret?: string;
  cookie?: string;
  webhookUrl?: string;
  [key: string]: any;
}

export interface RawPlatformData {
  id: string;
  type: string;
  timestamp: Date;
  metadata: Record<string, any>;
}

export interface SkillEvidence {
  id: string;
  userId: string;
  platformId: string;
  evidenceType: EvidenceType;
  activityFrequency: number;
  complexityScore: number;
  originalityScore: number;
  consistencyScore: number;
  growthScore: number;
  techStack: string[];
  createdAt: Date;
  rawMetadata: Record<string, any>;
}

export enum EvidenceType {
  CODE_COMMIT = 'code_commit',
  PROJECT_CREATION = 'project_creation',
  PROBLEM_SOLVING = 'problem_solving',
  ARTICLE_PUBLICATION = 'article_publication',
  FREELANCE_PROJECT = 'freelance_project',
  DEPLOYED_APP = 'deployed_app',
  COMPETITION_PARTICIPATION = 'competition_participation',
  CODE_REVIEW = 'code_review',
  DOCUMENTATION = 'documentation',
  OPEN_SOURCE_CONTRIBUTION = 'open_source_contribution'
}

export interface PlatformAdapter {
  platformId: string;
  platformName: string;
  platformType: PlatformType;
  
  // Core methods
  fetchRawData(credentials: PlatformCredentials): Promise<RawPlatformData[]>;
  normalizeEvidence(rawData: RawPlatformData[], userId: string): Promise<SkillEvidence[]>;
  calculateMetrics(evidence: SkillEvidence[]): EvidenceMetrics;
  
  // Validation
  validateCredentials(credentials: PlatformCredentials): Promise<boolean>;
  getProfileUrl(credentials: PlatformCredentials): string;
  
  // Rate limiting
  getRateLimit(): RateLimitInfo;
}

export enum PlatformType {
  CODE_REPOSITORY = 'code_repository',
  CODING_PLATFORM = 'coding_platform',
  BLOG_PLATFORM = 'blog_platform',
  FREELANCE_PLATFORM = 'freelance_platform',
  DEPLOYMENT_PLATFORM = 'deployment_platform',
  CUSTOM = 'custom'
}

export interface RateLimitInfo {
  requestsPerHour: number;
  requestsPerDay: number;
  currentUsage: number;
  resetTime: Date;
}

export interface EvidenceMetrics {
  totalEvidence: number;
  averageComplexity: number;
  averageOriginality: number;
  averageConsistency: number;
  averageGrowth: number;
  timeSpan: number; // days
  frequency: number; // evidence per week
  qualityScore: number;
}

export interface PlatformIntegration {
  id: string;
  userId: string;
  platformId: string;
  platformName: string;
  platformType: PlatformType;
  profileUrl: string;
  accessMethod: AccessMethod;
  skillsTargeted: string[];
  timeRange: TimeRange;
  lastSyncedAt: Date;
  connectionStatus: ConnectionStatus;
  credentials: PlatformCredentials;
  createdAt: Date;
  updatedAt: Date;
}

export enum AccessMethod {
  OAUTH = 'oauth',
  PUBLIC = 'public',
  API_TOKEN = 'api_token',
  MANUAL = 'manual'
}

export enum TimeRange {
  LAST_30_DAYS = 'last_30_days',
  LAST_90_DAYS = 'last_90_days',
  LAST_6_MONTHS = 'last_6_months',
  LAST_YEAR = 'last_year',
  ALL_TIME = 'all_time'
}

export enum ConnectionStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
  SYNCING = 'syncing',
  RATE_LIMITED = 'rate_limited'
}
