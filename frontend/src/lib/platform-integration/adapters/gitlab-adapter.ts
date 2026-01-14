// @ts-nocheck

export const GitLabAdapter: PlatformAdapter = {
  id: 'gitlab',
  name: 'GitLab',
  description: 'Git repositories, commits, and CI/CD pipelines',
  icon: 'gitlab',
  color: '#fc6d26',
  isSupported: true,

  async connect(credentials: PlatformCredentials) {
    try {
      const response = await fetch('https://gitlab.com/api/v4/user', {
        headers: {
          'Authorization': `Bearer ${credentials.accessToken}`,
          'Accept': 'application/json'
        }
      })
      
      if (response.ok) {
        const user = await response.json()
        return {
          success: true,
          connection: {
            id: `gitlab_${user.id}`,
            platformId: 'gitlab',
            userId: user.id.toString(),
            credentials,
            isActive: true,
            createdAt: new Date()
          }
        }
      }
      
      return { success: false, error: 'Invalid credentials' }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  async fetchData(connection) {
    const { accessToken } = connection.credentials
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json'
    }

    // Fetch user data
    const userResponse = await fetch('https://gitlab.com/api/v4/user', { headers })
    const user = await userResponse.json()

    // Fetch projects
    const projectsResponse = await fetch(`https://gitlab.com/api/v4/projects?membership=true&per_page=100`, { headers })
    const projects = await projectsResponse.json()

    // Fetch events
    const eventsResponse = await fetch(`https://gitlab.com/api/v4/events?per_page=100`, { headers })
    const events = await eventsResponse.json()

    return [
      ...this.normalizeProjects(projects),
      ...this.normalizeEvents(events, user.username)
    ]
  },

  normalizeData(rawData: any[]) {
    return rawData as NormalizedEvidence[]
  },

  normalizeProjects(projects: any[]) {
    return projects.map(project => ({
      id: `gitlab_project_${project.id}`,
      type: 'project' as const,
      timestamp: new Date(project.last_activity_at),
      metadata: project
    }))
  },

  normalizeEvents(events: any[], username: string) {
    return events
      .filter(event => ['push', 'merge_request', 'issue'].includes(event.action_name))
      .map(event => ({
        id: `gitlab_event_${event.id}`,
        type: 'code_commit' as const,
        timestamp: new Date(event.created_at),
        metadata: event
      }))
  }
}
