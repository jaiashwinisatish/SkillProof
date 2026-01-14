'use client'

// @ts-nocheck

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, RefreshCw, CheckCircle, AlertCircle, TrendingUp, BarChart3, Eye, Code, Award, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SkillAnalyzer } from '@/lib/platform-integration/core/skill-analyzer'
import { IntegrationService } from '@/lib/platform-integration/core/integration-service'
import type { SkillVerificationResult, NormalizedEvidence } from '@/lib/platform-integration/core/types'

export default function SkillVerificationPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [verificationResult, setVerificationResult] = useState<SkillVerificationResult | null>(null)
  const [mockEvidence, setMockEvidence] = useState<NormalizedEvidence[]>([
    {
      id: 'mock_1',
      platformId: 'github',
      type: 'code_commit',
      skillTags: ['javascript', 'react'],
      data: {
        title: 'Sample commit',
        description: 'Mock commit for demonstration',
        url: 'https://github.com/example/repo',
        timestamp: new Date('2024-01-01'),
        metrics: { frequency: 8, complexity: 6, consistency: 7, growth: 5, depth: 4 },
        quality: { originality: 8, technicalDepth: 7, bestPractices: 6, documentation: 5, collaboration: 6 }
      }
    }
  ])

  useEffect(() => {
    loadRealData()
  }, [])

  const loadRealData = async () => {
    try {
      // Load real evidence from integration service
      const integrationService = IntegrationService.getInstance()
      await integrationService.loadConnections()
      await integrationService.loadEvidence()
      
      const loadedEvidence = await integrationService.loadEvidence()
      setEvidence(loadedEvidence)

      if (loadedEvidence.length > 0) {
        const analyzer = new SkillAnalyzer(loadedEvidence)
        const result = analyzer.analyzeSkills()
        setVerificationResult(result)
      } else {
        setVerificationResult(null)
      }
    } catch (error) {
      console.error('Failed to load real data:', error)
    }
  }

  const handleAnalyzeSkills = async () => {
    setIsAnalyzing(true)
    
    try {
      // Load real evidence from integration service
      const integrationService = IntegrationService.getInstance()
      const loadedEvidence = await integrationService.loadEvidence()
      
      if (loadedEvidence.length > 0) {
        const analyzer = new SkillAnalyzer(loadedEvidence)
        const result = analyzer.analyzeSkills()
        setVerificationResult(result)
      } else {
        setVerificationResult(null)
      }
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setIsAnalyzing(false)
    }
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

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'Expert':
        return 'bg-purple-100 text-purple-800'
      case 'Advanced':
        return 'bg-blue-100 text-blue-800'
      case 'Intermediate':
        return 'bg-green-100 text-green-800'
      case 'Beginner':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">SP</span>
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">SkillProof</span>
              </Link>
              
              <div className="flex space-x-1">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">Overview</Button>
                </Link>
                <Link href="/dashboard/projects">
                  <Button variant="ghost" size="sm">Projects</Button>
                </Link>
                <Link href="/dashboard/skills">
                  <Button variant="default" size="sm">Skills</Button>
                </Link>
                <Link href="/dashboard/profile">
                  <Button variant="ghost" size="sm">Profile</Button>
                </Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
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
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Skill Verification Analysis
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                AI-powered analysis based on your platform activity and contributions
              </p>
            </div>
            <Button 
              onClick={handleAnalyzeSkills}
              disabled={isAnalyzing || mockEvidence.length === 0}
              className="flex items-center"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analyze Skills
                </>
              )}
            </Button>
          </div>

          {/* Data Quality Indicator */}
          {verificationResult && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Data Quality Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getDataQualityColor(verificationResult.dataQuality)}`}>
                      {verificationResult.dataQuality}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Data Quality
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {verificationResult.confidence.toFixed(1)}%
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Confidence
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {verificationResult.skills.length}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Skills Analyzed
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {mockEvidence.length}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Evidence Items
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {verificationResult && verificationResult.dataQuality !== 'Insufficient' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Overall Score */}
              <Card>
                <CardHeader>
                  <CardTitle>Overall Skill Score</CardTitle>
                  <CardDescription>
                    Weighted average across all verified skills
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${getConfidenceColor(verificationResult.confidence)}`}>
                      {verificationResult.overallScore.toFixed(1)}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Overall assessment score
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Skills Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Skills Breakdown</CardTitle>
                  <CardDescription>
                    Individual skill assessments with platform contributions
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
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSkillLevelColor(skill.level)}`}>
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
                          <div className="text-sm">
                            <span className={`px-2 py-1 rounded-full ${getDataQualityColor(verificationResult.dataQuality)}`}>
                              {skill.confidence >= 60 ? 'Verified' : 'Pending'}
                            </span>
                          </div>
                        </div>

                        {/* Platform Contributions */}
                        <div className="mb-3">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Platform Contributions
                          </h4>
                          <div className="space-y-2">
                            {skill.breakdown.platforms.map((platform, pIndex) => (
                              <div key={pIndex} className="flex justify-between items-center text-sm">
                                <div className="flex items-center">
                                  <div 
                                    className="w-3 h-3 rounded-full mr-2"
                                    style={{ backgroundColor: platform.platformId === 'github' ? '#24292e' : platform.platformId === 'leetcode' ? '#ffa116' : '#6b7280' }}
                                  />
                                  <span>{platform.platformName}</span>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium">
                                    {platform.contributionWeight.toFixed(1)}%
                                  </div>
                                  <div className="text-gray-600 dark:text-gray-400">
                                    {platform.evidenceCount} items
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Explanation */}
                        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Analysis Explanation
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {skill.explanation}
                          </p>
                        </div>

                        {/* Strengths and Gaps */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                          {skill.strengths.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-green-700 mb-2">
                                <CheckCircle className="h-4 w-4 inline mr-1" />
                                Strengths
                              </h4>
                              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                {skill.strengths.map((strength, sIndex) => (
                                  <li key={sIndex} className="flex items-start">
                                    <span className="text-green-600 mr-2">•</span>
                                    {strength}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {skill.gaps.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-orange-700 mb-2">
                                <AlertCircle className="h-4 w-4 inline mr-1" />
                                Areas for Improvement
                              </h4>
                              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                {skill.gaps.map((gap, gIndex) => (
                                  <li key={gIndex} className="flex items-start">
                                    <span className="text-orange-600 mr-2">•</span>
                                    {gap}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Insights */}
          {verificationResult && (
            <Card>
              <CardHeader>
                <CardTitle>Key Insights & Recommendations</CardTitle>
                <CardDescription>
                  Personalized insights based on your skill analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Strengths */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
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
                      <CheckCircle className="h-5 w-5 mr-2 text-blue-500" />
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

          {/* No Evidence State */}
          {!verificationResult && evidence.length === 0 && !isAnalyzing && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-800 flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  No Evidence Found for Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="h-8 w-8 text-red-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-red-800 mb-2">
                    Cannot Analyze Skills
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    No platform integrations found. Connect platforms to generate skill analysis.
                  </p>
                  <div className="space-y-2 text-left max-w-md mx-auto">
                    <h4 className="font-medium text-red-800 mb-3">Required Actions:</h4>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-start">
                        <span className="text-blue-600 mr-2">1.</span>
                        <span>Connect at least one platform (GitHub, LeetCode, etc.)</span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-blue-600 mr-2">2.</span>
                        <span>Ensure platform has activity data</span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-blue-600 mr-2">3.</span>
                        <span>Sync your data to fetch evidence</span>
                      </div>
                    </div>
                  </div>
                  <Link href="/dashboard/platforms">
                    <Button>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Connect Platforms
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
