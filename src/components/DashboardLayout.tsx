import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { Bell, Search, Settings, User, Menu } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Separator } from './ui/separator'
import { cn } from '@/lib/utils'

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <div className="flex-1 ml-72">
        {/* Sticky Header */}
        <header className="sticky top-0 z-30 h-14 bg-white border-b">
          <div className="flex h-full items-center justify-between px-6">
            <div className="flex items-center gap-4 flex-1">
              {/* Mobile Menu Trigger */}
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>

              {/* Current Section Title */}
              <div className="hidden lg:flex items-center">
                <h1 className="text-base font-medium">Dashboard</h1>
                <Separator orientation="vertical" className="mx-4 h-4" />
              </div>

              {/* Search Bar */}
              <div className="max-w-xl flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input 
                    type="search" 
                    placeholder="Search HS codes, trade data..." 
                    className={cn(
                      "pl-10 w-full",
                      "bg-gray-50",
                      "border-gray-200",
                      "focus:bg-white",
                      "transition-colors"
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 ml-4">
              <Button 
                variant="ghost" 
                size="icon"
                className="relative"
              >
                <Bell className="h-5 w-5 text-gray-500" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5 text-gray-500" />
                </Button>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5 text-gray-500" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="bg-white">
          <Outlet />
        </main>
      </div>
    </div>
  )
}