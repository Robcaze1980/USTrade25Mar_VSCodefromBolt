import { useState, useEffect } from 'react'
import { Search, Plus, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { processTradeData } from '@/lib/trade-webhook'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface HTSCode {
  id: string
  hs_code_description: string
}

interface UserHTSCode {
  hs_code_id: string
  hs_code_description?: string
  trade_type: 'Import' | 'Export'
}

export default function HSCodes() {
  const [searchQuery, setSearchQuery] = useState('')
  const [tradeType, setTradeType] = useState<'Import' | 'Export'>('Import')
  const [searchResults, setSearchResults] = useState<HTSCode[]>([])
  const [activeCodes, setActiveCodes] = useState<UserHTSCode[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedCode, setSelectedCode] = useState<HTSCode | null>(null)
  const [activeSubscription, setActiveSubscription] = useState<string | null>(null)

  useEffect(() => {
    fetchUserSubscription()
    fetchUserHSCodes()
  }, [])

  const fetchUserSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      if (error) throw error
      setActiveSubscription(data?.id || null)
    } catch (error) {
      console.error('Error fetching subscription:', error)
    }
  }

  const fetchUserHSCodes = async () => {
    try {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: userCodes, error: userCodesError } = await supabase
        .from('user_hs_codes')
        .select('hs_code_id, trade_type')
        .eq('user_id', user.id)

      if (userCodesError) throw userCodesError

      if (!userCodes || userCodes.length === 0) {
        setActiveCodes([])
        return
      }

      const { data: descriptions, error: descriptionsError } = await supabase
        .from('hs_codes')
        .select('id, hs_code_description')
        .in('id', userCodes.map(code => code.hs_code_id))

      if (descriptionsError) throw descriptionsError

      const codesWithDescriptions = userCodes.map(userCode => ({
        hs_code_id: userCode.hs_code_id,
        hs_code_description: descriptions?.find(d => d.id === userCode.hs_code_id)?.hs_code_description,
        trade_type: userCode.trade_type || 'Import'
      }))

      setActiveCodes(codesWithDescriptions)
    } catch (error: any) {
      toast.error('Failed to fetch your HTS codes')
      console.error('Error fetching user HTS codes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const validateHSCode = (code: string): boolean => {
    // For search, accept 6 or 10 digit codes
    if (!/^\d{6}(\d{4})?$/.test(code)) {
      toast.error('HTS code must be 6 or 10 digits')
      return false
    }
    return true
  }

  const searchHSCodes = async () => {
    if (!searchQuery.trim()) return
    if (!validateHSCode(searchQuery)) return

    try {
      setIsSearching(true)
      setSearchResults([])
      setSelectedCode(null) // Clear any previously selected code

      // If 6 digits provided, search for all codes starting with those digits
      const searchPattern = searchQuery.length === 6 
        ? `${searchQuery}%`
        : searchQuery

      const { data: matchingCodes, error: searchError } = await supabase
        .from('hs_codes')
        .select('id, hs_code_description')
        .like('id', searchPattern)
        .order('id')
        .limit(20)

      if (searchError) throw searchError

      if (!matchingCodes || matchingCodes.length === 0) {
        toast.info('No HTS codes found matching your search')
        return
      }

      setSearchResults(matchingCodes)
    } catch (error: any) {
      toast.error('Search failed')
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const selectCode = (code: HTSCode) => {
    // Only allow selection of 10-digit codes
    if (code.id.length !== 10) {
      toast.error('Only 10-digit HTS codes can be selected')
      return
    }
    setSelectedCode(code)
  }

  const addHSCode = async (code: HTSCode) => {
    try {
      setIsProcessing(true)

      // Ensure we're working with a single, valid 10-digit code
      if (code.id.length !== 10) {
        toast.error('Must select a full 10-digit HTS code')
        return
      }

      if (!activeSubscription) {
        toast.error('You need an active subscription to add HTS codes')
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const isCodeAdded = activeCodes.some(c => c.hs_code_id === code.id)
      if (isCodeAdded) {
        toast.error('This HTS code is already in your list')
        return
      }

      // Process single HTS code through webhook
      await processTradeData(code.id, tradeType)

      // If webhook processing successful, add to database
      const { error } = await supabase
        .from('user_hs_codes')
        .insert([{
          user_id: user.id,
          hs_code_id: code.id,
          subscription_id: activeSubscription,
          trade_type: tradeType
        }])

      if (error) throw error

      setActiveCodes(prev => [...prev, {
        hs_code_id: code.id,
        hs_code_description: code.hs_code_description,
        trade_type: tradeType
      }])

      toast.success('HTS code added successfully')
      setSearchResults([])
      setSearchQuery('')
      setSelectedCode(null)
    } catch (error: any) {
      toast.error(error.message || 'Failed to add HTS code')
      console.error('Error adding HTS code:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const removeHSCode = async (codeId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('user_hs_codes')
        .delete()
        .eq('user_id', user.id)
        .eq('hs_code_id', codeId)

      if (error) throw error

      setActiveCodes(prev => prev.filter(code => code.hs_code_id !== codeId))
      toast.success('HTS code removed')
    } catch (error: any) {
      toast.error('Failed to remove HTS code')
      console.error('Error removing HTS code:', error)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">HTS Code Manager</h1>

      {/* Search Section */}
      <Card className="p-6 mb-8">
        <div className="space-y-6">
          {/* Trade Type Selection */}
          <div className="space-y-4">
            <Label>Trade Type</Label>
            <RadioGroup
              value={tradeType}
              onValueChange={(value: 'Import' | 'Export') => setTradeType(value)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Import" id="import" />
                <Label htmlFor="import">Import</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Export" id="export" />
                <Label htmlFor="export">Export</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Search Input */}
          <div className="flex gap-4">
            <Input
              placeholder="Enter 6 or 10-digit HTS code (e.g., 010121 or 0101210010)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchHSCodes()}
              className="flex-1"
            />
            <Button
              onClick={searchHSCodes}
              disabled={isSearching || !searchQuery.trim()}
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Search
            </Button>
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Search Results</h2>
            <div className="space-y-2">
              {searchResults.map((code) => (
                <div
                  key={code.id}
                  className={`flex items-center justify-between p-3 bg-white rounded-lg border ${
                    selectedCode?.id === code.id ? 'border-primary' : ''
                  }`}
                  onClick={() => code.id.length === 10 && selectCode(code)}
                  style={{ cursor: code.id.length === 10 ? 'pointer' : 'default' }}
                >
                  <div>
                    <p className="font-medium">{code.id}</p>
                    <p className="text-sm text-gray-600">{code.hs_code_description}</p>
                  </div>
                  {code.id.length === 10 && (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        addHSCode(code)
                      }}
                      disabled={
                        isProcessing || 
                        activeCodes.some(c => c.hs_code_id === code.id) || 
                        !activeSubscription
                      }
                    >
                      {isProcessing && selectedCode?.id === code.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      Add
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Active Codes Section */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Your HTS Codes</h2>
        {isLoading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : activeCodes.length > 0 ? (
          <div className="space-y-2">
            {activeCodes.map((code) => (
              <div
                key={code.hs_code_id}
                className="flex items-center justify-between p-3 bg-white rounded-lg border"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{code.hs_code_id}</p>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100">
                      {code.trade_type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {code.hs_code_description || 'Description not available'}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeHSCode(code.hs_code_id)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">
            You haven't added any HTS codes yet. Use the search above to find and add codes.
          </p>
        )}
      </Card>
    </div>
  )
}