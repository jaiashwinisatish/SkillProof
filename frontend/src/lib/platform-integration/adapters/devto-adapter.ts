// @ts-nocheck

export const DevToAdapter: PlatformAdapter = {
  id: 'devto',
  name: 'Dev.to',
  description: 'Technical articles and blog posts',
  icon: 'dev',
  color: '#23272a',
  isSupported: true,

  async connect(credentials: PlatformCredentials) {
    try {
      const response = await fetch(`https://dev.to/api/users/by_username?url=${credentials.username}`)
      
      if (response.ok) {
        const user = await response.json()
        return {
          success: true,
          connection: {
            id: `devto_${user.id}`,
            platformId: 'devto',
            userId: user.id.toString(),
            credentials,
            isActive: true,
            createdAt: new Date()
          }
        }
      }
      
      return { success: false, error: 'Invalid username or user not found' }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  },

  async fetchData(connection) {
    const { username } = connection.credentials
    
    try {
      // Fetch user articles
      const articlesResponse = await fetch(`https://dev.to/api/articles?username=${username}&per_page=100`)
      const articlesData = await articlesResponse.json()

      return this.normalizeArticles(articlesData || [])
    } catch (error) {
      console.error('Dev.to fetch error:', error)
      return []
    }
  },

  normalizeData(rawData: any[]) {
    return rawData as NormalizedEvidence[]
  },

  normalizeArticles(articles: any[]) {
    return articles.map(article => ({
      id: `devto_article_${article.id}`,
      type: 'article_publication' as const,
      timestamp: new Date(article.published_at),
      metadata: {
        platform: 'devto',
        title: article.title,
        description: article.description,
        url: article.url,
        tags: article.tag_list || [],
        positiveReactionsCount: article.positive_reactions_count,
        commentsCount: article.comments_count,
        readingTimeMinutes: article.reading_time_minutes,
        coverImage: article.cover_image
      }
    }))
  }
}
