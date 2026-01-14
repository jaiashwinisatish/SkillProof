// @ts-nocheck

export const HackerRankAdapter: PlatformAdapter = {
  id: 'hackerrank',
  name: 'HackerRank',
  description: 'Coding challenges and skill assessments',
  icon: 'hackerrank',
  color: '#2ec866',
  isSupported: true,

  async connect(credentials: PlatformCredentials) {
    try {
      const response = await fetch(`https://www.hackerrank.com/rest/hackers/${credentials.username}`, {
        headers: {
          'Cookie': credentials.cookie || ''
        }
      })
      
      if (response.ok) {
        const user = await response.json()
        return {
          success: true,
          connection: {
            id: `hackerrank_${credentials.username}`,
            platformId: 'hackerrank',
            userId: credentials.username,
            credentials,
            isActive: true,
            createdAt: new Date()
          }
        }
      }
      
      return { success: false, error: 'Invalid username or authentication failed' }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  async fetchData(connection) {
    const { username } = connection.credentials
    
    try {
      // Fetch submissions (requires scraping as API is limited)
      const submissionsResponse = await fetch(`https://www.hackerrank.com/rest/hackers/${username}/submissions`, {
        headers: {
          'Cookie': connection.credentials.cookie || ''
        }
      })
      const submissionsData = await submissionsResponse.json()

      // Fetch skills
      const skillsResponse = await fetch(`https://www.hackerrank.com/rest/hackers/${username}/skills`, {
        headers: {
          'Cookie': connection.credentials.cookie || ''
        }
      })
      const skillsData = await skillsResponse.json()

      return [
        ...this.normalizeSubmissions(submissionsData.models || []),
        ...this.normalizeSkills(skillsData.models || [])
      ]
    } catch (error) {
      console.error('HackerRank fetch error:', error)
      return []
    }
  },

  normalizeData(rawData: any[]) {
    return rawData as NormalizedEvidence[]
  },

  normalizeSubmissions(submissions: any[]) {
    return submissions
      .filter(s => s.status === 'Accepted')
      .map(submission => ({
        id: `hr_submission_${submission.id}`,
        type: 'problem_solving' as const,
        timestamp: new Date(submission.created_at),
        metadata: {
          platform: 'hackerrank',
          challengeId: submission.challenge_id,
          challengeName: submission.challenge_name,
          language: submission.language,
          status: submission.status,
          score: submission.score
        }
      }))
  },

  normalizeSkills(skills: any[]) {
    return skills.map(skill => ({
      id: `hr_skill_${skill.id}`,
      type: 'research' as const,
      timestamp: new Date(),
      metadata: {
        platform: 'hackerrank',
        skillName: skill.name,
        level: skill.level,
        score: skill.score,
        stars: skill.stars
      }
    }))
  }
}
