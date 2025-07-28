import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Users, 
  Plus, 
  MessageSquare, 
  Clock, 
  Building2,
  Search,
  Filter,
  Star,
  TrendingUp
} from 'lucide-react'

export function MastermindGroups() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const groups = [
    {
      id: 1,
      title: 'SaaS Growth Strategies',
      description: 'Scaling software companies from $1M to $10M ARR',
      category: 'Growth',
      members: 8,
      companies: ['TechCorp', 'CloudSoft', 'DataFlow', 'AppBuilder'],
      lastActivity: '2 hours ago',
      isActive: true,
      trending: true,
      discussions: 24,
      leader: 'Sarah Chen, TechCorp CEO'
    },
    {
      id: 2,
      title: 'Manufacturing Efficiency',
      description: 'Lean operations and automation strategies',
      category: 'Operations',
      members: 6,
      companies: ['SteelWorks', 'AutoParts', 'PrecisionTech'],
      lastActivity: '5 hours ago',
      isActive: true,
      trending: false,
      discussions: 18,
      leader: 'Mike Rodriguez, SteelWorks COO'
    },
    {
      id: 3,
      title: 'Digital Transformation',
      description: 'Modernizing legacy systems and processes',
      category: 'Technology',
      members: 12,
      companies: ['RetailMax', 'FinanceFirst', 'HealthTech', 'LogiFlow'],
      lastActivity: '1 day ago',
      isActive: true,
      trending: true,
      discussions: 31,
      leader: 'Jennifer Park, RetailMax CTO'
    },
    {
      id: 4,
      title: 'ESG Implementation',
      description: 'Environmental, Social, and Governance best practices',
      category: 'Governance',
      members: 10,
      companies: ['GreenEnergy', 'SustainableTech', 'EcoManufacturing'],
      lastActivity: '2 days ago',
      isActive: false,
      trending: false,
      discussions: 15,
      leader: 'David Kim, GreenEnergy CEO'
    },
    {
      id: 5,
      title: 'Customer Success Playbook',
      description: 'Reducing churn and increasing customer lifetime value',
      category: 'Customer Success',
      members: 9,
      companies: ['ServicePro', 'ClientFirst', 'SupportTech'],
      lastActivity: '3 hours ago',
      isActive: true,
      trending: false,
      discussions: 22,
      leader: 'Lisa Wang, ServicePro VP Customer Success'
    }
  ]

  const categories = ['all', 'Growth', 'Operations', 'Technology', 'Governance', 'Customer Success']

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || group.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mastermind Groups</h1>
          <p className="text-muted-foreground">
            Collaborate with fellow executives to share insights and solve challenges
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create Mastermind Group</DialogTitle>
              <DialogDescription>
                Start a new discussion group around a specific topic or challenge.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Group Title</Label>
                <Input id="title" placeholder="e.g., SaaS Growth Strategies" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Describe the focus and goals of this group..."
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="growth">Growth</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="governance">Governance</SelectItem>
                    <SelectItem value="customer-success">Customer Success</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline">Cancel</Button>
              <Button>Create Group</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Groups Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredGroups.map((group) => (
          <Card key={group.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-lg">{group.title}</CardTitle>
                    {group.trending && (
                      <Badge variant="secondary" className="text-xs">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Trending
                      </Badge>
                    )}
                  </div>
                  <CardDescription>{group.description}</CardDescription>
                </div>
                <Badge variant={group.isActive ? 'default' : 'secondary'}>
                  {group.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{group.members} members</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span>{group.discussions} discussions</span>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-2">Participating Companies:</p>
                  <div className="flex flex-wrap gap-1">
                    {group.companies.slice(0, 3).map((company) => (
                      <Badge key={company} variant="outline" className="text-xs">
                        {company}
                      </Badge>
                    ))}
                    {group.companies.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{group.companies.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <span>Led by: {group.leader}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Last activity: {group.lastActivity}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button size="sm" className="flex-1">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Join Discussion
                  </Button>
                  <Button size="sm" variant="outline">
                    <Star className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredGroups.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No groups found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search or create a new mastermind group.
          </p>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Group
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create Mastermind Group</DialogTitle>
                <DialogDescription>
                  Start a new discussion group around a specific topic or challenge.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Group Title</Label>
                  <Input id="title" placeholder="e.g., SaaS Growth Strategies" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Describe the focus and goals of this group..."
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="growth">Growth</SelectItem>
                      <SelectItem value="operations">Operations</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="governance">Governance</SelectItem>
                      <SelectItem value="customer-success">Customer Success</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button>Create Group</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  )
}