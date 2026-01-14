import { PlatformAdapter, PlatformCredentials, NormalizedEvidence } from '../core/types'

export const LeetCodeAdapter: PlatformAdapter = {
  id: 'leetcode',
  name: 'LeetCode',
  description: 'Algorithmic problem solving and coding challenges',
  icon: 'code',
  color: '#ffa116',
  isSupported: true,

  async connect(credentials: PlatformCredentials) {
    try {
      // For demonstration, use mock data instead of real API calls
      const mockUser = {
        username: credentials.username || 'demo-user',
        realName: 'Demo User',
        userAvatar: 'https://assets.leetcode.com/static/images/public/leetcode_logo.png',
        ranking: {
          currentRating: 1500,
          topPercentage: 25
        }
      }

      return {
        success: true,
        connection: {
          id: `leetcode_${mockUser.username}`,
          platformId: 'leetcode',
          userId: mockUser.username,
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
    const { username } = connection.credentials
    
    try {
      // For demonstration, return mock data instead of real API calls
      const mockSubmissions = [
        {
          id: 'leetcode_sub_1',
          type: 'submission' as const,
          timestamp: new Date('2024-01-20T10:00:00Z'),
          metadata: {
            platform: 'leetcode',
            problemId: 'two-sum',
            problemName: 'Two Sum',
            difficulty: 'Easy',
            status: 'Accepted',
            programmingLanguage: 'JavaScript',
            runtime: '64ms',
            memory: '42.3MB'
          }
        },
        {
          id: 'leetcode_sub_2',
          type: 'submission' as const,
          timestamp: new Date('2024-01-19T15:30:00Z'),
          metadata: {
            platform: 'leetcode',
            problemId: 'add-two-numbers',
            problemName: 'Add Two Numbers',
            difficulty: 'Medium',
            status: 'Accepted',
            programmingLanguage: 'Python',
            runtime: '72ms',
            memory: '14.2MB'
          }
        },
        {
          id: 'leetcode_contest_1',
          type: 'contribution' as const,
          timestamp: new Date('2024-01-18T12:00:00Z'),
          metadata: {
            platform: 'leetcode',
            contestName: 'Weekly Contest 378',
            rank: 1234,
            rating: 1500,
            problemsSolved: 3,
            totalProblems: 4
          }
        }
      ]

      return mockSubmissions
    } catch (error) {
      console.error('LeetCode fetch error:', error)
      return []
    }
  },

  normalizeData(rawData: any[]) {
    return rawData as NormalizedEvidence[]
  }
}
