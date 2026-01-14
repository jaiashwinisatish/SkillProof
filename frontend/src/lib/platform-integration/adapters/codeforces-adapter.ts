// @ts-nocheck

export const CodeforcesAdapter: PlatformAdapter = {
  id: 'codeforces',
  name: 'Codeforces',
  description: 'Competitive programming contests and problem solving',
  icon: 'codeforces',
  color: '#1f8acb',
  isSupported: true,

  async connect(credentials: PlatformCredentials) {
    try {
      const response = await fetch(`https://codeforces.com/api/user.info?handles=${credentials.username}`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.status === 'OK' && data.result.length > 0) {
          const user = data.result[0]
          return {
            success: true,
            connection: {
              id: `codeforces_${user.handle}`,
              platformId: 'codeforces',
              userId: user.handle,
              credentials,
              isActive: true,
              createdAt: new Date()
            }
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
      // Fetch user submissions
      const submissionsResponse = await fetch(`https://codeforces.com/api/user.status?handle=${username}&count=1000`)
      const submissionsData = await submissionsResponse.json()

      // Fetch contest history
      const contestsResponse = await fetch(`https://codeforces.com/api/user.rating?handle=${username}`)
      const contestsData = await contestsResponse.json()

      // Fetch user info for rating
      const userInfoResponse = await fetch(`https://codeforces.com/api/user.info?handles=${username}`)
      const userInfoData = await userInfoResponse.json()

      return [
        ...this.normalizeSubmissions(submissionsData.result || []),
        ...this.normalizeContests(contestsData.result || []),
        ...this.normalizeUserInfo(userInfoData.result || [])
      ]
    } catch (error) {
      console.error('Codeforces fetch error:', error)
      return []
    }
  },

  normalizeData(rawData: any[]) {
    return rawData as NormalizedEvidence[]
  },

  normalizeSubmissions(submissions: any[]) {
    const successfulSubmissions = submissions.filter(s => s.verdict === 'OK')
    
    return successfulSubmissions.map(submission => ({
      id: `cf_submission_${submission.id}`,
      type: 'problem_solving' as const,
      timestamp: new Date(submission.creationTimeSeconds * 1000),
      metadata: {
        platform: 'codeforces',
        problemId: submission.problem.contestId + submission.problem.index,
        problemName: submission.problem.name,
        rating: submission.problem.rating,
        programmingLanguage: submission.programmingLanguage,
        timeConsumed: submission.timeConsumedMillis,
        memoryConsumed: submission.memoryConsumedBytes
      }
    }))
  },

  normalizeContests(contests: any[]) {
    return contests.map(contest => ({
      id: `cf_contest_${contest.contestId}`,
      type: 'presentation' as const,
      timestamp: new Date(contest.ratingUpdateTimeSeconds * 1000),
      metadata: {
        platform: 'codeforces',
        contestName: contest.contestName,
        rank: contest.rank,
        rating: contest.newRating,
        oldRating: contest.oldRating,
        performance: contest.newRating - contest.oldRating
      }
    }))
  },

  normalizeUserInfo(users: any[]) {
    if (users.length === 0) return []
    
    const user = users[0]
    return [{
      id: `cf_profile_${user.handle}`,
      type: 'research' as const,
      timestamp: new Date(),
      metadata: {
        platform: 'codeforces',
        handle: user.handle,
        rating: user.rating,
        maxRating: user.maxRating,
        rank: user.rank,
        contribution: user.contribution,
        friendOfCount: user.friendOfCount,
        organization: user.organization
      }
    }]
  }
}
