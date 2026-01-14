// Core types for platform integration system

export interface PlatformAdapter {
  id: string
  name: string
  description: string
  icon: string
  color: string
  isSupported: boolean
  connect: (credentials: PlatformCredentials) => Promise<ConnectionResult>
  fetchData: (connection: PlatformConnection) => Promise<PlatformData[]>
  normalizeData: (rawData: any[]) => NormalizedEvidence[]
}

export interface PlatformCredentials {
  accessToken?: string
  refreshToken?: string
  username?: string
  apiKey?: string
  webhookSecret?: string
  [key: string]: any
}

export interface ConnectionResult {
  success: boolean
  connection?: PlatformConnection
  error?: string
}

export interface PlatformConnection {
  id: string
  platformId: string
  userId: string
  credentials: PlatformCredentials
  isActive: boolean
  lastSync?: Date
  createdAt: Date
}

export interface PlatformData {
  id: string
  type: 'commit' | 'project' | 'article' | 'submission' | 'contribution'
  timestamp: Date
  metadata: Record<string, any>
}

export interface NormalizedEvidence {
  id: string
  platformId: string
  type: EvidenceType
  skillTags: string[]
  data: {
    title: string
    description: string
    url?: string
    timestamp: Date
    metrics: EvidenceMetrics
    quality: QualityMetrics
  }
}

export interface EvidenceMetrics {
  frequency: number // Activity frequency
  complexity: number // Code/complexity score
  consistency: number // Regularity of contributions
  growth: number // Improvement over time
  depth: number // Contribution depth
}

export interface QualityMetrics {
  originality: number // Originality score
  technicalDepth: number // Technical complexity
  bestPractices: number // Following best practices
  documentation: number // Documentation quality
  collaboration: number // Collaboration indicators
}

export interface SkillAssessment {
  skillName: string
  overallScore: number
  confidence: number
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
  breakdown: {
    platforms: PlatformContribution[]
    evidence: EvidenceSummary
  }
  strengths: string[]
  gaps: string[]
  explanation: string
}

export interface PlatformContribution {
  platformId: string
  platformName: string
  contributionWeight: number
  evidenceCount: number
  averageQuality: number
  keyMetrics: Record<string, number>
}

export interface EvidenceSummary {
  totalEvidence: number
  platformsUsed: number
  timeRange: {
    start: Date
    end: Date
  }
  qualityDistribution: {
    high: number
    medium: number
    low: number
  }
}

export interface SkillVerificationResult {
  userId: string
  overallScore: number
  skills: SkillAssessment[]
  confidence: number
  dataQuality: 'Insufficient' | 'Low' | 'Medium' | 'High'
  generatedAt: Date
  insights: {
    strengths: string[]
    improvementAreas: string[]
    recommendations: string[]
  }
}

export type EvidenceType = 
  | 'code_commit'
  | 'project_creation'
  | 'article_publication'
  | 'problem_solving'
  | 'code_review'
  | 'documentation'
  | 'collaboration'
  | 'presentation'
  | 'research'
  | 'mentoring'
