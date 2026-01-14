// @ts-nocheck
// @ts-nocheck
import { 
  NormalizedEvidence, 
  SkillAssessment, 
  PlatformContribution, 
  EvidenceSummary, 
  EvidenceMetrics,
  QualityMetrics,
  SkillVerificationResult
} from './types'

export class SkillAnalyzer {
  private evidence: NormalizedEvidence[]
  private platformWeights: Map<string, number>

  constructor(evidence: NormalizedEvidence[]) {
    this.evidence = evidence
    this.platformWeights = new Map()
    this.calculatePlatformWeights()
  }

  /**
   * Analyze all evidence and generate comprehensive skill assessment
   */
  analyzeSkills(): SkillVerificationResult {
    if (this.evidence.length === 0) {
      return {
        userId: '',
        overallScore: 0,
        skills: [],
        confidence: 0,
        dataQuality: 'Insufficient',
        generatedAt: new Date(),
        insights: {
          strengths: [],
          improvementAreas: ['No activity data available'],
          recommendations: ['Connect more platforms to demonstrate your skills']
        }
      }
    }

    const dataQuality = this.assessDataQuality()
    if (dataQuality === 'Insufficient' || dataQuality === 'Low') {
      return {
        userId: '',
        overallScore: this.calculateSkillScore(),
        skills: [],
        confidence: this.calculateConfidence(),
        dataQuality,
        generatedAt: new Date(),
        insights: {
          strengths: this.identifySkillStrengths(),
          improvementAreas: ['Insufficient data for confident skill assessment'],
          recommendations: [
            'Add more platforms with consistent activity',
            'Focus on quality over quantity',
            'Ensure at least 3 months of activity data'
          ]
        }
      }
    }

    const skills = this.analyzeIndividualSkills()
    const overallScore = this.calculateSkillScore(skills)
    const confidence = this.calculateConfidence()

    return {
      userId: '',
      overallScore,
      skills,
      confidence,
      dataQuality,
      generatedAt: new Date(),
      insights: {
        strengths: this.identifySkillStrengths(),
        improvementAreas: this.identifyGaps(skills),
        recommendations: this.generateRecommendations(skills)
      }
    }
  }

  /**
   * Calculate platform weights based on contribution quality and depth
   */
  private calculatePlatformWeights(): void {
    const platformStats = new Map<string, { count: number, totalQuality: number }>()

    // Aggregate stats by platform
    this.evidence.forEach(item => {
      const stats = platformStats.get(item.platformId) || { count: 0, totalQuality: 0 }
      stats.count++
      stats.totalQuality += this.calculateOverallQuality(item.data.quality)
      platformStats.set(item.platformId, stats)
    })

    // Calculate weights based on contribution depth and quality
    let totalWeight = 0
    for (const [platformId, stats] of Array.from(platformStats.entries())) {
      const avgQuality = stats.totalQuality / stats.count
      const depthBonus = Math.min(stats.count / 10, 1) // Bonus for more contributions
      const weight = (avgQuality / 10) * (1 + depthBonus)
      
      this.platformWeights.set(platformId, weight)
      totalWeight += weight
    }

    // Normalize weights to sum to 1
    for (const [platformId, weight] of Array.from(this.platformWeights.entries())) {
      this.platformWeights.set(platformId, weight / totalWeight)
    }
  }

  /**
   * Analyze individual skills from all evidence
   */
  private analyzeIndividualSkills(): SkillAssessment[] {
    const skillGroups = this.groupEvidenceBySkill()
    const assessments: SkillAssessment[] = []

    for (const [skillName, evidenceList] of Array.from(skillGroups.entries())) {
      const assessment = this.assessSkill(skillName, evidenceList)
      assessments.push(assessment)
    }

    return assessments.sort((a, b) => b.overallScore - a.overallScore)
  }

  /**
   * Group evidence by skill tags
   */
  private groupEvidenceBySkill(): Map<string, NormalizedEvidence[]> {
    const skillGroups = new Map<string, NormalizedEvidence[]>()

    this.evidence.forEach(item => {
      item.skillTags.forEach(skill => {
        const normalizedSkill = this.normalizeSkillName(skill)
        const existing = skillGroups.get(normalizedSkill) || []
        existing.push(item)
        skillGroups.set(normalizedSkill, existing)
      })
    })

    return skillGroups
  }

  /**
   * Assess a specific skill based on its evidence
   */
  private assessSkill(skillName: string, evidenceList: NormalizedEvidence[]): SkillAssessment {
    const platformContributions = this.calculatePlatformContributions(evidenceList)
    const evidenceSummary = this.summarizeEvidence(evidenceList)
    const overallScore = this.calculateSkillScore(evidenceList)
    const confidence = this.calculateSkillConfidence(evidenceList)
    const level = this.determineSkillLevel(overallScore)
    const strengths = this.identifySkillStrengths(evidenceList)
    const gaps = this.identifySkillGaps(evidenceList)
    const explanation = this.generateSkillExplanation(skillName, evidenceList, overallScore)

    return {
      skillName,
      overallScore,
      confidence,
      level,
      breakdown: {
        platforms: platformContributions,
        evidence: evidenceSummary
      },
      strengths,
      gaps,
      explanation
    }
  }

  /**
   * Calculate contributions from each platform for a skill
   */
  private calculatePlatformContributions(evidenceList: NormalizedEvidence[]): PlatformContribution[] {
    const platformMap = new Map<string, NormalizedEvidence[]>()

    evidenceList.forEach(item => {
      const existing = platformMap.get(item.platformId) || []
      existing.push(item)
      platformMap.set(item.platformId, existing)
    })

    const contributions: PlatformContribution[] = []
    for (const [platformId, items] of platformMap.entries()) {
      const platformWeight = this.platformWeights.get(platformId) || 0
      const contributionWeight = platformWeight * (items.length / evidenceList.length)
      const averageQuality = items.reduce((sum: number, item: NormalizedEvidence) => sum + this.calculateOverallQuality(item.data.quality), 0) / items.length

      contributions.push({
        platformId,
        platformName: this.getPlatformName(platformId),
        contributionWeight,
        evidenceCount: items.length,
        averageQuality,
        keyMetrics: this.calculateKeyMetrics(items)
      })
    }

    return contributions.sort((a, b) => b.contributionWeight - a.contributionWeight)
  }

  /**
   * Summarize evidence for a skill
   */
  private summarizeEvidence(evidenceList: NormalizedEvidence[]): EvidenceSummary {
    const platformsUsed = new Set(evidenceList.map(item => item.platformId)).size
    const timestamps = evidenceList.map(item => item.data.timestamp.getTime())
    const timeRange = {
      start: new Date(Math.min(...timestamps)),
      end: new Date(Math.max(...timestamps))
    }

    const qualityDistribution = {
      high: evidenceList.filter(item => this.calculateOverallQuality(item.data.quality) >= 7).length,
      medium: evidenceList.filter(item => {
        const quality = this.calculateOverallQuality(item.data.quality)
        return quality >= 4 && quality < 7
      }).length,
      low: evidenceList.filter(item => this.calculateOverallQuality(item.data.quality) < 4).length
    }

    return {
      totalEvidence: evidenceList.length,
      platformsUsed,
      timeRange,
      qualityDistribution
    }
  }

  /**
   * Calculate overall skill score
   */
  private calculateSkillScore(evidenceList: NormalizedEvidence[]): number {
    if (evidenceList.length === 0) return 0

    const totalScore = evidenceList.reduce((sum, item) => {
      const evidenceScore = this.calculateEvidenceScore(item)
      const platformWeight = this.platformWeights.get(item.platformId) || 1
      return sum + (evidenceScore * platformWeight)
    }, 0)

    const totalWeight = evidenceList.reduce((sum, item) => {
      return sum + (this.platformWeights.get(item.platformId) || 1)
    }, 0)

    return Math.min(totalScore / totalWeight, 100)
  }

  /**
   * Calculate score for individual evidence
   */
  private calculateEvidenceScore(evidence: NormalizedEvidence): number {
    const { metrics, quality } = evidence.data
    
    // Weight different aspects of the evidence
    const weights: Record<string, number> = {
      frequency: 0.2,
      complexity: 0.25,
      consistency: 0.15,
      growth: 0.2,
      depth: 0.2
    }

    const qualityWeights: Record<string, number> = {
      originality: 0.25,
      technicalDepth: 0.25,
      bestPractices: 0.2,
      documentation: 0.15,
      collaboration: 0.15
    }

    const metricsScore = Object.entries(metrics).reduce((sum: number, [key, value]: [string, number]) => {
      return sum + (value * (weights[key] || 0))
    }, 0)

    const qualityScore = Object.entries(quality).reduce((sum: number, [key, value]: [string, number]) => {
      return sum + (value * (qualityWeights[key] || 0))
    }, 0)

    // Combine metrics and quality scores
    return (metricsScore * 0.6 + qualityScore * 0.4) * 10 // Scale to 0-100
  }

  /**
   * Calculate overall quality score
   */
  private calculateOverallQuality(quality: QualityMetrics): number {
    const weights = {
      originality: 0.25,
      technicalDepth: 0.25,
      bestPractices: 0.2,
      documentation: 0.15,
      collaboration: 0.15
    }

    return Object.entries(quality).reduce((sum: number, [key, value]: [string, number]) => {
      return sum + (value * (weights[key] || 0))
    }, 0)
  }

  /**
   * Determine skill level based on score
   */
  private determineSkillLevel(score: number): 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' {
    if (score >= 80) return 'Expert'
    if (score >= 60) return 'Advanced'
    if (score >= 40) return 'Intermediate'
    return 'Beginner'
  }

  /**
   * Calculate confidence in skill assessment
   */
  private calculateSkillConfidence(evidenceList: NormalizedEvidence[]): number {
    if (evidenceList.length === 0) return 0

    // Factors affecting confidence
    const evidenceCount = Math.min(evidenceList.length / 10, 1) // More evidence = more confidence
    const platformDiversity = Math.min(new Set(evidenceList.map(item => item.platformId)).size / 3, 1) // More platforms = more confidence
    const timeSpan = this.calculateTimeSpan(evidenceList) // Longer time span = more confidence
    const qualityConsistency = this.calculateQualityConsistency(evidenceList) // Consistent quality = more confidence

    return Math.min((evidenceCount * 0.3 + platformDiversity * 0.3 + timeSpan * 0.2 + qualityConsistency * 0.2) * 100, 100)
  }

  /**
   * Calculate overall confidence
   */
  private calculateConfidence(): number {
    if (this.evidence.length === 0) return 0

    const individualConfidences = Array.from(this.groupEvidenceBySkill().entries()).map(([skill, evidence]) => 
      this.calculateSkillConfidence(evidence)
    )

    return individualConfidences.reduce((sum: number, conf: number) => sum + conf, 0) / individualConfidences.length
  }

  /**
   * Assess overall data quality
   */
  private assessDataQuality(): 'Insufficient' | 'Low' | 'Medium' | 'High' {
    const evidenceCount = this.evidence.length
    const platformCount = new Set(this.evidence.map(item => item.platformId)).size
    const timeSpan = this.calculateTimeSpan(this.evidence)
    const avgQuality = this.evidence.reduce((sum, item) => sum + this.calculateOverallQuality(item.data.quality), 0) / this.evidence.length

    if (evidenceCount < 5 || platformCount < 1) return 'Insufficient'
    if (evidenceCount < 20 || platformCount < 2 || timeSpan < 0.3) return 'Low'
    if (evidenceCount < 50 || platformCount < 3 || timeSpan < 0.6 || avgQuality < 6) return 'Medium'
    return 'High'
  }

  /**
   * Helper methods
   */
  private normalizeSkillName(skill: string): string {
    return skill.toLowerCase().trim()
  }

  private getPlatformName(platformId: string): string {
    const platformNames: Record<string, string> = {
      'github': 'GitHub',
      'leetcode': 'LeetCode',
      'devpost': 'Devpost',
      'stackoverflow': 'Stack Overflow',
      'medium': 'Medium',
      'youtube': 'YouTube'
    }
    return platformNames[platformId] || platformId
  }

  private calculateKeyMetrics(evidenceList: NormalizedEvidence[]): Record<string, number> {
    const metrics = {
      totalCommits: 0,
      totalProjects: 0,
      avgComplexity: 0,
      avgQuality: 0,
      growthRate: 0
    }

    evidenceList.forEach(item => {
      if (item.type === 'code_commit') metrics.totalCommits++
      if (item.type === 'project_creation') metrics.totalProjects++
      metrics.avgComplexity += item.data.metrics.complexity
      metrics.avgQuality += this.calculateOverallQuality(item.data.quality)
    })

    metrics.avgComplexity /= evidenceList.length
    metrics.avgQuality /= evidenceList.length

    return metrics
  }

  private calculateTimeSpan(evidenceList: NormalizedEvidence[]): number {
    if (evidenceList.length === 0) return 0

    const timestamps = evidenceList.map(item => item.data.timestamp.getTime())
    const timeSpan = (Math.max(...timestamps) - Math.min(...timestamps)) / (1000 * 60 * 60 * 24 * 30) // in months
    return Math.min(timeSpan / 12, 1) // Normalize to 0-1 (max 1 year)
  }

  private calculateQualityConsistency(evidenceList: NormalizedEvidence[]): number {
    if (evidenceList.length === 0) return 0

    const qualities = evidenceList.map(item => this.calculateOverallQuality(item.data.quality))
    const strengths = []
    const avgQuality = this.evidence.reduce((sum: number, item: NormalizedEvidence) => sum + this.calculateOverallQuality(item.data.quality), 0) / this.evidence.length

    if (avgQuality >= 7) strengths.push('High quality contributions')
    if (new Set(this.evidence.map(item => item.platformId)).size >= 3) strengths.push('Diverse platform presence')
    if (this.calculateTimeSpan(this.evidence) >= 0.6) strengths.push('Consistent long-term activity')
    if (this.evidence.filter((item: NormalizedEvidence) => item.type === 'collaboration').length > 0) strengths.push('Strong collaboration skills')

    return strengths
  }

  private identifyGaps(skills: SkillAssessment[]): string[] {
    const gaps = []
    const lowScoreSkills = skills.filter(skill => skill.overallScore < 40)
    const lowConfidenceSkills = skills.filter(skill => skill.confidence < 60)

    if (lowScoreSkills.length > 0) {
      gaps.push(`Several skills need improvement: ${lowScoreSkills.map(s => s.skillName).join(', ')}`)
    }

    if (lowConfidenceSkills.length > 0) {
      gaps.push('Insufficient evidence to confidently assess some skills')
    }

    const evidenceTypes = new Set(this.evidence.map(item => item.type))
    if (!evidenceTypes.has('collaboration')) gaps.push('Limited collaboration evidence')
    if (!evidenceTypes.has('documentation')) gaps.push('Limited documentation evidence')

    return gaps
  }

  private generateRecommendations(skills: SkillAssessment[]): string[] {
    const recommendations = []

    const weakSkills = skills.filter(skill => skill.overallScore < 50)
    if (weakSkills.length > 0) {
      recommendations.push(`Focus on improving: ${weakSkills.map(s => s.skillName).join(', ')}`)
    }

    const platforms = new Set(this.evidence.map(item => item.platformId))
    if (platforms.size < 3) {
      recommendations.push('Connect more platforms to demonstrate diverse skills')
    }

    const recentActivity = this.evidence.filter(item => 
      (Date.now() - item.data.timestamp.getTime()) < 30 * 24 * 60 * 60 * 1000
    )
    if (recentActivity.length < 5) {
      recommendations.push('Increase recent activity to show current skills')
    }

    return recommendations
  }

  private identifySkillStrengths(evidenceList: NormalizedEvidence[]): string[] {
    const strengths = []
    const types = new Set(evidenceList.map(item => item.type))

    if (types.has('project_creation')) strengths.push('Project development')
    if (types.has('code_commit')) strengths.push('Regular code contributions')
    if (types.has('collaboration')) strengths.push('Team collaboration')
    if (types.has('documentation')) strengths.push('Documentation skills')

    const avgComplexity = evidenceList.reduce((sum, item) => sum + item.data.metrics.complexity, 0) / evidenceList.length
    if (avgComplexity >= 7) strengths.push('Complex problem-solving')

    return strengths
  }

  private identifySkillGaps(evidenceList: NormalizedEvidence[]): string[] {
    const gaps = []
    const types = new Set(evidenceList.map(item => item.type))

    if (!types.has('project_creation')) gaps.push('More project-based evidence needed')
    if (!types.has('collaboration')) gaps.push('More collaboration evidence needed')
    if (!types.has('documentation')) gaps.push('More documentation evidence needed')

    const avgComplexity = evidenceList.reduce((sum, item) => sum + item.data.metrics.complexity, 0) / evidenceList.length
    if (avgComplexity < 5) gaps.push('More complex challenges needed')

    return gaps
  }

  private generateSkillExplanation(skillName: string, evidenceList: NormalizedEvidence[], score: number): string {
    const platforms = [...new Set(evidenceList.map(item => this.getPlatformName(item.platformId)))].join(', ')
    const evidenceTypes = [...new Set(evidenceList.map(item => item.type))].length
    const timeSpan = this.calculateTimeSpan(evidenceList)
    const avgQuality = (evidenceList.reduce((sum, item) => sum + this.calculateOverallQuality(item.data.quality), 0) / evidenceList.length).toFixed(1)

    return `${skillName} skill assessed at ${score.toFixed(1)}/100 based on ${evidenceList.length} evidence items from ${platforms}. Analysis shows ${evidenceTypes} different evidence types over ${Math.round(timeSpan * 12)} months with average quality score of ${avgQuality}/10. ${score >= 60 ? 'Strong consistent performance across multiple platforms.' : 'More diverse evidence needed for higher confidence.'}`
  }
}
