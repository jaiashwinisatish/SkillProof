// @ts-nocheck

export const DevpostAdapter: PlatformAdapter = {
  id: 'devpost',
  name: 'Devpost',
  description: 'Hackathon projects and competition submissions',
  icon: 'trophy',
  color: '#003e54',
  isSupported: true,

  async connect(credentials: PlatformCredentials) {
    try {
      // Devpost API for user projects
      const response = await fetch(`https://devpost.com/api/users/${credentials.username}`)
      
      if (response.ok) {
        const user = await response.json()
        return {
          success: true,
          connection: {
            id: `devpost_${user.id}`,
            platformId: 'devpost',
            userId: user.id.toString(),
            credentials,
            isActive: true,
            createdAt: new Date()
          }
        }
      }
      
      return { success: false, error: 'Invalid username or API error' }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  async fetchData(connection) {
    const { username } = connection.credentials
    
    try {
      // Fetch user projects
      const projectsResponse = await fetch(`https://devpost.com/api/users/${username}/projects`)
      const projects = await projectsResponse.json()

      // Fetch hackathon participation
      const hackathonsResponse = await fetch(`https://devpost.com/api/users/${username}/hackathons`)
      const hackathons = await hackathonsResponse.json()

      return [
        ...this.normalizeProjects(projects),
        ...this.normalizeHackathons(hackathons)
      ]
    } catch (error) {
      console.error('Devpost fetch error:', error)
      return []
    }
  },

  normalizeData(rawData: any[]) {
    return rawData as NormalizedEvidence[]
  },

  normalizeProjects(projects: any[]) {
    return projects.map(project => ({
      id: `devpost_project_${project.id}`,
      type: 'project' as const,
      timestamp: new Date(project.created_at || project.updated_at),
      metadata: {
        platform: 'devpost',
        title: project.name,
        description: project.tagline || project.short_description,
        url: project.url,
        technologies: project.tags || [],
        likes: project.like_count || 0,
        comments: project.comment_count || 0,
        winners: project.winners ? 1 : 0,
        teamSize: project.members ? project.members.length : 1,
        hasDemo: project.demo_url ? true : false,
        hasSource: project.github_url ? true : false
      }
    }))
  },

  normalizeHackathons(hackathons: any[]) {
    return hackathons.map(hackathon => ({
      id: `devpost_hackathon_${hackathon.id}`,
      type: 'presentation' as const,
      timestamp: new Date(hackathon.created_at),
      metadata: {
        platform: 'devpost',
        title: hackathon.title,
        url: hackathon.url,
        participantCount: hackathon.participant_count || 0,
        projectCount: hackathon.project_count || 0,
        prizeMoney: hackathon.prize_amount || 0,
        duration: this.calculateDuration(hackathon.starts_at, hackathon.ends_at),
        difficulty: this.assessDifficulty(hackathon)
      }
    }))
  },

  calculateDuration(startDate: string, endDate: string): number {
    const start = new Date(startDate)
    const end = new Date(endDate)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  },

  assessDifficulty(hackathon: any): string {
    const participantCount = hackathon.participant_count || 0
    const prizeMoney = hackathon.prize_amount || 0
    
    if (participantCount > 1000 || prizeMoney > 10000) return 'Expert'
    if (participantCount > 500 || prizeMoney > 5000) return 'Advanced'
    if (participantCount > 100 || prizeMoney > 1000) return 'Intermediate'
    return 'Beginner'
  }
}
