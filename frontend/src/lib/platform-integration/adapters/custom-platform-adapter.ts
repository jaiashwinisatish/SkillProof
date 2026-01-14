// @ts-nocheck

export class CustomPlatformAdapter implements PlatformAdapter {
  id: string
  name: string
  description: string
  icon: string
  color: string
  isSupported: boolean
  private config: CustomPlatformConfig

  constructor(config: CustomPlatformConfig) {
    this.config = config
    this.id = config.id
    this.name = config.name
    this.description = config.description
    this.icon = config.icon || 'globe'
    this.color = config.color || '#6b7280'
    this.isSupported = true
  }

  async connect(credentials: PlatformCredentials) {
    try {
      // Test connection to custom platform
      const response = await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.config.headers,
          ...credentials
        }
      })

      if (response.ok) {
        const data = await response.json()
        return {
          success: true,
          connection: {
            id: `custom_${this.config.id}`,
            platformId: this.config.id,
            userId: data.userId || credentials.userId || 'unknown',
            credentials,
            isActive: true,
            createdAt: new Date()
          }
        }
      }
      
      return { success: false, error: 'Connection failed' }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async fetchData(connection: PlatformConnection) {
    try {
      const { credentials } = connection
      
      // Fetch data from custom platform
      const response = await fetch(`${this.config.apiEndpoint}/data`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...this.config.headers,
          ...credentials
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const rawData = await response.json()
      return this.normalizeData(rawData)
    } catch (error) {
      console.error(`Custom platform ${this.name} fetch error:`, error)
      return []
    }
  }

  normalizeData(rawData: any[]): NormalizedEvidence[] {
    if (!Array.isArray(rawData)) {
      rawData = [rawData]
    }

    return rawData.map((item, index) => {
      const evidenceType = this.determineEvidenceType(item)
      const skillTags = this.extractSkillTags(item)
      const metrics = this.calculateMetrics(item)
      const quality = this.assessQuality(item)

      return {
        id: item.id || `custom_${this.config.id}_${index}`,
        platformId: this.config.id,
        type: evidenceType,
        skillTags,
        data: {
          title: item.title || item.name || 'Untitled Activity',
          description: item.description || item.summary || 'No description available',
          url: item.url || item.link,
          timestamp: new Date(item.timestamp || item.date || item.created_at || Date.now()),
          metrics,
          quality
        }
      }
    })
  }

  private determineEvidenceType(item: any): any {
    const type = item.type || item.category || item.kind
    
    // Map common types to our evidence types
    const typeMapping = {
      'commit': 'code_commit',
      'project': 'project_creation',
      'article': 'article_publication',
      'submission': 'problem_solving',
      'review': 'code_review',
      'doc': 'documentation',
      'presentation': 'presentation',
      'research': 'research',
      'mentor': 'mentoring',
      'collaboration': 'collaboration'
    }

    return typeMapping[type.toLowerCase()] || 'project_creation'
  }

  private extractSkillTags(item: any): string[] {
    // Extract skills from various possible fields
    const tags = [
      ...(item.skills || []),
      ...(item.technologies || []),
      ...(item.tags || []),
      ...(item.languages || [])
    ]

    // Also try to extract from title/description
    const text = `${item.title || ''} ${item.description || ''}`.toLowerCase()
    const commonSkills = [
      'javascript', 'python', 'java', 'react', 'nodejs', 'typescript',
      'html', 'css', 'sql', 'git', 'docker', 'aws', 'mongodb',
      'postgresql', 'angular', 'vue', 'express', 'django', 'flask'
    ]

    commonSkills.forEach(skill => {
      if (text.includes(skill) && !tags.includes(skill)) {
        tags.push(skill)
      }
    })

    return [...new Set(tags)] // Remove duplicates
  }

  private calculateMetrics(item: any) {
    // Calculate metrics based on available data
    return {
      frequency: this.calculateFrequency(item),
      complexity: this.calculateComplexity(item),
      consistency: this.calculateConsistency(item),
      growth: this.calculateGrowth(item),
      depth: this.calculateDepth(item)
    }
  }

  private assessQuality(item: any) {
    return {
      originality: this.assessOriginality(item),
      technicalDepth: this.assessTechnicalDepth(item),
      bestPractices: this.assessBestPractices(item),
      documentation: this.assessDocumentation(item),
      collaboration: this.assessCollaboration(item)
    }
  }

  private calculateFrequency(item: any): number {
    // Use likes, views, forks, or other engagement metrics
    const engagement = 
      item.likes || item.stars || item.forks || item.views || 
      item.upvotes || item.claps || item.bookmarks || 1
    
    return Math.min(engagement / 10, 10) // Normalize to 0-10
  }

  private calculateComplexity(item: any): number {
    // Assess based on description length, technologies used, etc.
    const description = item.description || ''
    const technologies = (item.technologies || []).length
    const linesOfCode = item.lines_of_code || item.loc || 0
    
    let complexity = 0
    if (description.length > 500) complexity += 2
    if (technologies > 3) complexity += 2
    if (linesOfCode > 1000) complexity += 3
    if (linesOfCode > 5000) complexity += 3
    
    return Math.min(complexity, 10)
  }

  private calculateConsistency(item: any): number {
    // Use historical data if available
    if (item.history || item.activity_log) {
      const activities = item.history || item.activity_log
      const recent = activities.slice(-10) // Last 10 activities
      const frequency = recent.length
      
      // Check regularity
      let consistency = 0
      for (let i = 1; i < recent.length; i++) {
        const gap = new Date(recent[i].date) - new Date(recent[i-1].date)
        if (gap <= 7 * 24 * 60 * 60 * 1000) { // Within a week
          consistency += 1
        }
      }
      
      return (consistency / Math.max(recent.length - 1, 1)) * 10
    }
    
    return 5 // Default medium consistency
  }

  private calculateGrowth(item: any): number {
    // Compare recent vs older activity
    if (item.progress || item.improvement) {
      return Math.min(item.progress * 10, 10)
    }
    
    if (item.evolution || item.version_history) {
      const versions = item.evolution || item.version_history
      if (versions.length > 1) {
        const recent = versions.slice(-3)
        const older = versions.slice(0, -3)
        
        const recentQuality = recent.reduce((sum, v) => sum + (v.quality || 0), 0) / recent.length
        const olderQuality = older.reduce((sum, v) => sum + (v.quality || 0), 0) / older.length
        
        return Math.min((recentQuality - olderQuality) * 2, 10)
      }
    }
    
    return 5 // Default medium growth
  }

  private calculateDepth(item: any): number {
    // Assess contribution depth
    let depth = 0
    
    if (item.contributions) depth += Math.min(item.contributions.length, 3)
    if (item.comments || item.reviews) depth += 2
    if (item.documentation || item.wiki) depth += 2
    if (item.mentoring || item.guidance) depth += 3
    
    return Math.min(depth, 10)
  }

  private assessOriginality(item: any): number {
    // Check for originality indicators
    let score = 5 // Base score
    
    if (item.original || item.unique) score += 2
    if (item.citations || item.references) score += 1
    if (item.plagiarism_score !== undefined) {
      score = 10 - item.plagiarism_score * 10
    }
    
    return Math.max(0, Math.min(score, 10))
  }

  private assessTechnicalDepth(item: any): number {
    const technologies = item.technologies || item.skills || []
    const advancedTech = ['kubernetes', 'tensorflow', 'pytorch', 'react', 'vue', 'angular', 'microservices']
    
    let depth = 0
    technologies.forEach(tech => {
      if (advancedTech.includes(tech.toLowerCase())) depth += 2
      else depth += 1
    })
    
    return Math.min(depth, 10)
  }

  private assessBestPractices(item: any): number {
    let score = 5 // Base score
    
    if (item.tests || item.test_coverage) score += 2
    if (item.ci_cd || item.automated) score += 2
    if (item.code_review || item.peer_review) score += 1
    
    return Math.min(score, 10)
  }

  private assessDocumentation(item: any): number {
    let score = 0
    
    if (item.readme || item.documentation) score += 3
    if (item.api_docs || item.endpoints) score += 3
    if (item.examples || item.tutorials) score += 2
    if (item.comments_ratio || item.documented_functions) score += 2
    
    return Math.min(score, 10)
  }

  private assessCollaboration(item: any): number {
    let score = 0
    
    if (item.collaborators || item.team_size) score += 2
    if (item.pull_requests || item.merges) score += 3
    if (item.code_reviews || item.feedback) score += 3
    if (item.mentoring || item.guidance) score += 2
    
    return Math.min(score, 10)
  }
}

export interface CustomPlatformConfig {
  id: string
  name: string
  description: string
  apiEndpoint: string
  headers?: Record<string, string>
  icon?: string
  color?: string
  authentication?: {
    type: 'bearer' | 'basic' | 'api_key' | 'custom'
    fields: string[]
  }
}
