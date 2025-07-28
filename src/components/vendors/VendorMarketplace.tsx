import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Bookmark, 
  Calendar,
  Building2,
  TrendingUp,
  ExternalLink,
  Percent,
  DollarSign
} from 'lucide-react'
import { blink } from '@/blink/client'

interface VendorDeal {
  id: string
  title: string
  vendor_name: string
  category: string
  description: string
  discount_percentage: number
  discount_amount: number
  discount_type: string
  terms: string
  expiry_date: string
  contact_info: string
  submitted_by_user_id: string
  company_id: string
  is_active: number
  view_count: number
  save_count: number
  created_at: string
}

export function VendorMarketplace() {
  const [deals, setDeals] = useState<VendorDeal[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [savedDeals, setSavedDeals] = useState<Set<string>>(new Set())

  const categories = [
    'all', 'Cloud Infrastructure', 'CRM Software', 'Productivity Software', 
    'Communication', 'Marketing Automation', 'Security & Compliance', 
    'Analytics', 'Development Tools', 'HR & Recruiting'
  ]

  const loadDeals = async () => {
    try {
      const dealsData = await blink.db.vendor_deals.list({
        where: { is_active: "1" },
        orderBy: { created_at: 'desc' }
      })
      setDeals(dealsData)
    } catch (error) {
      console.error('Failed to load deals:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSavedDeals = async () => {
    try {
      const user = await blink.auth.me()
      const saved = await blink.db.saved_vendor_deals.list({
        where: { user_id: user.id }
      })
      setSavedDeals(new Set(saved.map(s => s.deal_id)))
    } catch (error) {
      console.error('Failed to load saved deals:', error)
    }
  }

  useEffect(() => {
    loadDeals()
    loadSavedDeals()
  }, [])

  const handleSaveDeal = async (dealId: string) => {
    try {
      const user = await blink.auth.me()
      
      if (savedDeals.has(dealId)) {
        // Remove from saved
        await blink.db.saved_vendor_deals.delete(`${user.id}_${dealId}`)
        setSavedDeals(prev => {
          const newSet = new Set(prev)
          newSet.delete(dealId)
          return newSet
        })
      } else {
        // Add to saved
        await blink.db.saved_vendor_deals.create({
          id: `${user.id}_${dealId}`,
          deal_id: dealId,
          user_id: user.id
        })
        setSavedDeals(prev => new Set([...prev, dealId]))
        
        // Increment save count
        const deal = deals.find(d => d.id === dealId)
        if (deal) {
          await blink.db.vendor_deals.update(dealId, {
            save_count: deal.save_count + 1
          })
        }
      }
    } catch (error) {
      console.error('Failed to save/unsave deal:', error)
    }
  }

  const handleViewDeal = async (dealId: string) => {
    try {
      const deal = deals.find(d => d.id === dealId)
      if (deal) {
        await blink.db.vendor_deals.update(dealId, {
          view_count: deal.view_count + 1
        })
        setDeals(prev => prev.map(d => 
          d.id === dealId ? { ...d, view_count: d.view_count + 1 } : d
        ))
      }
    } catch (error) {
      console.error('Failed to update view count:', error)
    }
  }

  const handleCreateDeal = async (formData: any) => {
    try {
      const user = await blink.auth.me()
      const dealId = `deal_${Date.now()}`
      
      await blink.db.vendor_deals.create({
        id: dealId,
        title: formData.title,
        vendor_name: formData.vendor_name,
        category: formData.category,
        description: formData.description,
        discount_percentage: formData.discount_type === 'percentage' ? parseInt(formData.discount_value) : 0,
        discount_amount: formData.discount_type === 'fixed' ? parseFloat(formData.discount_value) : 0,
        discount_type: formData.discount_type,
        terms: formData.terms,
        expiry_date: formData.expiry_date,
        contact_info: formData.contact_info,
        submitted_by_user_id: user.id,
        company_id: formData.company_id || null,
        is_active: 1,
        view_count: 0,
        save_count: 0
      })
      
      loadDeals() // Refresh the list
    } catch (error) {
      console.error('Failed to create deal:', error)
    }
  }

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || deal.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const formatDiscount = (deal: VendorDeal) => {
    if (deal.discount_type === 'percentage') {
      return `${deal.discount_percentage}% off`
    } else {
      return `$${deal.discount_amount.toLocaleString()} off`
    }
  }

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate)
    const now = new Date()
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vendor Marketplace</h1>
          <p className="text-muted-foreground">
            Discover and share exclusive vendor discounts across portfolio companies
          </p>
        </div>
        <CreateDealDialog onCreateDeal={handleCreateDeal} />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deals.length}</div>
            <p className="text-xs text-muted-foreground">
              Across {new Set(deals.map(d => d.category)).size} categories
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2.3M</div>
            <p className="text-xs text-muted-foreground">
              Estimated annual savings
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Popular</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">AWS</div>
            <p className="text-xs text-muted-foreground">
              {deals.find(d => d.vendor_name === 'Amazon Web Services')?.save_count || 0} companies interested
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {deals.filter(d => isExpiringSoon(d.expiry_date)).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Deals ending this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search deals, vendors, or categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[200px]">
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

      {/* Deals Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredDeals.map((deal) => (
          <Card key={deal.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{deal.title}</CardTitle>
                  <CardDescription className="mt-1">
                    by {deal.vendor_name}
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant="secondary" className="text-lg font-bold">
                    {formatDiscount(deal)}
                  </Badge>
                  {isExpiringSoon(deal.expiry_date) && (
                    <Badge variant="destructive" className="text-xs">
                      Expires Soon
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {deal.description}
                </p>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <Badge variant="outline">{deal.category}</Badge>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      <span>{deal.view_count}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bookmark className="h-3 w-3" />
                      <span>{deal.save_count}</span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  <p><strong>Terms:</strong> {deal.terms}</p>
                  <p><strong>Expires:</strong> {new Date(deal.expiry_date).toLocaleDateString()}</p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleViewDeal(deal.id)}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View Details
                  </Button>
                  <Button 
                    size="sm" 
                    variant={savedDeals.has(deal.id) ? "default" : "outline"}
                    onClick={() => handleSaveDeal(deal.id)}
                  >
                    <Bookmark className={`h-3 w-3 ${savedDeals.has(deal.id) ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDeals.length === 0 && (
        <div className="text-center py-12">
          <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No deals found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search or be the first to share a vendor discount.
          </p>
          <CreateDealDialog onCreateDeal={handleCreateDeal} />
        </div>
      )}
    </div>
  )
}

function CreateDealDialog({ onCreateDeal }: { onCreateDeal: (data: any) => void }) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    vendor_name: '',
    category: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    terms: '',
    expiry_date: '',
    contact_info: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCreateDeal(formData)
    setOpen(false)
    setFormData({
      title: '',
      vendor_name: '',
      category: '',
      description: '',
      discount_type: 'percentage',
      discount_value: '',
      terms: '',
      expiry_date: '',
      contact_info: ''
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Share Deal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Share Vendor Deal</DialogTitle>
          <DialogDescription>
            Share an exclusive vendor discount with the portfolio network.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Deal Title</Label>
            <Input
              id="title"
              placeholder="e.g., AWS Enterprise Discount"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="vendor_name">Vendor Name</Label>
            <Input
              id="vendor_name"
              placeholder="e.g., Amazon Web Services"
              value={formData.vendor_name}
              onChange={(e) => setFormData(prev => ({ ...prev, vendor_name: e.target.value }))}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cloud Infrastructure">Cloud Infrastructure</SelectItem>
                <SelectItem value="CRM Software">CRM Software</SelectItem>
                <SelectItem value="Productivity Software">Productivity Software</SelectItem>
                <SelectItem value="Communication">Communication</SelectItem>
                <SelectItem value="Marketing Automation">Marketing Automation</SelectItem>
                <SelectItem value="Security & Compliance">Security & Compliance</SelectItem>
                <SelectItem value="Analytics">Analytics</SelectItem>
                <SelectItem value="Development Tools">Development Tools</SelectItem>
                <SelectItem value="HR & Recruiting">HR & Recruiting</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the vendor deal and its benefits..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="discount_type">Discount Type</Label>
              <Select value={formData.discount_type} onValueChange={(value) => setFormData(prev => ({ ...prev, discount_type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="discount_value">
                {formData.discount_type === 'percentage' ? 'Percentage (%)' : 'Amount ($)'}
              </Label>
              <Input
                id="discount_value"
                type="number"
                placeholder={formData.discount_type === 'percentage' ? '25' : '1000'}
                value={formData.discount_value}
                onChange={(e) => setFormData(prev => ({ ...prev, discount_value: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="terms">Terms & Conditions</Label>
            <Textarea
              id="terms"
              placeholder="e.g., Minimum $50K annual commitment. Valid for new accounts only."
              value={formData.terms}
              onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
              rows={2}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="expiry_date">Expiry Date</Label>
            <Input
              id="expiry_date"
              type="date"
              value={formData.expiry_date}
              onChange={(e) => setFormData(prev => ({ ...prev, expiry_date: e.target.value }))}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="contact_info">Contact Information</Label>
            <Input
              id="contact_info"
              placeholder="e.g., enterprise@vendor.com or contact person"
              value={formData.contact_info}
              onChange={(e) => setFormData(prev => ({ ...prev, contact_info: e.target.value }))}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Share Deal</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}