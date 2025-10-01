"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, DollarSign, Percent, Activity } from "lucide-react"

interface PortfolioStatsProps {
  stats: {
    totalValue: number
    totalFees: number
    avgApy: number
    activePositions: number
  }
}

export function PortfolioStats({ stats }: PortfolioStatsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const statCards = [
    {
      title: "Total Value",
      value: formatCurrency(stats.totalValue),
      icon: DollarSign,
      color: "text-blue-500",
    },
    {
      title: "Total Fees Earned",
      value: formatCurrency(stats.totalFees),
      icon: TrendingUp,
      color: "text-green-500",
    },
    {
      title: "Average APY",
      value: `${stats.avgApy.toFixed(2)}%`,
      icon: Percent,
      color: "text-purple-500",
    },
    {
      title: "Active Positions",
      value: stats.activePositions.toString(),
      icon: Activity,
      color: "text-orange-500",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold mt-2">{stat.value}</p>
              </div>
              <div className={`rounded-full bg-muted p-3 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
