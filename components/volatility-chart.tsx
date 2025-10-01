"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface VolatilityChartProps {
  data: {
    poolAddress: string
    mean: number
    stdDev: number
    volatilityRatio: number
    isHighVolatility: boolean
    recommendedRangeWidth: number
    historicalPrices: Array<{
      timestamp: number
      price: number
    }>
  }
}

export function VolatilityChart({ data }: VolatilityChartProps) {
  const chartData = data.historicalPrices.map((point) => ({
    time: new Date(point.timestamp).toLocaleTimeString(),
    price: point.price,
  }))

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Volatility Analysis</CardTitle>
          <Badge variant={data.isHighVolatility ? "destructive" : "default"}>
            {data.isHighVolatility ? "High Volatility" : "Normal Volatility"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div>
            <p className="text-sm text-muted-foreground">Mean Price</p>
            <p className="text-lg font-semibold">{data.mean.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Std Dev</p>
            <p className="text-lg font-semibold">{data.stdDev.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Volatility Ratio</p>
            <p className="text-lg font-semibold">{(data.volatilityRatio * 100).toFixed(2)}%</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Recommended Range</p>
            <p className="text-lg font-semibold">{(data.recommendedRangeWidth * 100).toFixed(0)}%</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
