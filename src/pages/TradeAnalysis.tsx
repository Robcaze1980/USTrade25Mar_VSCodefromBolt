import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { TradeAnalysisChart } from '@/components/TradeAnalysisChart'

interface UserHSCode {
  hs_code_id: string
  hs_code_description: string
  trade_type: 'Import' | 'Export'
}

interface HSCodeResponse {
  hs_code_id: string
  trade_type: 'Import' | 'Export'
  hs_codes: {
    hs_code_description: string
  } | null
}

export default function TradeAnalysis() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [userHSCodes, setUserHSCodes] = useState<UserHSCode[]>([])
  const [selectedCode, setSelectedCode] = useState<string | null>(null)

  useEffect(() => {
    fetchUserHSCodes()
  }, [])

  const fetchUserHSCodes = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: userCodes, error: userCodesError } = await supabase
        .from('user_hs_codes')
        .select(`
          hs_code_id,
          trade_type,
          hs_codes (
            hs_code_description
          )
        `)
        .eq('user_id', user.id) as { data: HSCodeResponse[] | null, error: any }

      if (userCodesError) throw userCodesError

      const formattedCodes = userCodes?.map(code => ({
        hs_code_id: code.hs_code_id,
        hs_code_description: code.hs_codes?.hs_code_description || 'Description not available',
        trade_type: code.trade_type
      })) || []

      setUserHSCodes(formattedCodes)

      // If there's only one code, select it automatically
      if (formattedCodes.length === 1) {
        setSelectedCode(formattedCodes[0].hs_code_id)
      }
    } catch (error: any) {
      console.error('Error fetching HS codes:', error)
      toast.error('Failed to fetch HTS codes')
    } finally {
      setLoading(false)
    }
  }

  const handleCodeSelect = (code: UserHSCode) => {
    setSelectedCode(code.hs_code_id)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Trade Analysis</h1>
        <Button onClick={() => navigate('/hs-codes')}>
          Add HTS Code
        </Button>
      </div>

      {/* HS Code Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {userHSCodes.map((code) => (
          <Card 
            key={code.hs_code_id}
            className={`cursor-pointer transition-all ${
              selectedCode === code.hs_code_id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => handleCodeSelect(code)}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{code.hs_code_id}</CardTitle>
                  <CardDescription className="mt-1 line-clamp-2">
                    {code.hs_code_description}
                  </CardDescription>
                </div>
                <Badge variant={code.trade_type === 'Import' ? 'default' : 'secondary'}>
                  {code.trade_type}
                </Badge>
              </div>
            </CardHeader>
          </Card>
        ))}

        {userHSCodes.length === 0 && (
          <Card className="col-span-full p-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                You haven't added any HTS codes yet. Add codes to start analyzing trade data.
              </p>
              <Button onClick={() => navigate('/hs-codes')}>
                Add Your First HTS Code
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Trade Analysis Chart */}
      {selectedCode && (
        <div className="mt-6">
          <TradeAnalysisChart hsCode={selectedCode} />
        </div>
      )}
    </div>
  )
}