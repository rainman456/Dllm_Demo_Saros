import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, DollarSign, Layers, Percent } from "lucide-react"

interface DashboardStatsProps {
  stats?: {
    totalLiquidity: string
    totalFees: string
    activePositions: number
    avgAPY: string
  }
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  const statCards = [
    {
      title: "Total Liquidity",
      value: stats?.totalLiquidity || "$0.00",
      icon: <DollarSign className="w-5 h-5" />,
      color: "text-blue-500",
    },
    {
      title: "Fees Earned",
      value: stats?.totalFees || "$0.00",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "text-green-500",
    },
    {
      title: "Active Positions",
      value: stats?.activePositions || 0,
      icon: <Layers className="w-5 h-5" />,
      color: "text-purple-500",
    },
    {
      title: "Avg APY",
      value: stats?.avgAPY || "0%",
      icon: <Percent className="w-5 h-5" />,
      color: "text-orange-500",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <div className={`${stat.color} bg-current/10 p-3 rounded-lg`}>{stat.icon}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
