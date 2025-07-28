import { useState, useEffect } from 'react'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { DashboardOverview } from '@/components/dashboard/DashboardOverview'
import { MastermindGroups } from '@/components/mastermind/MastermindGroups'
import { VendorMarketplace } from '@/components/vendors/VendorMarketplace'
import { DocumentRepository } from '@/components/documents/DocumentRepository'
import { CompanyDirectory } from '@/components/companies/CompanyDirectory'
import { blink } from '@/blink/client'

function App() {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="flex items-center justify-center w-16 h-16 bg-primary rounded-lg mx-auto mb-6">
            <svg className="w-8 h-8 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">PE Portfolio Executive Platform</h1>
          <p className="text-muted-foreground mb-6">
            Connect with fellow executives across your portfolio companies to share insights, collaborate, and create value.
          </p>
          <button
            onClick={() => blink.auth.login()}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Sign In to Continue
          </button>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardOverview onSectionChange={setActiveSection} />
      case 'mastermind':
        return <MastermindGroups />
      case 'vendors':
        return <VendorMarketplace />
      case 'documents':
        return <DocumentRepository />
      case 'companies':
        return <CompanyDirectory />
      case 'network':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Network</h1>
            <p className="text-muted-foreground">Coming soon - Professional networking and connection opportunities.</p>
          </div>
        )
      case 'notifications':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground">Coming soon - Stay updated with important platform activities.</p>
          </div>
        )
      case 'profile':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
            <p className="text-muted-foreground">Coming soon - Manage your executive profile and preferences.</p>
          </div>
        )
      case 'settings':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">Coming soon - Platform settings and preferences.</p>
          </div>
        )
      default:
        return <DashboardOverview onSectionChange={setActiveSection} />
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        <main className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </SidebarProvider>
  )
}

export default App