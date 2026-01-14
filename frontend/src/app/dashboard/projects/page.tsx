'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Code, ExternalLink, Github, Star, Calendar, Filter, Search, Settings, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const projects = [
    {
      id: 1,
      title: 'E-commerce Platform',
      description: 'Full-stack e-commerce solution with React, Node.js, and MongoDB',
      status: 'verified',
      technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
      githubUrl: 'https://github.com/example/ecommerce',
      liveUrl: 'https://example.com',
      stars: 42,
      createdAt: '2024-01-15',
      verificationScore: 95
    },
    {
      id: 2,
      title: 'AI Chat Application',
      description: 'Real-time chat app with AI integration using OpenAI API',
      status: 'pending',
      technologies: ['Python', 'FastAPI', 'OpenAI', 'WebSocket'],
      githubUrl: 'https://github.com/example/ai-chat',
      liveUrl: 'https://ai-chat.example.com',
      stars: 28,
      createdAt: '2024-01-20',
      verificationScore: 0
    },
    {
      id: 3,
      title: 'Portfolio Website',
      description: 'Personal portfolio with Next.js and modern design',
      status: 'verified',
      technologies: ['Next.js', 'Tailwind CSS', 'Vercel'],
      githubUrl: 'https://github.com/example/portfolio',
      liveUrl: 'https://portfolio.example.com',
      stars: 15,
      createdAt: '2024-01-10',
      verificationScore: 88
    }
  ]

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || project.status === filterStatus
    return matchesSearch && matchesFilter
  })

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
                  <Button variant="default" size="sm">Projects</Button>
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
                My Projects
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Manage and showcase your verified projects
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                All
              </Button>
              <Button
                variant={filterStatus === 'verified' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('verified')}
              >
                Verified
              </Button>
              <Button
                variant={filterStatus === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('pending')}
              >
                Pending
              </Button>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{project.title}</CardTitle>
                      <CardDescription className="mt-2">
                        {project.description}
                      </CardDescription>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      project.status === 'verified' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {project.status === 'verified' ? 'Verified' : 'Pending'}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Technologies */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies.map((tech, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Verification Score */}
                  {project.verificationScore > 0 && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">Verification Score</span>
                        <span className="font-medium">{project.verificationScore}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${project.verificationScore}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Links */}
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                      >
                        <Github className="h-4 w-4" />
                      </a>
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Star className="h-4 w-4 mr-1" />
                      {project.stars}
                    </div>
                  </div>

                  {/* Date */}
                  <div className="mt-3 text-xs text-gray-500">
                    Created on {new Date(project.createdAt).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <Code className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No projects found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Get started by adding your first project to verify your skills.
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Project
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
