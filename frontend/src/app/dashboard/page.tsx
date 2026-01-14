'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, User, Code, Award, TrendingUp, Settings, LogOut, Link2, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { IntegrationService } from '@/lib/platform-integration/core/integration-service'
import { SkillAnalyzer } from '@/lib/platform-integration/core/skill-analyzer'
import type { NormalizedEvidence, SkillVerificationResult } from '@/lib/platform-integration/core/types'

export default function DashboardPage() {
  const [integrationService] = useState(() => IntegrationService.getInstance())
  const [connections, setConnections] = useState<any[]>([])
  const [evidence, setEvidence] = useState<NormalizedEvidence[]>([])
  const [verificationResult, setVerificationResult] = useState<SkillVerificationResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasIntegrations, setHasIntegrations] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setIsLoading(true)
    
    try {
      // Load connections
      await integrationService.loadConnections()
      const loadedConnections = integrationService.getConnections()
      setConnections(loadedConnections)
      setHasIntegrations(loadedConnections.length > 0)

      if (loadedConnections.length > 0) {
        // Load and sync evidence
        const syncedEvidence = await integrationService.syncAllPlatforms()
        setEvidence(syncedEvidence)
        await integrationService.saveEvidence(syncedEvidence)

        // Analyze skills if we have evidence
        if (syncedEvidence.length > 0) {
          const analyzer = new SkillAnalyzer(syncedEvidence)
          const result = analyzer.analyzeSkills()
          setVerificationResult(result)
        }
      } else {
        setEvidence([])
        setVerificationResult(null)
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    await loadDashboardData()
  }

  const getDataQualityColor = (quality: string) => {
    switch (quality) {
      case 'High':
        return 'text-green-600 bg-green-50'
      case 'Medium':
        return 'text-yellow-600 bg-yellow-50'
      case 'Low':
        return 'text-orange-600 bg-orange-50'
      case 'Insufficient':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600'
    if (confidence >= 60) return 'text-yellow-600'
    if (confidence >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  // No integrations state
  if (!hasIntegrations && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Navigation */}
        <nav className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-8">
                <Link href="/" className="flex items-center space-x-2">
                  <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">SP</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">SkillProof</span>
                </Link>
                
                <div className="flex space-x-1">
                  <Link href="/dashboard">
                    <Button variant="default" size="sm">Overview</Button>
                  </Link>
                  <Link href="/dashboard/projects">
                    <Button variant="ghost" size="sm">Projects</Button>
                  </Link>
                  <Link href="/dashboard/skills">
                    <Button variant="ghost" size="sm">Skills</Button>
                  </Link>
                  <Link href="/dashboard/profile">
                    <Button variant="ghost" size="sm">Profile</Button>
                  </Link>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Link href="/dashboard/platforms">
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Integrations
                  </Button>
                </Link>
                <Button variant="ghost" size="sm">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0 sm:py-0">
            {/* Empty State */}
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Link2 className="h-12 w-12 text-gray-400" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                No Integrations Found
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                Connect platforms to generate skill analysis. Your dashboard will update automatically after integration.
              </p>
              <div className="space-y-4 max-w-sm mx-auto text-left">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Get Started:</h3>
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-start">
                    <span className="text-blue-600 mr-3">1.</span>
                    <span>Click "Integrations" to connect platforms you use</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-blue-600 mr-3">2.</span>
                    <span>Connect GitHub, LeetCode, Devpost, or any supported platform</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-blue-600 mr-3">3.</span>
                    <span>Real data will be fetched and analyzed automatically</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-blue-600 mr-3">4.</span>
                    <span>Receive personalized skill verification based on your actual work</span>
                  </div>
                </div>
              </div>
              <Link href="/dashboard/platforms">
                <Button size="lg" className="mt-8">
                  <Link2 className="h-4 w-4 mr-2" />
                  Integrate Platforms
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">SP</span>
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">SkillProof</span>
              </Link>
              
              <div className="flex space-x-1">
                <Link href="/dashboard">
                  <Button variant="default" size="sm">Overview</Button>
                </Link>
                <Link href="/dashboard/projects">
                  <Button variant="ghost" size="sm">Projects</Button>
                </Link>
                <Link href="/dashboard/skills">
                  <Button variant="ghost" size="sm">Skills</Button>
                </Link>
                <Link href="/dashboard/profile">
                  <Button variant="ghost" size="sm">Profile</Button>
                </Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/platforms">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Integrations ({connections.length})
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleRefresh}>
                <TrendingUp className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0 sm:py-0">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome back! 👋
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Here's your skill verification journey based on real platform data.
            </p>
          </div>

          {/* Data Quality Indicator */}
          {verificationResult && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  {verificationResult.dataQuality === 'High' || verificationResult.dataQuality === 'Medium' ? (
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 mr-2 text-yellow-500" />
                  )}
                  Data Quality: {verificationResult.dataQuality}
                </CardTitle>
                <CardDescription>
                  Based on {connections.length} integrated platform{connections.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {verificationResult.overallScore.toFixed(1)}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Overall Score
                    </p>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getConfidenceColor(verificationResult.confidence)}`}>
                      {verificationResult.confidence.toFixed(1)}%
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Confidence
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {verificationResult.skills.length}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Skills Verified
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {evidence.length}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Evidence Items
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Grid - Only show if we have real data */}
          {verificationResult && verificationResult.dataQuality !== 'Insufficient' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Verified Skills</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{verificationResult.skills.length}</div>
                  <p className="text-xs text-muted-foreground">
                    From {connections.length} platform{connections.length !== 1 ? 's' : ''}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Confidence</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${getConfidenceColor(verificationResult.confidence)}`}>
                    {verificationResult.confidence.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Based on data quality
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Evidence Items</CardTitle>
                  <Code className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{evidence.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Real activity data
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Platforms</CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{connections.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Connected
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Skills Breakdown */}
          {verificationResult && verificationResult.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Your Verified Skills</CardTitle>
                <CardDescription>
                  Skills determined from your actual platform activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {verificationResult.skills.map((skill, index) => (
                    <div key={skill.skillName} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {skill.skillName}
                          </h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              skill.level === 'Expert' ? 'bg-purple-100 text-purple-800' :
                              skill.level === 'Advanced' ? 'bg-blue-100 text-blue-800' :
                              skill.level === 'Intermediate' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {skill.level}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {skill.overallScore.toFixed(1)}/100
                            </span>
                            <span className={`text-sm ${getConfidenceColor(skill.confidence)}`}>
                              ({skill.confidence.toFixed(1)}% confidence)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Platform Contributions */}
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Evidence Sources
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {skill.breakdown.platforms.map((platform, pIndex) => (
                            <div key={pIndex} className="flex items-center bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-sm">
                              <div 
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: platform.platformId === 'github' ? '#24292e' : platform.platformId === 'leetcode' ? '#ffa116' : '#6b7280' }}
                              />
                              <span>{platform.platformName}</span>
                              <span className="ml-2 text-gray-600 dark:text-gray-400">
                                ({platform.evidenceCount} items)
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Explanation */}
                      <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          How this was calculated
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {skill.explanation}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Insights */}
          {verificationResult && verificationResult.dataQuality !== 'Insufficient' && (
            <Card>
              <CardHeader>
                <CardTitle>Personalized Insights</CardTitle>
                <CardDescription>
                  Based on your actual platform activity and contributions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Strengths */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                      Your Strengths
                    </h4>
                    <ul className="space-y-2">
                      {verificationResult.insights.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                          <Award className="h-4 w-4 mr-2 text-green-500" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Improvement Areas */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                      <AlertCircle className="h-5 w-5 mr-2 text-orange-500" />
                      Improvement Areas
                    </h4>
                    <ul className="space-y-2">
                      {verificationResult.insights.improvementAreas.map((area, index) => (
                        <li key={index} className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                          <Code className="h-4 w-4 mr-2 text-orange-500" />
                          {area}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
                      Recommendations
                    </h4>
                    <ul className="space-y-2">
                      {verificationResult.insights.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                          <span className="h-4 w-4 mr-2 text-blue-500">→</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Call to Action */}
          {verificationResult && verificationResult.dataQuality === 'Low' && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-orange-800 flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  More Data Needed for Accurate Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    We have some data but need more diverse activity for confident skill verification.
                  </p>
                  <Link href="/dashboard/platforms">
                    <Button>
                      <Link2 className="h-4 w-4 mr-2" />
                      Connect More Platforms
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
