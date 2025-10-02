import { TrendingUp, Wallet, Activity, DollarSign } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative";
  icon: React.ReactNode;
}

function StatCard({ title, value, change, changeType, icon }: StatCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-semibold truncate" data-testid={`stat-${title.toLowerCase().replace(/\s+/g, '-')}`}>
            {value}
          </p>
          {change && (
            <p className={`text-sm mt-1 ${changeType === "positive" ? "text-chart-3" : "text-chart-5"}`}>
              {change}
            </p>
          )}
        </div>
        <div className="text-muted-foreground">{icon}</div>
      </div>
    </Card>
  );
}

interface DashboardStatsProps {
  totalLiquidity: string;
  totalFees: string;
  activePositions: number;
  avgAPY: string;
}

export default function DashboardStats({
  totalLiquidity,
  totalFees,
  activePositions,
  avgAPY,
}: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Liquidity"
        value={totalLiquidity}
        change="+12.5% this week"
        changeType="positive"
        icon={<Wallet className="w-6 h-6" />}
      />
      <StatCard
        title="Total Fees Earned"
        value={totalFees}
        change="+$145.20 today"
        changeType="positive"
        icon={<DollarSign className="w-6 h-6" />}
      />
      <StatCard
        title="Active Positions"
        value={activePositions.toString()}
        icon={<Activity className="w-6 h-6" />}
      />
      <StatCard
        title="Avg APY"
        value={avgAPY}
        change="+3.2% vs last month"
        changeType="positive"
        icon={<TrendingUp className="w-6 h-6" />}
      />
    </div>
  );
}
