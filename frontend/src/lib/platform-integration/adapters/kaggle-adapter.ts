// @ts-nocheck

export const KaggleAdapter: PlatformAdapter = {
  id: 'kaggle',
  name: 'Kaggle',
  description: 'Data science competitions and machine learning projects',
  icon: 'kaggle',
  color: '#20beff',
  isSupported: true,

  async connect(credentials: PlatformCredentials) {
    try {
      const response = await fetch(`https://www.kaggle.com/api/v1/users/${credentials.username}`, {
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
            id: `kaggle_${user.userName}`,
            platformId: 'kaggle',
            userId: user.userName,
            credentials,
            isActive: true,
            createdAt: new Date()
          }
        }
      }
      
      return { success: false, error: 'Invalid credentials or user not found' }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  },

  async fetchData(connection) {
    const { username } = connection.credentials
    
    try {
      // Fetch competitions
      const competitionsResponse = await fetch(`https://www.kaggle.com/api/v1/users/${username}/competitions`, {
        headers: {
          'Authorization': `Bearer ${connection.credentials.accessToken}`,
          'Accept': 'application/json'
        }
      })
      const competitionsData = await competitionsResponse.json()

      // Fetch datasets
      const datasetsResponse = await fetch(`https://www.kaggle.com/api/v1/users/${username}/datasets`, {
        headers: {
          'Authorization': `Bearer ${connection.credentials.accessToken}`,
          'Accept': 'application/json'
        }
      })
      const datasetsData = await datasetsResponse.json()

      // Fetch notebooks
      const notebooksResponse = await fetch(`https://www.kaggle.com/api/v1/users/${username}/kernels`, {
        headers: {
          'Authorization': `Bearer ${connection.credentials.accessToken}`,
          'Accept': 'application/json'
        }
      })
      const notebooksData = await notebooksResponse.json()

      return [
        ...this.normalizeCompetitions(competitionsData || []),
        ...this.normalizeDatasets(datasetsData || []),
        ...this.normalizeNotebooks(notebooksData || [])
      ]
    } catch (error) {
      console.error('Kaggle fetch error:', error)
      return []
    }
  },

  normalizeData(rawData: any[]) {
    return rawData as NormalizedEvidence[]
  },

  normalizeCompetitions(competitions: any[]) {
    return competitions.map(competition => ({
      id: `kaggle_competition_${competition.id}`,
      type: 'presentation' as const,
      timestamp: new Date(competition.dateEntered),
      metadata: {
        platform: 'kaggle',
        title: competition.competitionTitle,
        teamName: competition.teamName,
        teamRank: competition.teamRank,
        rankOutOf: competition.rankOutOf,
        medal: competition.medal
      }
    }))
  },

  normalizeDatasets(datasets: any[]) {
    return datasets.map(dataset => ({
      id: `kaggle_dataset_${dataset.ref}`,
      type: 'research' as const,
      timestamp: new Date(dataset.creationDate),
      metadata: {
        platform: 'kaggle',
        title: dataset.title,
        subtitle: dataset.subtitle,
        description: dataset.description,
        totalDownloads: dataset.totalDownloads,
        totalVotes: dataset.totalVotes,
        usabilityRating: dataset.usabilityRating,
        license: dataset.license
      }
    }))
  },

  normalizeNotebooks(notebooks: any[]) {
    return notebooks.map(notebook => ({
      id: `kaggle_notebook_${notebook.ref}`,
      type: 'project_creation' as const,
      timestamp: new Date(notebook.dateCreated),
      metadata: {
        platform: 'kaggle',
        title: notebook.title,
        subtitle: notebook.subtitle,
        description: notebook.description,
        totalVotes: notebook.totalVotes,
        totalViews: notebook.totalViews,
        language: notebook.language,
        isForked: notebook.isForked,
        forkParent: notebook.forkParent
      }
    }))
  }
}
