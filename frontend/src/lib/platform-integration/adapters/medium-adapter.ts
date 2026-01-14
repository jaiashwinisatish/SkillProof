// @ts-nocheck

export const MediumAdapter: PlatformAdapter = {
  id: 'medium',
  name: 'Medium',
  description: 'Technical articles and publications',
  icon: 'medium',
  color: '#00ab6c',
  isSupported: true,

  async connect(credentials: PlatformCredentials) {
    try {
      const response = await fetch(`https://api.medium.com/v1/users/${credentials.username}`, {
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
            id: `medium_${user.data.id}`,
            platformId: 'medium',
            userId: user.data.id,
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
      // Fetch user articles (Medium API is limited, using RSS fallback)
      const rssResponse = await fetch(`https://medium.com/feed/@${username}`)
      const rssText = await rssResponse.text()
      
      // Parse RSS feed (simplified parsing)
      const articles = this.parseMediumRSS(rssText)
      
      return this.normalizeArticles(articles)
    } catch (error) {
      console.error('Medium fetch error:', error)
      return []
    }
  },

  normalizeData(rawData: any[]) {
    return rawData as NormalizedEvidence[]
  },

  parseMediumRSS(rssText: string): any[] {
    const articles = []
    const itemRegex = /<item>(.*?)<\/item>/gs
    const titleRegex = /<title>(.*?)<\/title>/s
    const linkRegex = /<link>(.*?)<\/link>/s
    const descriptionRegex = /<description>(.*?)<\/description>/s
    const pubDateRegex = /<pubDate>(.*?)<\/pubDate>/s
    const categoryRegex = /<category>(.*?)<\/category>/gs

    const items = rssText.match(itemRegex) || []
    
    items.forEach(item => {
      const titleMatch = item.match(titleRegex)
      const linkMatch = item.match(linkRegex)
      const descriptionMatch = item.match(descriptionRegex)
      const pubDateMatch = item.match(pubDateRegex)
      const categoryMatches = item.match(categoryRegex) || []

      if (titleMatch && linkMatch) {
        articles.push({
          title: this.stripHTML(titleMatch[1]),
          url: linkMatch[1],
          description: descriptionMatch ? this.stripHTML(descriptionMatch[1]) : '',
          publishedAt: pubDateMatch ? new Date(pubDateMatch[1]) : new Date(),
          tags: categoryMatches.map(cat => this.stripHTML(cat[1]))
        })
      }
    })

    return articles as any[]
  },

  stripHTML(html: string): string {
    return html.replace(/<[^>]*>/g, '').trim()
  },

  normalizeArticles(articles: any[]) {
    return articles.map((article, index) => ({
      id: `medium_article_${index}`,
      type: 'article_publication' as const,
      timestamp: article.publishedAt,
      metadata: {
        platform: 'medium',
        title: article.title,
        description: article.description,
        url: article.url,
        tags: article.tags || []
      }
    }))
  }
}
