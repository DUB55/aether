"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  BarChart3, 
  Users, 
  Eye, 
  Globe, 
  Clock,
  TrendingUp,
  MapPin,
  ExternalLink
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface AnalyticsDashboardProps {
  projectId: string
  className?: string
}

interface AnalyticsData {
  visitors: {
    total: number
    unique: number
    returning: number
  }
  sources: Array<{
    source: string
    visitors: number
    percentage: number
  }>
  locations: Array<{
    country: string
    visitors: number
    percentage: number
  }>
  pageViews: {
    total: number
    average: number
    topPages: Array<{
      path: string
      views: number
    }>
  }
  timeSeries: Array<{
    date: string
    visitors: number
    pageViews: number
  }>
}

export function AnalyticsDashboard({ projectId, className }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadAnalytics()
  }, [projectId, timeRange])

  const loadAnalytics = () => {
    setIsLoading(true)
    // Simulate loading analytics data (in production, this would fetch from Firebase/Supabase)
    setTimeout(() => {
      const mockData: AnalyticsData = {
        visitors: {
          total: 1247,
          unique: 892,
          returning: 355
        },
        sources: [
          { source: 'Direct', visitors: 523, percentage: 42 },
          { source: 'Google', visitors: 312, percentage: 25 },
          { source: 'Twitter', visitors: 187, percentage: 15 },
          { source: 'GitHub', visitors: 124, percentage: 10 },
          { source: 'Other', visitors: 101, percentage: 8 }
        ],
        locations: [
          { country: 'United States', visitors: 423, percentage: 34 },
          { country: 'United Kingdom', visitors: 187, percentage: 15 },
          { country: 'Germany', visitors: 156, percentage: 13 },
          { country: 'France', visitors: 124, percentage: 10 },
          { country: 'Canada', visitors: 112, percentage: 9 },
          { country: 'Other', visitors: 245, percentage: 19 }
        ],
        pageViews: {
          total: 3842,
          average: 3.1,
          topPages: [
            { path: '/', views: 1247 },
            { path: '/about', views: 567 },
            { path: '/features', views: 423 },
            { path: '/pricing', views: 312 },
            { path: '/contact', views: 187 }
          ]
        },
        timeSeries: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
          visitors: Math.floor(Math.random() * 200) + 50,
          pageViews: Math.floor(Math.random() * 400) + 100
        }))
      }
      setAnalytics(mockData)
      setIsLoading(false)
    }, 1000)
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!analytics) {
    return (
      <Card className={className}>
        <CardContent className="py-12 text-center text-muted-foreground">
          <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No analytics data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Analytics Dashboard
            </div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-800 font-medium">Total Visitors</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">{analytics.visitors.total.toLocaleString()}</div>
              <div className="text-xs text-blue-700 mt-1">
                <TrendingUp className="w-3 h-3 inline mr-1" />
                +12.5% from last period
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-800 font-medium">Unique Visitors</span>
              </div>
              <div className="text-2xl font-bold text-green-900">{analytics.visitors.unique.toLocaleString()}</div>
              <div className="text-xs text-green-700 mt-1">
                <TrendingUp className="w-3 h-3 inline mr-1" />
                +8.3% from last period
              </div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-purple-800 font-medium">Avg. Session</span>
              </div>
              <div className="text-2xl font-bold text-purple-900">4m 32s</div>
              <div className="text-xs text-purple-700 mt-1">
                <TrendingUp className="w-3 h-3 inline mr-1" />
                +5.2% from last period
              </div>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-orange-600" />
                <span className="text-sm text-orange-800 font-medium">Page Views</span>
              </div>
              <div className="text-2xl font-bold text-orange-900">{analytics.pageViews.total.toLocaleString()}</div>
              <div className="text-xs text-orange-700 mt-1">
                <TrendingUp className="w-3 h-3 inline mr-1" />
                +15.7% from last period
              </div>
            </div>
          </div>

          {/* Traffic Sources */}
          <div className="space-y-3">
            <h3 className="font-medium flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Traffic Sources
            </h3>
            <div className="space-y-2">
              {analytics.sources.map((source) => (
                <div key={source.source} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{source.source}</span>
                    <span className="text-muted-foreground">{source.percentage}%</span>
                  </div>
                  <Progress value={source.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </div>

          {/* Geographic Distribution */}
          <div className="space-y-3">
            <h3 className="font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Geographic Distribution
            </h3>
            <div className="space-y-2">
              {analytics.locations.map((location) => (
                <div key={location.country} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{location.country}</span>
                    <span className="text-muted-foreground">{location.percentage}%</span>
                  </div>
                  <Progress value={location.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </div>

          {/* Top Pages */}
          <div className="space-y-3">
            <h3 className="font-medium">Top Pages</h3>
            <div className="space-y-2">
              {analytics.pageViews.topPages.map((page, index) => (
                <div key={page.path} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-muted-foreground">{index + 1}.</span>
                    <span className="text-sm">{page.path}</span>
                  </div>
                  <span className="text-sm font-medium">{page.views.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Time Series */}
          <div className="space-y-3">
            <h3 className="font-medium">Visitor Trends</h3>
            <div className="h-48 flex items-end gap-2">
              {analytics.timeSeries.map((data) => (
                <div key={data.date} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-blue-500 rounded-t"
                    style={{ height: `${(data.visitors / 250) * 100}%` }}
                  />
                  <span className="text-xs text-muted-foreground">{data.date.split('/')[1]}/{data.date.split('/')[2]}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
