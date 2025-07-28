import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  ShoppingCart, 
  FileText, 
  Building2, 
  TrendingUp, 
  MessageSquare,
  Plus,
  ArrowRight
} from 'lucide-react'

interface DashboardOverviewProps {
  onSectionChange: (section: string) => void
}

export function DashboardOverview({ onSectionChange }: DashboardOverviewProps) {
  const stats = [
    {
      title: 'Active Mastermind Groups',
      value: '12',
      description: 'Across 8 portfolio companies',
      icon: Users,
      trend: '+2 this month',
      color: 'text-blue-600'
    },
    {
      title: 'Vendor Discounts',
      value: '47',
      description: 'Total savings: $2.3M',
      icon: ShoppingCart,
      trend: '+5 new deals',
      color: 'text-green-600'
    },
    {
      title: 'Shared Documents',
      value: '234',
      description: 'Best practices & templates',
      icon: FileText,
      trend: '+18 this week',
      color: 'text-purple-600'
    },
    {
      title: 'Portfolio Companies',
      value: '24',
      description: 'Connected executives',
      icon: Building2,
      trend: '100% participation',
      color: 'text-orange-600'
    }
  ]

  const recentActivity = [
    {
      type: 'mastermind',
      title: 'New discussion in "SaaS Growth Strategies"',
      company: 'TechCorp CEO',
      time: '2 hours ago',
      badge: 'Hot Topic'
    },
    {
      type: 'vendor',
      title: 'AWS Enterprise discount available',
      company: 'CloudTech Solutions',
      time: '4 hours ago',
      badge: '30% Off'
    },
    {
      type: 'document',
      title: 'Q4 Board Deck Template uploaded',
      company: 'FinanceFirst CFO',
      time: '6 hours ago',
      badge: 'Template'
    },
    {
      type: 'network',
      title: 'New executive joined the platform',
      company: 'RetailMax CMO',
      time: '1 day ago',
      badge: 'Welcome'
    }
  ]

  const quickActions = [
    {
      title: 'Start Mastermind Group',
      description: 'Create a new discussion group',
      icon: Users,
      action: () => onSectionChange('mastermind'),
      color: 'bg-blue-50 text-blue-600 hover:bg-blue-100'
    },
    {
      title: 'Share Vendor Deal',
      description: 'Add a new discount opportunity',
      icon: ShoppingCart,
      action: () => onSectionChange('vendors'),
      color: 'bg-green-50 text-green-600 hover:bg-green-100'
    },
    {
      title: 'Upload Document',
      description: 'Share templates or best practices',
      icon: FileText,
      action: () => onSectionChange('documents'),
      color: 'bg-purple-50 text-purple-600 hover:bg-purple-100'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Executive Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening across your portfolio network.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
              <div className="flex items-center pt-1">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-xs text-green-600">{stat.trend}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Get started with common tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action) => (
              <Button
                key={action.title}
                variant="ghost"
                className={`w-full justify-start h-auto p-4 ${action.color}`}
                onClick={action.action}
              >
                <action.icon className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">{action.title}</div>
                  <div className="text-sm opacity-70">{action.description}</div>
                </div>
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates from your portfolio network
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {activity.type === 'mastermind' && <Users className="h-5 w-5 text-blue-600" />}
                    {activity.type === 'vendor' && <ShoppingCart className="h-5 w-5 text-green-600" />}
                    {activity.type === 'document' && <FileText className="h-5 w-5 text-purple-600" />}
                    {activity.type === 'network' && <Building2 className="h-5 w-5 text-orange-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">{activity.company}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <Badge variant="secondary" className="mb-1">
                      {activity.badge}
                    </Badge>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              <MessageSquare className="h-4 w-4 mr-2" />
              View All Activity
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Synergy Opportunities</CardTitle>
          <CardDescription>
            Potential collaboration and value creation opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Cross-Selling Opportunities</h4>
              <p className="text-sm text-muted-foreground mb-3">
                TechCorp's software could serve 3 other portfolio companies
              </p>
              <Button size="sm" variant="outline">
                <Plus className="h-3 w-3 mr-1" />
                Explore
              </Button>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Shared Services</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Consolidate HR services across 5 companies for 40% savings
              </p>
              <Button size="sm" variant="outline">
                <Plus className="h-3 w-3 mr-1" />
                Analyze
              </Button>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Talent Exchange</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Senior developers available for temporary assignments
              </p>
              <Button size="sm" variant="outline">
                <Plus className="h-3 w-3 mr-1" />
                Connect
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}