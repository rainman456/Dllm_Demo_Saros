import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, RefreshCw, Trash2, BarChart3 } from "lucide-react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface PositionCardProps {
  poolPair: string;
  rangeMin: string;
  rangeMax: string;
  liquidity: string;
  feesEarned: string;
  status: "in-range" | "out-of-range" | "rebalancing";
  currentPrice: string;
  binDistribution?: number[];
}

export default function PositionCard({
  poolPair,
  rangeMin,
  rangeMax,
  liquidity,
  feesEarned,
  status,
  currentPrice,
  binDistribution = [2, 5, 8, 15, 25, 35, 28, 18, 10, 5, 3],
}: PositionCardProps) {
  const [expanded, setExpanded] = useState(false);

  const statusConfig = {
    "in-range": { label: "In Range", color: "bg-chart-3", textColor: "text-chart-3" },
    "out-of-range": { label: "Out of Range", color: "bg-chart-5", textColor: "text-chart-5" },
    "rebalancing": { label: "Rebalancing", color: "bg-chart-4", textColor: "text-chart-4" },
  };

  const chartData = {
    labels: binDistribution.map((_, i) => `${i}`),
    datasets: [
      {
        label: "Liquidity Distribution",
        data: binDistribution,
        borderColor: "hsl(var(--chart-2))",
        backgroundColor: "hsla(var(--chart-2), 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "hsl(var(--popover))",
        titleColor: "hsl(var(--popover-foreground))",
        bodyColor: "hsl(var(--popover-foreground))",
        borderColor: "hsl(var(--popover-border))",
        borderWidth: 1,
      },
    },
    scales: {
      x: { display: false },
      y: { display: false },
    },
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold" data-testid={`position-${poolPair.toLowerCase().replace(/\s+/g, '-')}`}>
                {poolPair}
              </h3>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${statusConfig[status].color} ${status === 'rebalancing' ? 'animate-pulse' : ''}`} />
                <span className={`text-xs ${statusConfig[status].textColor}`}>
                  {statusConfig[status].label}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Range:</span>
                <span className="ml-2 font-mono">{rangeMin} - {rangeMax}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Current Price:</span>
                <span className="ml-2 font-mono">{currentPrice}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Liquidity:</span>
                <span className="ml-2 font-semibold">{liquidity}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Fees Earned:</span>
                <span className="ml-2 font-semibold text-chart-3">{feesEarned}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => console.log(`Rebalancing ${poolPair}`)}
              data-testid="button-rebalance"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => console.log(`Removing liquidity from ${poolPair}`)}
              data-testid="button-remove"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setExpanded(!expanded)}
              data-testid="button-expand"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {expanded && (
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Bin Distribution</span>
            </div>
            <div className="h-32">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
