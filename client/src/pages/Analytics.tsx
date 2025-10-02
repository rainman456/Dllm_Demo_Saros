import { useWallet } from "@solana/wallet-adapter-react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Line } from "react-chartjs-2"
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
} from "chart.js"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

export default function Analytics() {
  const { connected } = useWallet()

  const { data: volatilityData } = useQuery({
    queryKey: ["/api/volatility/SOL/USDC"],
    enabled: connected,
    refetchInterval: 60000,
  })

  const chartData = {
    labels: volatilityData?.labels || [],
    datasets: [
      {
        label: "Volatility %",
        data: volatilityData?.volatilityData || [],
        borderColor: "rgb(99, 102, 241)",
        backgroundColor: "rgba(99, 102, 241, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  }

  if (!connected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Connect your wallet to view analytics</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">Analytics</h2>
          <p className="text-muted-foreground">Market volatility and position performance metrics</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>SOL/USDC Volatility</CardTitle>
            <CardDescription>12-hour rolling volatility percentage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <Line data={chartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
