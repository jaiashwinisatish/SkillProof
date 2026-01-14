'use client'

// @ts-nocheck

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Award, TrendingUp, Clock, CheckCircle, XCircle, Filter, Search, Settings, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function SkillsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterLevel, setFilterLevel] = useState('all')

  const skills = [
    {
      id: 1,
      name: 'React',
      category: 'Frontend',
      level: 'Expert',
      status: 'verified',
      verifiedDate: '2024-01-15',
      projectsCount: 5,
      badgeUrl: '/badges/react-expert.png',
      description: 'Advanced React development including hooks, context, and performance optimization'
    },
    {
      id: 2,
      name: 'Node.js',
      category: 'Backend',
      level: 'Advanced',
      status: 'verified',
      verifiedDate: '2024-01-10',
      projectsCount: 3,
      badgeUrl: '/badges/nodejs-advanced.png',
      description: 'Server-side JavaScript development with Express and REST APIs'
    },
    {
      id: 3,
      name: 'Python',
      category: 'Backend',
      level: 'Intermediate',
      status: 'pending',
      verifiedDate: null,
      projectsCount: 2,
      badgeUrl: null,
      description: 'Python programming for web development and data analysis'
    },
    {
      id: 4,
      name: 'TypeScript',
      category: 'Language',
      level: 'Advanced',
      status: 'verified',
      verifiedDate: '2024-01-12',
      projectsCount: 4,
      badgeUrl: '/badges/typescript-advanced.png',
      description: 'Type-safe JavaScript development with advanced type system'
    },
    {
      id: 5,
      name: 'MongoDB',
      category: 'Database',
      level: 'Intermediate',
      status: 'verified',
      verifiedDate: '2024-01-08',
      projectsCount: 3,
      badgeUrl: '/badges/mongodb-intermediate.png',
      description: 'NoSQL database design and aggregation pipelines'
    }
  ]

  const filteredSkills = skills.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         skill.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterLevel === 'all' || skill.level.toLowerCase() === filterLevel.toLowerCase()
    return matchesSearch && matchesFilter
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  const getLevelColor = (level: string) => {
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
                My Skills
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Showcase your verified technical skills and earn badges
              </p>
            </div>
            <div className="flex gap-2">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Verify New Skill
              </Button>
              <Link href="/dashboard/skills/verification">
                <Button variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analyze Skills
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Skills</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{skills.length}</div>
                <p className="text-xs text-muted-foreground">Across all categories</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Verified</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{skills.filter(s => s.status === 'verified').length}</div>
                <p className="text-xs text-muted-foreground">Expert verified</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{skills.filter(s => s.status === 'pending').length}</div>
                <p className="text-xs text-muted-foreground">Awaiting review</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expert Level</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{skills.filter(s => s.level === 'Expert').length}</div>
                <p className="text-xs text-muted-foreground">Top tier skills</p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterLevel === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterLevel('all')}
              >
                All Levels
              </Button>
              <Button
                variant={filterLevel === 'expert' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterLevel('expert')}
              >
                Expert
              </Button>
              <Button
                variant={filterLevel === 'advanced' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterLevel('advanced')}
              >
                Advanced
              </Button>
              <Button
                variant={filterLevel === 'intermediate' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterLevel('intermediate')}
              >
                Intermediate
              </Button>
            </div>
          </div>

          {/* Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSkills.map((skill) => (
              <Card key={skill.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg flex items-center">
                        {skill.name}
                        {getStatusIcon(skill.status)}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {skill.category}
                      </CardDescription>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(skill.level)}`}>
                      {skill.level}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {skill.description}
                  </p>

                  {/* Badge */}
                  {skill.badgeUrl ? (
                    <div className="mb-4">
                      <div className="w-full h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Award className="h-8 w-8 text-white" />
                      </div>
                      <p className="text-xs text-center text-gray-500 mt-1">
                        Verified Badge
                      </p>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <div className="w-full h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <Clock className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-xs text-center text-gray-500 mt-1">
                        Awaiting verification
                      </p>
                    </div>
                  )}

                  {/* Projects Count */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {skill.projectsCount} projects
                    </span>
                    {skill.verifiedDate && (
                      <span className="text-gray-500">
                        Verified {new Date(skill.verifiedDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredSkills.length === 0 && (
            <div className="text-center py-12">
              <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No skills found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Start verifying your skills by adding projects and getting expert reviews.
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Verify New Skill
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
