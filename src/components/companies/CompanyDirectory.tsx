import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Building2, 
  Search, 
  Filter, 
  Users, 
  ExternalLink,
  Calendar,
  TrendingUp,
  Globe,
  MapPin,
  Briefcase
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { blink } from '@/blink/client'

interface Company {
  id: string
  name: string
  industry: string
  description: string
  logo_url: string
  website: string
  founded_year: number
  employee_count: number
  revenue_range: string
  created_at: string
}

interface UserProfile {
  id: string
  user_id: string
  company_id: string
  title: string
  bio: string
  linkedin_url: string
  expertise_areas: string
}

export function CompanyDirectory() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState('all')
  const [loading, setLoading] = useState(true)

  const industries = [
    'all', 'Software', 'Cloud Services', 'Manufacturing', 'Retail', 
    'FinTech', 'Healthcare', 'Energy', 'Automotive', 'Consulting'
  ]

  const loadData = async () => {
    try {
      const [companiesData, profilesData] = await Promise.all([
        blink.db.companies.list({ orderBy: { name: 'asc' } }),
        blink.db.user_profiles.list()
      ])
      setCompanies(companiesData)
      setUserProfiles(profilesData)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesIndustry = selectedIndustry === 'all' || company.industry === selectedIndustry
    return matchesSearch && matchesIndustry
  })

  const getCompanyExecutives = (companyId: string) => {
    return userProfiles.filter(profile => profile.company_id === companyId)
  }

  const formatEmployeeCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K+`
    }
    return `${count}+`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Company Directory</h1>
        <p className="text-muted-foreground">
          Explore portfolio companies and connect with fellow executives
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{companies.length}</div>
            <p className="text-xs text-muted-foreground">
              Across {new Set(companies.map(c => c.industry)).size} industries
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatEmployeeCount(companies.reduce((sum, c) => sum + c.employee_count, 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all portfolio companies
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Largest Industry</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Software</div>
            <p className="text-xs text-muted-foreground">
              {companies.filter(c => c.industry === 'Software').length} companies
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Founded</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(companies.reduce((sum, c) => sum + c.founded_year, 0) / companies.length)}
            </div>
            <p className="text-xs text-muted-foreground">
              Average founding year
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search companies or descriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {industries.map(industry => (
              <SelectItem key={industry} value={industry}>
                {industry === 'all' ? 'All Industries' : industry}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Companies Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCompanies.map((company) => {
          const executives = getCompanyExecutives(company.id)
          
          return (
            <Card key={company.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={company.logo_url} alt={company.name} />
                    <AvatarFallback>
                      {company.name.split(' ').map(word => word[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg">{company.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {company.industry}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {company.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Founded</span>
                      </div>
                      <div className="font-medium">{company.founded_year}</div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>Employees</span>
                      </div>
                      <div className="font-medium">{formatEmployeeCount(company.employee_count)}</div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-1 text-muted-foreground text-sm mb-2">
                      <Briefcase className="h-3 w-3" />
                      <span>Revenue Range</span>
                    </div>
                    <Badge variant="outline">{company.revenue_range}</Badge>
                  </div>

                  {executives.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1 text-muted-foreground text-sm mb-2">
                        <Users className="h-3 w-3" />
                        <span>Executives on Platform ({executives.length})</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {executives.slice(0, 3).map((exec) => (
                          <Badge key={exec.id} variant="secondary" className="text-xs">
                            {exec.title}
                          </Badge>
                        ))}
                        {executives.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{executives.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1">
                      <Users className="h-3 w-3 mr-1" />
                      Connect
                    </Button>
                    {company.website && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open(company.website, '_blank')}
                      >
                        <Globe className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredCompanies.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No companies found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}

      {/* Industry Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Industry Breakdown</CardTitle>
          <CardDescription>
            Distribution of portfolio companies across industries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {industries.slice(1).map(industry => {
              const count = companies.filter(c => c.industry === industry).length
              const percentage = companies.length > 0 ? (count / companies.length * 100).toFixed(1) : '0'
              
              return (
                <div key={industry} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{industry}</div>
                    <div className="text-sm text-muted-foreground">{count} companies</div>
                  </div>
                  <Badge variant="outline">{percentage}%</Badge>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}