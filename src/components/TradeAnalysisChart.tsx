import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Label } from '@/components/ui/label';
import { 
  Bar, 
  Line,
  ComposedChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  Legend,
  Label as ChartLabel
} from "recharts";
import { Loader2, Download } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface TradeStats {
  year_val: number;
  month_val: number;
  value: number;
  volume: number;
  value_per_volume: number;
  trade_flow: string;
  hs_code_id: string;
}

interface ChartData {
  month: string;
  total_value: number;
  volume: number;
  value_per_volume: number;
  isLatest?: boolean;
}

interface TradeAnalysisChartProps {
  hsCode: string;
}

type ViewType = 'value' | 'volume' | 'combined' | 'price';
type ChartType = 'bar' | 'line';
type TimeRange = 'current' | 'two_years' | 'five_years';

export function TradeAnalysisChart({ hsCode }: TradeAnalysisChartProps) {
  const [loading, setLoading] = useState(true);
  const [tradeStats, setTradeStats] = useState<TradeStats[]>([]);
  const [viewType, setViewType] = useState<ViewType>('combined');
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [timeRange, setTimeRange] = useState<TimeRange>('current');
  const [tradeFlow, setTradeFlow] = useState<'Import' | 'Export'>('Import');
  const [hsCodeDescription, setHsCodeDescription] = useState<string>('');

  const formatValue = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  };

  const formatVolume = (volume: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(volume) + ' kg';
  };

  const formatValuePerVolume = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value) + '/kg';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric"
    });
  };

  const getBarColor = (entry: ChartData) => {
    return entry.isLatest ? '#2dd4bf' : '#2a9d90';
  };

  const getTimeRangeFilter = (range: TimeRange): { startYear: number } => {
    const currentYear = new Date().getFullYear();
    const filters = {
      'current': { startYear: currentYear },
      'two_years': { startYear: currentYear - 1 },
      'five_years': { startYear: currentYear - 5 }
    };
    return filters[range];
  };

  useEffect(() => {
    fetchHsCodeDescription();
    fetchTradeStats();
  }, [hsCode, timeRange, tradeFlow]);

  const fetchHsCodeDescription = async () => {
    try {
      const { data, error } = await supabase
        .from('hs_codes')
        .select('hs_code_description')
        .eq('id', hsCode)
        .single();

      if (error) throw error;
      setHsCodeDescription(data?.hs_code_description || '');
    } catch (error) {
      console.error('Error fetching HS code description:', error);
      setHsCodeDescription('');
    }
  };

  const fetchTradeStats = async () => {
    try {
      setLoading(true);
      const { startYear } = getTimeRangeFilter(timeRange);
      
      let query = supabase
        .from('trade_stats')
        .select('*')
        .eq('hs_code_id', hsCode)
        .eq('trade_flow', tradeFlow)
        .order('year_val', { ascending: true })
        .order('month_val', { ascending: true });

      if (startYear > 0) {
        query = query.gte('year_val', startYear);
      }

      const { data, error } = await query;

      if (error) throw error;

      const validData = (data || []).filter(stat => 
        stat && 
        typeof stat.year_val === 'number' && 
        typeof stat.month_val === 'number' && 
        typeof stat.value === 'number' && 
        typeof stat.volume === 'number' &&
        !isNaN(stat.value) &&
        !isNaN(stat.volume)
      );

      setTradeStats(validData);
    } catch (error: any) {
      console.error('Error fetching trade stats:', error);
      toast.error('Failed to fetch trade statistics');
      setTradeStats([]);
    } finally {
      setLoading(false);
    }
  };

  const chartData: ChartData[] = useMemo(() => {
    if (!tradeStats.length) return [];

    const monthlyData = new Map<string, ChartData>();

    tradeStats.forEach(stat => {
      const monthKey = `${stat.year_val}-${String(stat.month_val).padStart(2, '0')}`;
      const currentData = monthlyData.get(monthKey) || {
        month: monthKey,
        total_value: 0,
        volume: 0,
        value_per_volume: 0
      };

      currentData.total_value += stat.value;
      currentData.volume += stat.volume;
      currentData.value_per_volume = currentData.total_value / currentData.volume;

      monthlyData.set(monthKey, currentData);
    });

    const sortedData = Array.from(monthlyData.values())
      .map(data => ({
        ...data,
        isLatest: false
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    if (sortedData.length > 0) {
      sortedData[sortedData.length - 1].isLatest = true;
    }

    return sortedData;
  }, [tradeStats]);

  const currentYear = new Date().getFullYear();
  const timeRangeLabel = useMemo(() => {
    switch (timeRange) {
      case 'current':
        return `${currentYear}`;
      case 'two_years':
        return `${currentYear - 1}-${currentYear}`;
      case 'five_years':
        return `${currentYear - 5}-${currentYear}`;
      default:
        return '';
    }
  }, [timeRange, currentYear]);

  const handleExportData = () => {
    const csvContent = [
      ['Date', 'Customs Value', 'Volume (kg)', 'Value per Volume'],
      ...chartData.map(data => [
        formatDate(data.month),
        data.total_value,
        data.volume,
        data.value_per_volume
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trade-data-${hsCode}-${new Date().toISOString()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Trade Analysis for HS Code {hsCode}</CardTitle>
            <CardDescription className="space-y-1">
              <p>Showing {tradeFlow === 'Import' ? 'imports for consumption' : 'exports'} data for {timeRangeLabel}</p>
              {hsCodeDescription && (
                <p className="text-sm text-muted-foreground">{hsCodeDescription}</p>
              )}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportData}
              disabled={chartData.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-6 mt-6">
          <div className="space-y-2">
            <Label>Choose timeframe</Label>
            <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">{currentYear}</SelectItem>
                <SelectItem value="two_years">{currentYear - 1}-{currentYear}</SelectItem>
                <SelectItem value="five_years">5 years</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Trade Flow</Label>
            <Select value={tradeFlow} onValueChange={(value: 'Import' | 'Export') => setTradeFlow(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select flow" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Import">Import</SelectItem>
                <SelectItem value="Export">Export</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>View Type</Label>
            <ToggleGroup type="single" value={viewType} onValueChange={(value: ViewType) => value && setViewType(value)}>
              <ToggleGroupItem value="value">Customs Value</ToggleGroupItem>
              <ToggleGroupItem value="volume">Volume</ToggleGroupItem>
              <ToggleGroupItem value="combined">Combined</ToggleGroupItem>
              <ToggleGroupItem value="price">Price</ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="space-y-2">
            <Label>Chart Type</Label>
            <ToggleGroup type="single" value={chartType} onValueChange={(value: ChartType) => value && setChartType(value)}>
              <ToggleGroupItem value="bar">Bar</ToggleGroupItem>
              <ToggleGroupItem value="line">Line</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{ top: 40, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={true}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(date) => formatDate(`${date}-01`)}
                />
                <YAxis 
                  yAxisId="value"
                  tickLine={false}
                  axisLine={true}
                  tick={{ fontSize: 11 }}
                  tickFormatter={viewType === 'price' ? formatValuePerVolume : formatValue}
                  width={80}
                >
                  <ChartLabel 
                    value="Values in USD (thousands)" 
                    angle={-90}
                    position="insideLeft"
                    offset={0}
                    style={{ fill: '#6B7280', fontSize: '12px' }}
                  />
                </YAxis>
                {(viewType === 'volume' || viewType === 'combined') && (
                  <YAxis
                    yAxisId="volume"
                    orientation="right"
                    tickLine={false}
                    axisLine={true}
                    tick={{ fontSize: 11 }}
                    tickFormatter={formatVolume}
                    width={80}
                  />
                )}
                <Tooltip
                  cursor={{ fill: 'rgba(42, 157, 144, 0.1)' }}
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="bg-white p-3 border rounded-lg shadow-lg">
                        <p className="font-medium">{formatDate(`${label}-01`)}</p>
                        {payload.map((entry: any, index: number) => (
                          <p key={index} className="text-sm">
                            {entry.dataKey === 'total_value' && `Customs Value: ${formatValue(entry.value)}`}
                            {entry.dataKey === 'volume' && `Volume: ${formatVolume(entry.value)}`}
                            {entry.dataKey === 'value_per_volume' && `Price: ${formatValuePerVolume(entry.value)}`}
                          </p>
                        ))}
                      </div>
                    );
                  }}
                />
                <Legend />
                
                {viewType === 'price' ? (
                  <Line
                    type="monotone"
                    dataKey="value_per_volume"
                    name="Price per kg"
                    yAxisId="value"
                    stroke="#f43f5e"
                    strokeWidth={2}
                    dot={{ fill: '#f43f5e', r: 4 }}
                  />
                ) : (
                  <>
                    {(viewType === 'value' || viewType === 'combined') && (
                      chartType === 'bar' ? (
                        <Bar
                          dataKey="total_value"
                          name="Customs Value"
                          yAxisId="value"
                          fill="#2a9d90"
                          radius={[4, 4, 0, 0]}
                        >
                          {chartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={getBarColor(entry)}
                            />
                          ))}
                        </Bar>
                      ) : (
                        <Line
                          type="monotone"
                          dataKey="total_value"
                          name="Customs Value"
                          yAxisId="value"
                          stroke="#2a9d90"
                          dot={false}
                        />
                      )
                    )}

                    {(viewType === 'volume' || viewType === 'combined') && (
                      <Line
                        type="monotone"
                        dataKey="volume"
                        name="Volume"
                        yAxisId="volume"
                        stroke="#e76e50"
                        dot={false}
                      />
                    )}
                  </>
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[400px] text-center">
            <p className="text-muted-foreground mb-2">No trade data available for this HTS code.</p>
            <p className="text-sm text-muted-foreground">Try selecting a different time period or check back later.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}