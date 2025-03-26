import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Badge } from "@/components/ui/badge"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface HSCode {
  id: string
  hs_code_description: string
}

interface TradeStats {
  value: number
  volume: number
  year_val: number
  month_val: number
  trade_flow: string
  hs_code_id?: string
}

interface UserProfile {
  id: string
  email: string
  full_name: string | null
}

interface Subscription {
  plan_type: string
  status: string
  current_period_end: string
}

interface HSCodeResponse {
  hs_code_id: string
  hs_codes: {
    id: string
    hs_code_description: string
  }
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [hsCodes, setHsCodes] = useState<HSCode[]>([])
  const [tradeStats, setTradeStats] = useState<TradeStats[]>([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError
      setProfile(profileData)

      // Fetch subscription data
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (subscriptionError && subscriptionError.code !== 'PGRST116') {
        console.error('Subscription fetch error:', subscriptionError)
      }
      setSubscription(subscriptionData)

      // Fetch HS codes with proper typing
      const { data: userHsCodes, error: hsCodesError } = await supabase
        .from('user_hs_codes')
        .select('hs_code_id, hs_codes!inner(id, hs_code_description)')
        .eq('user_id', user.id) as { data: HSCodeResponse[] | null, error: any }

      if (hsCodesError) throw hsCodesError

      setHsCodes(userHsCodes?.map(code => ({
        id: code.hs_code_id,
        hs_code_description: code.hs_codes.hs_code_description
      })) || [])

      // Fetch trade stats
      if (userHsCodes && userHsCodes.length > 0) {
        const { data: stats, error: statsError } = await supabase
          .from('trade_stats')
          .select('*')
          .in('hs_code_id', userHsCodes.map(code => code.hs_code_id))
          .order('year_val', { ascending: false })
          .order('month_val', { ascending: false })
          .limit(10)

        if (statsError) throw statsError
        setTradeStats(stats || [])
      }

    } catch (error: any) {
      toast.error('Error fetching dashboard data')
      console.error('Dashboard data fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const totalTradeValue = tradeStats.reduce((sum, stat) => sum + (stat.value || 0), 0)
  const totalVolume = tradeStats.reduce((sum, stat) => sum + (stat.volume || 0), 0)
  const activeHSCodes = hsCodes.length
  const tradeGrowth = calculateTradeGrowth(tradeStats)

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 bg-white">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold md:text-3xl">
          Welcome back, {profile?.full_name || profile?.email?.split('@')[0] || 'User'}
        </h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Trade Value */}
        <Card className="w-full bg-white">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardDescription>Total Trade Value</CardDescription>
                <CardTitle className="text-2xl mt-1">${formatNumber(totalTradeValue)}</CardTitle>
              </div>
              <Badge 
                variant={tradeGrowth >= 0 ? "default" : "destructive"}
                className="flex items-center gap-1"
              >
                {tradeGrowth >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {tradeGrowth >= 0 ? '+' : ''}{tradeGrowth}%
              </Badge>
            </div>
          </CardHeader>
          <CardFooter>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-sm">
                {tradeGrowth >= 0 ? 'Trending up' : 'Trending down'} this month
                {tradeGrowth >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">Compared to last month</p>
            </div>
          </CardFooter>
        </Card>

        {/* Total Volume */}
        <Card className="w-full bg-white">
          <CardHeader>
            <div>
              <CardDescription>Total Volume</CardDescription>
              <CardTitle className="text-2xl mt-1">{formatNumber(totalVolume)}</CardTitle>
            </div>
          </CardHeader>
          <CardFooter>
            <div className="flex flex-col gap-1">
              <div className="text-sm">Trade volume metrics</div>
              <p className="text-sm text-muted-foreground">Units traded this period</p>
            </div>
          </CardFooter>
        </Card>

        {/* Active HS Codes */}
        <Card className="w-full bg-white">
          <CardHeader>
            <div>
              <CardDescription>Active HS Codes</CardDescription>
              <CardTitle className="text-2xl mt-1">{activeHSCodes}</CardTitle>
            </div>
          </CardHeader>
          <CardFooter>
            <div className="flex flex-col gap-1">
              <div className="text-sm">Monitored codes</div>
              <p className="text-sm text-muted-foreground">Active tracking status</p>
            </div>
          </CardFooter>
        </Card>

        {/* Subscription Status */}
        <Card className="w-full bg-white">
          <CardHeader>
            <div>
              <CardDescription>Subscription Status</CardDescription>
              <CardTitle className="text-2xl mt-1 capitalize">
                {subscription?.plan_type || 'Free'}
              </CardTitle>
            </div>
          </CardHeader>
          <CardFooter>
            <div className="flex flex-col gap-1">
              <div className="text-sm">{subscription?.status || 'Active'} plan</div>
              <p className="text-sm text-muted-foreground">
                {subscription?.current_period_end
                  ? `Renews ${new Date(subscription.current_period_end).toLocaleDateString()}`
                  : 'Free tier access'}
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Recent HS Codes */}
      <Card className="bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Recent HS Codes</CardTitle>
            <CardDescription>Your recently added codes</CardDescription>
          </div>
          <Button
            onClick={() => navigate('/hs-codes')}
            variant="outline"
            size="sm"
            className="h-8 bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200"
          >
            Add HS Code
          </Button>
        </CardHeader>
        <div className="p-6">
          <div className="space-y-4">
            {hsCodes.slice(0, 5).map((code) => (
              <div 
                key={code.id} 
                className="flex items-center justify-between gap-4 rounded-lg border p-3 bg-white hover:bg-gray-50"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{code.id}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {code.hs_code_description}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/trade-analysis/${code.id}`)}
                >
                  View
                </Button>
              </div>
            ))}
            {hsCodes.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-lg border bg-white p-8 text-center">
                <p className="text-sm text-muted-foreground mb-4">No HS codes added yet</p>
                <Button
                  onClick={() => navigate('/hs-codes')}
                  variant="outline"
                  size="sm"
                  className="h-8 bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200"
                >
                  Add Your First HS Code
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
    notation: 'compact',
    compactDisplay: 'short'
  }).format(num)
}

function calculateTradeGrowth(stats: TradeStats[]): number {
  if (stats.length < 2) return 0
  
  const sortedStats = [...stats].sort((a, b) => {
    const dateA = new Date(a.year_val, a.month_val - 1)
    const dateB = new Date(b.year_val, b.month_val - 1)
    return dateB.getTime() - dateA.getTime()
  })

  const currentValue = sortedStats[0]?.value || 0
  const previousValue = sortedStats[1]?.value || 0

  if (previousValue === 0) return 0
  return Math.round(((currentValue - previousValue) / previousValue) * 100)
}