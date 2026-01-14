// @ts-nocheck

export const BitbucketAdapter: PlatformAdapter = {
  id: 'bitbucket',
  name: 'Bitbucket',
  description: 'Code repositories and pull requests',
  icon: 'bitbucket',
  color: '#0052cc',
  isSupported: true,

  async connect(credentials: PlatformCredentials) {
    try {
      const response = await fetch('https://api.bitbucket.org/2.0/user', {
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
            id: `bitbucket_${user.uuid}`,
            platformId: 'bitbucket',
            userId: user.uuid,
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
    const userResponse = await fetch('https://api.bitbucket.org/2.0/user', { headers })
    const user = await userResponse.json()

    // Fetch repositories
    const reposResponse = await fetch('https://api.bitbucket.org/2.0/repositories', { headers })
    const repos = await reposResponse.json()

    // Fetch pull requests
    const prsResponse = await fetch(`https://api.bitbucket.org/2.0/repositories/${user.username}/pullrequests?state=merged`, { headers })
    const prs = await prsResponse.json()

    return [
      ...this.normalizeRepositories(repos.values || []),
      ...this.normalizePullRequests(prs.values || [])
    ]
  },

  normalizeData(rawData: any[]) {
    return rawData as NormalizedEvidence[]
  },

  normalizeRepositories(repositories: any[]) {
    return repositories.map(repo => ({
      id: `bitbucket_repo_${repo.uuid}`,
      type: 'project' as const,
      timestamp: new Date(repo.updated_on),
      metadata: repo
    }))
  },

  normalizePullRequests(pullRequests: any[]) {
    return pullRequests.map(pr => ({
      id: `bitbucket_pr_${pr.id}`,
      type: 'code_commit' as const,
      timestamp: new Date(pr.created_on),
      metadata: pr
    }))
  }
}
