// @ts-nocheck

export const FreelanceAdapter: PlatformAdapter = {
  id: 'freelance',
  name: 'Freelance Projects',
  description: 'Client projects and freelance work',
  icon: 'briefcase',
  color: '#6b46c1',
  isSupported: true,

  async connect(credentials: PlatformCredentials) {
    try {
      // For freelance work, we'll use a manual verification approach
      // User provides project details and we verify them
      return {
        success: true,
        connection: {
          id: `freelance_${Date.now()}`,
          platformId: 'freelance',
          userId: credentials.userId || 'manual',
          credentials,
          isActive: true,
          createdAt: new Date()
        }
      }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  },

  async fetchData(connection) {
    try {
      // Fetch manually submitted freelance projects
      const response = await fetch('/api/freelance/projects', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${connection.credentials.accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const projects = await response.json()
        return this.normalizeProjects(projects || [])
      }

      return []
    } catch (error) {
      console.error('Freelance fetch error:', error)
      return []
    }
  },

  normalizeData(rawData: any[]) {
    return rawData as NormalizedEvidence[]
  },

  normalizeProjects(projects: any[]) {
    return projects.map(project => ({
      id: `freelance_project_${project.id}`,
      type: 'project_creation' as const,
      timestamp: new Date(project.completedAt || project.createdAt),
      metadata: {
        platform: 'freelance',
        title: project.title,
        description: project.description,
        clientName: project.clientName,
        budget: project.budget,
        duration: project.duration,
        technologies: project.technologies || [],
        rating: project.rating,
        testimonial: project.testimonial,
        verificationStatus: project.verificationStatus,
        proofDocuments: project.proofDocuments || []
      }
    }))
  }
}
