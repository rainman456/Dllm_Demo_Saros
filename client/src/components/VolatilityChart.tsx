import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
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

interface VolatilityChartProps {
  poolPair: string;
}

export default function VolatilityChart({ poolPair }: VolatilityChartProps) {
  const { data } = useQuery({
    queryKey: [`/api/volatility/${poolPair}`],
    refetchInterval: 60000,
  });

  const volatilityData = data?.volatilityData || [5.2, 6.8, 4.5, 8.2, 12.5, 9.8, 7.3, 10.2, 8.9, 11.5, 9.2, 7.8];
  const labels = data?.labels || ["12h", "11h", "10h", "9h", "8h", "7h", "6h", "5h", "4h", "3h", "2h", "1h"];

  const chartData = {
    labels,
    datasets: [
      {
        label: "Volatility %",
        data: volatilityData,
        borderColor: "hsl(var(--chart-4))",
        backgroundColor: "hsla(var(--chart-4), 0.15)",
        fill: true,
        tension: 0.4,
        borderWidth: 2,
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
        callbacks: {
          label: (context: any) => `Volatility: ${context.parsed.y}%`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: "hsla(var(--border), 0.3)" },
        ticks: { color: "hsl(var(--muted-foreground))" },
      },
      y: {
        grid: { color: "hsla(var(--border), 0.3)" },
        ticks: {
          color: "hsl(var(--muted-foreground))",
          callback: (value: any) => `${value}%`,
        },
      },
    },
  };

  const currentVolatility = volatilityData[volatilityData.length - 1];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold" data-testid={`volatility-${poolPair.toLowerCase().replace(/\//g, '-')}`}>
            {poolPair} Volatility
          </h3>
          <p className="text-sm text-muted-foreground">Last 12 hours</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-chart-4">
            <TrendingUp className="w-4 h-4" />
            <span className="text-2xl font-semibold">{currentVolatility}%</span>
          </div>
          <p className="text-xs text-muted-foreground">Current volatility</p>
        </div>
      </div>
      <div className="h-64">
        <Line data={chartData} options={chartOptions} />
      </div>
    </Card>
  );
}
