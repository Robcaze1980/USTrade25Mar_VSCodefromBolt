import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  BarChart2,
  Globe,
  LineChart,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  Database,
  ClipboardList,
  FileCode,
  ArrowUpCircle
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const mainNavItems = [
  { title: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { title: 'Trade Analysis', icon: BarChart2, href: '/trade-analysis' },
  { title: 'Market Insights', icon: LineChart, href: '/market-insights' },
  { title: 'Global Trends', icon: Globe, href: '/global-trends' },
  { title: 'Team', icon: Users, href: '/team' },
]

const documentsItems = [
  { title: 'Data Library', icon: Database, href: '/data-library' },
  { title: 'Reports', icon: ClipboardList, href: '/reports' },
  { title: 'HS Code Manager', icon: FileCode, href: '/hs-codes' },
]

const secondaryNavItems = [
  { title: 'Settings', icon: Settings, href: '/settings' },
  { title: 'Help & Support', icon: HelpCircle, href: '/support' },
]

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      toast.success('Logged out successfully')
      navigate('/login')
    } catch (error: any) {
      toast.error('Error logging out: ' + error.message)
    }
  }

  const NavItem = ({ 
    icon: Icon, 
    title, 
    href 
  }: { 
    icon: any
    title: string
    href: string 
  }) => {
    const isActive = location.pathname === href
    
    return (
      <Link
        to={href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
          isActive && "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50"
        )}
      >
        <Icon className="h-4 w-4" />
        <span className="text-sm font-medium">{title}</span>
      </Link>
    )
  }

  const NavSection = ({ 
    title, 
    items 
  }: { 
    title: string
    items: { title: string; icon: any; href: string }[] 
  }) => {
    return (
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-gray-500 dark:text-gray-400">
          {title}
        </h2>
        <div className="space-y-1">
          {items.map((item) => (
            <NavItem
              key={item.href}
              icon={item.icon}
              title={item.title}
              href={item.href}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-72 flex-col fixed left-0 top-0 border-r bg-white dark:bg-gray-950">
      {/* Header */}
      <div className="flex h-14 items-center border-b px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <ArrowUpCircle className="h-6 w-6" />
          <span>US Trade Navigator</span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-auto py-2">
        <NavSection title="Overview" items={mainNavItems} />
        <NavSection title="Documents" items={documentsItems} />
      </div>

      {/* Secondary Navigation */}
      <div className="border-t bg-gray-50/50 dark:bg-gray-900/50">
        <NavSection title="Settings" items={secondaryNavItems} />
        <div className="px-7 py-2">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-red-600 transition-colors hover:text-red-700 dark:text-red-500 dark:hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm font-medium">Log out</span>
          </button>
        </div>
      </div>
    </div>
  )
}