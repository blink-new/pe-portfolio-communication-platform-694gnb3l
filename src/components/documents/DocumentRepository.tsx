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
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Upload,
  Calendar,
  Building2,
  TrendingUp,
  File,
  FileSpreadsheet,
  FileImage,
  FileVideo
} from 'lucide-react'
import { blink } from '@/blink/client'

interface Document {
  id: string
  title: string
  description: string
  category: string
  file_url: string
  file_name: string
  file_size: number
  file_type: string
  uploaded_by_user_id: string
  company_id: string
  is_public: number
  download_count: number
  tags: string
  created_at: string
}

export function DocumentRepository() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(true)

  const categories = [
    'all', 'Templates', 'HR & People', 'Sales & Marketing', 'Security & Compliance', 
    'Finance & Legal', 'Operations', 'Technology', 'Strategy', 'Best Practices'
  ]

  const loadDocuments = async () => {
    try {
      const documentsData = await blink.db.documents.list({
        where: { is_public: "1" },
        orderBy: { created_at: 'desc' }
      })
      setDocuments(documentsData)
    } catch (error) {
      console.error('Failed to load documents:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDocuments()
  }, [])

  const handleDownload = async (documentId: string, fileUrl: string, fileName: string) => {
    try {
      // Increment download count
      const document = documents.find(d => d.id === documentId)
      if (document) {
        await blink.db.documents.update(documentId, {
          download_count: document.download_count + 1
        })
        setDocuments(prev => prev.map(d => 
          d.id === documentId ? { ...d, download_count: d.download_count + 1 } : d
        ))
      }

      // Track access
      const user = await blink.auth.me()
      await blink.db.document_access.create({
        id: `access_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        document_id: documentId,
        user_id: user.id
      })

      // Simulate download (in real app, this would be the actual file URL)
      window.open(fileUrl, '_blank')
    } catch (error) {
      console.error('Failed to download document:', error)
    }
  }

  const handleUploadDocument = async (formData: any, file: File) => {
    try {
      const user = await blink.auth.me()
      
      // Upload file to storage
      const { publicUrl } = await blink.storage.upload(
        file,
        `documents/${file.name}`,
        { upsert: true }
      )

      const documentId = `doc_${Date.now()}`
      
      await blink.db.documents.create({
        id: documentId,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        file_url: publicUrl,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        uploaded_by_user_id: user.id,
        company_id: formData.company_id || null,
        is_public: 1,
        download_count: 0,
        tags: JSON.stringify(formData.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean))
      })
      
      loadDocuments() // Refresh the list
    } catch (error) {
      console.error('Failed to upload document:', error)
    }
  }

  const filteredDocuments = documents.filter(document => {
    const matchesSearch = document.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         document.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         document.tags.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || document.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return FileText
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) return FileSpreadsheet
    if (fileType.includes('image')) return FileImage
    if (fileType.includes('video')) return FileVideo
    return File
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const parseTags = (tagsString: string) => {
    try {
      return JSON.parse(tagsString) || []
    } catch {
      return []
    }
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
          <h1 className="text-3xl font-bold tracking-tight">Document Repository</h1>
          <p className="text-muted-foreground">
            Centralized library of templates, best practices, and shared knowledge
          </p>
        </div>
        <UploadDocumentDialog onUploadDocument={handleUploadDocument} />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length}</div>
            <p className="text-xs text-muted-foreground">
              Across {new Set(documents.map(d => d.category)).size} categories
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {documents.reduce((sum, doc) => sum + doc.download_count, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Knowledge shared across portfolio
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Popular</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Templates</div>
            <p className="text-xs text-muted-foreground">
              {documents.filter(d => d.category === 'Templates').length} documents
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Uploads</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {documents.filter(d => {
                const uploadDate = new Date(d.created_at)
                const weekAgo = new Date()
                weekAgo.setDate(weekAgo.getDate() - 7)
                return uploadDate > weekAgo
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              This week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search documents, tags, or descriptions..."
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

      {/* Documents Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredDocuments.map((document) => {
          const FileIcon = getFileIcon(document.file_type)
          const tags = parseTags(document.tags)
          
          return (
            <Card key={document.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <FileIcon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg line-clamp-2">{document.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {document.file_name}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {document.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <Badge variant="outline">{document.category}</Badge>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        <span>{document.download_count}</span>
                      </div>
                      <span>{formatFileSize(document.file_size)}</span>
                    </div>
                  </div>

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {tags.slice(0, 3).map((tag: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    <p>Uploaded {new Date(document.created_at).toLocaleDateString()}</p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleDownload(document.id, document.file_url, document.file_name)}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open(document.file_url, '_blank')}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No documents found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search or be the first to share a document.
          </p>
          <UploadDocumentDialog onUploadDocument={handleUploadDocument} />
        </div>
      )}
    </div>
  )
}

function UploadDocumentDialog({ onUploadDocument }: { onUploadDocument: (data: any, file: File) => void }) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return
    
    onUploadDocument(formData, file)
    setOpen(false)
    setFile(null)
    setFormData({
      title: '',
      description: '',
      category: '',
      tags: ''
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      if (!formData.title) {
        setFormData(prev => ({ 
          ...prev, 
          title: selectedFile.name.replace(/\.[^/.]+$/, "") 
        }))
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Share a document, template, or best practice with the portfolio network.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="file">File</Label>
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md"
              required
            />
            {file && (
              <p className="text-xs text-muted-foreground">
                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="title">Document Title</Label>
            <Input
              id="title"
              placeholder="e.g., Q4 Board Deck Template"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what this document contains and how it can be used..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
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
                <SelectItem value="Templates">Templates</SelectItem>
                <SelectItem value="HR & People">HR & People</SelectItem>
                <SelectItem value="Sales & Marketing">Sales & Marketing</SelectItem>
                <SelectItem value="Security & Compliance">Security & Compliance</SelectItem>
                <SelectItem value="Finance & Legal">Finance & Legal</SelectItem>
                <SelectItem value="Operations">Operations</SelectItem>
                <SelectItem value="Technology">Technology</SelectItem>
                <SelectItem value="Strategy">Strategy</SelectItem>
                <SelectItem value="Best Practices">Best Practices</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              placeholder="e.g., board, template, finance, kpi (comma-separated)"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">
              Add tags to help others find your document
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!file}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}