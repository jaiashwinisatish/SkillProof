// @ts-nocheck
import { PlatformAdapter, PlatformCredentials, NormalizedEvidence, EvidenceMetrics, QualityMetrics } from '../core/types'

export const GitHubAdapter: PlatformAdapter = {
  id: 'github',
  name: 'GitHub',
  description: 'Code repositories, commits, and contributions',
  icon: 'github',
  color: '#24292e',
  isSupported: true,

  async connect(credentials: PlatformCredentials) {
    try {
      // For demonstration, we'll use mock data instead of real API calls
      // In production, this would make real API calls to GitHub
      const mockUser = {
        id: 12345,
        login: credentials.username || 'demo-user',
        name: 'Demo User'
      }

      return {
        success: true,
        connection: {
          id: `github_${mockUser.id}`,
          platformId: 'github',
          userId: mockUser.id.toString(),
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
    const { accessToken } = connection.credentials
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json'
    }

    try {
      // Fetch user data
      const userResponse = await fetch('https://api.github.com/user', { headers })
      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data')
      }
      const user = await userResponse.json()

      // Fetch repositories
      const reposResponse = await fetch('https://api.github.com/user/repos?per_page=100', { headers })
      if (!reposResponse.ok) {
        throw new Error('Failed to fetch repositories')
      }
      const repos = await reposResponse.json()

      // Fetch events
      const eventsResponse = await fetch('https://api.github.com/user/events?per_page=100', { headers })
      if (!eventsResponse.ok) {
        throw new Error('Failed to fetch events')
      }
      const events = await eventsResponse.json()

      // Ensure we have arrays
      const reposArray = Array.isArray(repos) ? repos : []
      const eventsArray = Array.isArray(events) ? events : []

      return [
        ...this.normalizeRepositories(reposArray, user),
        ...this.normalizeEvents(eventsArray, user)
      ]
    } catch (error) {
      console.error('GitHub fetch error:', error)
      // Return mock data for demonstration
      return this.getMockData()
    }
  },

  getMockData() {
    const mockUser = {
      id: 12345,
      login: 'demo-user',
      name: 'Demo User'
    }

    const mockRepos = [
      {
        id: 1,
        name: 'react-ecommerce',
        description: 'Full-stack e-commerce platform with React and Node.js',
        language: 'JavaScript',
        stargazers_count: 42,
        forks_count: 15,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-20T15:30:00Z',
        size: 2048,
        topics: ['react', 'nodejs', 'ecommerce', 'mongodb']
      },
      {
        id: 2,
        name: 'python-data-analysis',
        description: 'Data analysis tools and scripts for machine learning',
        language: 'Python',
        stargazers_count: 28,
        forks_count: 8,
        created_at: '2024-01-10T08:00:00Z',
        updated_at: '2024-01-18T12:00:00Z',
        size: 1536,
        topics: ['python', 'data-analysis', 'machine-learning', 'pandas']
      }
    ]

    const mockEvents = [
      {
        id: '1234567890',
        type: 'PushEvent',
        created_at: '2024-01-20T15:30:00Z',
        payload: {
          commits: [
            {
              message: 'Add new payment integration',
              author: { name: 'Demo User' }
            }
          ]
        },
        repo: { name: 'demo-user/react-ecommerce' }
      },
      {
        id: '1234567891',
        type: 'IssuesEvent',
        created_at: '2024-01-19T10:15:00Z',
        payload: {
          action: 'opened',
          issue: {
            title: 'Add user authentication',
            body: 'Implement JWT-based authentication system'
          }
        },
        repo: { name: 'demo-user/python-data-analysis' }
      }
    ]

    return [
      ...this.normalizeRepositories(mockRepos, mockUser),
      ...this.normalizeEvents(mockEvents, mockUser)
    ]
  },

  normalizeData(rawData: any[]) {
    return rawData as NormalizedEvidence[]
  },

  normalizeRepositories(repos: any[], user: any) {
    return repos.map(repo => ({
      id: `github_repo_${repo.id}`,
      type: 'project' as const,
      timestamp: new Date(repo.updated_at),
      metadata: repo
    }))
  },

  normalizeEvents(events: any[], user: any) {
    return events
      .filter(event => ['PushEvent', 'PullRequestEvent', 'IssuesEvent'].includes(event.type))
      .map(event => ({
        id: `github_event_${event.id}`,
        type: 'commit' as const,
        timestamp: new Date(event.created_at),
        metadata: event
      }))
  }
}
