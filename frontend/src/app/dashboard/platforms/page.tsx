'use client'

// @ts-nocheck

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Link2, CheckCircle, AlertCircle, Settings, Trash2, RefreshCw, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// Import platform adapters
import { GitHubAdapter } from '@/lib/platform-integration/adapters/github-adapter'
import { LeetCodeAdapter } from '@/lib/platform-integration/adapters/leetcode-adapter'
import { DevpostAdapter } from '@/lib/platform-integration/adapters/devpost-adapter'
import { GitLabAdapter } from '@/lib/platform-integration/adapters/gitlab-adapter'
import { BitbucketAdapter } from '@/lib/platform-integration/adapters/bitbucket-adapter'
import { CodeforcesAdapter } from '@/lib/platform-integration/adapters/codeforces-adapter'
import { HackerRankAdapter } from '@/lib/platform-integration/adapters/hackerrank-adapter'
import { KaggleAdapter } from '@/lib/platform-integration/adapters/kaggle-adapter'
import { DevToAdapter } from '@/lib/platform-integration/adapters/devto-adapter'
import { MediumAdapter } from '@/lib/platform-integration/adapters/medium-adapter'
import { FreelanceAdapter } from '@/lib/platform-integration/adapters/freelance-adapter'
import { CustomPlatformAdapter, type CustomPlatformConfig } from '@/lib/platform-integration/adapters/custom-platform-adapter'

// Import types
import type { PlatformAdapter, PlatformConnection, PlatformCredentials } from '@/lib/platform-integration/core/types'
import { IntegrationService } from '@/lib/platform-integration/core/integration-service'

export default function PlatformsPage() {
  const [connections, setConnections] = useState<PlatformConnection[]>([])
  const [availablePlatforms, setAvailablePlatforms] = useState<PlatformAdapter[]>([])
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [customPlatform, setCustomPlatform] = useState<CustomPlatformConfig>({
    id: '',
    name: '',
    description: '',
    apiEndpoint: '',
    headers: {},
    icon: 'globe',
    color: '#6b7280'
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Load available platforms
    const platforms = [
      GitHubAdapter,
      LeetCodeAdapter,
      DevpostAdapter,
      GitLabAdapter,
      BitbucketAdapter,
      CodeforcesAdapter,
      HackerRankAdapter,
      KaggleAdapter,
      DevToAdapter,
      MediumAdapter,
      FreelanceAdapter
    ]
    setAvailablePlatforms(platforms)

    // Load existing connections (mock data for now)
    setConnections([
      {
        id: 'github_123',
        platformId: 'github',
        userId: 'user123',
        credentials: { accessToken: 'mock_token' },
        isActive: true,
        createdAt: new Date('2024-01-15'),
        lastSync: new Date('2024-01-20')
      }
    ])
  }, [])

  const handleConnectPlatform = async (platform: PlatformAdapter) => {
    setIsLoading(true)
    try {
      // For demonstration, use mock credentials
      const mockCredentials = {
        accessToken: 'demo_token',
        username: 'demo-user',
        userId: 'demo-user-123'
      }

      const result = await platform.connect(mockCredentials)
      if (result.success && result.connection) {
        setConnections([...connections, result.connection])
        // Save to integration service
        const integrationService = IntegrationService.getInstance()
        await integrationService.connectPlatform(platform.id, mockCredentials)
      } else {
        alert(`Connection failed: ${result.error}`)
      }
    } catch (error) {
      alert('Connection failed: ' + (error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisconnect = async (connectionId: string) => {
    if (!confirm('Are you sure you want to disconnect this platform?')) return
    
    setConnections(prev => prev.filter(conn => conn.id !== connectionId))
  }

  const handleSync = async (connection: PlatformConnection) => {
    try {
      const platform = availablePlatforms.find(p => p.id === connection.platformId)
      if (!platform) return

      const data = await platform.fetchData(connection)
      console.log(`Synced ${data.length} items from ${platform.name}`)
      
      // Update last sync time
      setConnections(prev => prev.map(conn => 
        conn.id === connection.id 
          ? { ...conn, lastSync: new Date() }
          : conn
      ))
    } catch (error) {
      alert(`Sync failed: ${error.message}`)
    }
  }

  const fetchPlatformData = async (connection: PlatformConnection) => {
    try {
      const platform = availablePlatforms.find(p => p.id === connection.platformId)
      if (!platform) return

      const data = await platform.fetchData(connection)
      console.log(`Fetched ${data.length} items from ${platform.name}`)
    } catch (error) {
      console.error(`Failed to fetch data from ${connection.platformId}:`, error)
    }
  }

  const handleAddCustomPlatform = async () => {
    if (!customPlatform.id || !customPlatform.name || !customPlatform.apiEndpoint) {
      alert('Please fill in all required fields')
      return
    }

    const customAdapter = new CustomPlatformAdapter(customPlatform)
    setAvailablePlatforms(prev => [...prev, customAdapter])
    setShowCustomForm(false)
    setCustomPlatform({
      id: '',
      name: '',
      description: '',
      apiEndpoint: '',
      headers: {},
      icon: 'globe',
      color: '#6b7280'
    })
  }

  const getPlatformStatus = (platformId: string) => {
    const connection = connections.find(conn => conn.platformId === platformId)
    if (!connection) return 'disconnected'
    if (!connection.isActive) return 'inactive'
    return 'connected'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'inactive':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-600 bg-green-50'
      case 'inactive':
        return 'text-yellow-600 bg-yellow-50'
      default:
        return 'text-gray-600 bg-gray-50'
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
                  <Button variant="ghost" size="sm">Skills</Button>
                </Link>
                <Link href="/dashboard/profile">
                  <Button variant="ghost" size="sm">Profile</Button>
                </Link>
                <Link href="/dashboard/platforms">
                  <Button variant="default" size="sm">Platforms</Button>
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
                Platform Integrations
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Connect platforms where you demonstrate your skills and build projects
              </p>
            </div>
            <Button onClick={() => setShowCustomForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Custom Platform
            </Button>
          </div>

          {/* Connected Platforms */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Connected Platforms
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {connections.map((connection) => {
                const platform = availablePlatforms.find(p => p.id === connection.platformId)
                if (!platform) return null

                return (
                  <Card key={connection.id} className="relative">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center">
                            <div 
                              className="w-8 h-8 rounded-lg mr-3 flex items-center justify-center"
                              style={{ backgroundColor: platform.color }}
                            >
                              <span className="text-white text-sm font-bold">
                                {platform.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            {platform.name}
                          </CardTitle>
                          <CardDescription>
                            {platform.description}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(getPlatformStatus(connection.platformId))}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDisconnect(connection.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Status</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(getPlatformStatus(connection.platformId))}`}>
                            {getPlatformStatus(connection.platformId)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Connected</span>
                          <span>{connection.createdAt.toLocaleDateString()}</span>
                        </div>
                        {connection.lastSync && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Last sync</span>
                            <span>{connection.lastSync.toLocaleDateString()}</span>
                          </div>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handleSync(connection)}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Sync Data
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Available Platforms */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Available Platforms
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availablePlatforms
                .filter(platform => !connections.find(conn => conn.platformId === platform.id))
                .map((platform) => (
                  <Card key={platform.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <div 
                          className="w-8 h-8 rounded-lg mr-3 flex items-center justify-center"
                          style={{ backgroundColor: platform.color }}
                        >
                          <span className="text-white text-sm font-bold">
                            {platform.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        {platform.name}
                      </CardTitle>
                      <CardDescription>
                        {platform.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Status</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(getPlatformStatus(platform.id))}`}>
                            {getPlatformStatus(platform.id)}
                          </span>
                        </div>
                        <Button
                          variant="default"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            // Mock connection - in real app, this would open auth flow
                            handleConnectPlatform(platform)
                          }}
                        >
                          <Link2 className="h-4 w-4 mr-2" />
                          Connect
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

          {/* Custom Platform Form Modal */}
          {showCustomForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="w-full max-w-2xl mx-4">
                <CardHeader>
                  <CardTitle>Add Custom Platform</CardTitle>
                  <CardDescription>
                    Connect any platform with an API to demonstrate your skills
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="platformId">Platform ID *</Label>
                      <Input
                        id="platformId"
                        value={customPlatform.id}
                        onChange={(e) => setCustomPlatform(prev => ({ ...prev, id: e.target.value }))}
                        placeholder="e.g., company_internal"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="platformName">Platform Name *</Label>
                      <Input
                        id="platformName"
                        value={customPlatform.name}
                        onChange={(e) => setCustomPlatform(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Company Internal Portal"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="platformDescription">Description</Label>
                      <Input
                        id="platformDescription"
                        value={customPlatform.description}
                        onChange={(e) => setCustomPlatform(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe what kind of evidence this platform provides"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="apiEndpoint">API Endpoint *</Label>
                      <Input
                        id="apiEndpoint"
                        value={customPlatform.apiEndpoint}
                        onChange={(e) => setCustomPlatform(prev => ({ ...prev, apiEndpoint: e.target.value }))}
                        placeholder="https://api.example.com"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-6">
                    <Button variant="outline" onClick={() => setShowCustomForm(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddCustomPlatform}>
                      Add Platform
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
