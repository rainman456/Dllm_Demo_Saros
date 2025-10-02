import { useQuery } from "@tanstack/react-query";
import DashboardStats from "@/components/DashboardStats";
import PositionCard from "@/components/PositionCard";
import TelegramBot from "@/components/TelegramBot";
import VolatilityChart from "@/components/VolatilityChart";
import RebalancingActivity from "@/components/RebalancingActivity";
import StrategySimulator from "@/components/StrategySimulator";
import WalletConnect from "@/components/WalletConnect";
import ThemeToggle from "@/components/ThemeToggle";
import { LayoutDashboard, TrendingUp, Zap, Settings } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";

const MOCK_WALLET = "7xKXYZ123456789abcdefghijklmnopqrstuvwxyz9mPq";

export default function Dashboard() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { path: "/analytics", label: "Analytics", icon: <TrendingUp className="w-4 h-4" /> },
    { path: "/simulator", label: "Simulator", icon: <Zap className="w-4 h-4" /> },
    { path: "/settings", label: "Settings", icon: <Settings className="w-4 h-4" /> },
  ];

  const { data: stats } = useQuery({
    queryKey: [`/api/stats/${MOCK_WALLET}`],
    refetchInterval: 30000,
  });

  const { data: positions } = useQuery({
    queryKey: [`/api/positions/${MOCK_WALLET}`],
    refetchInterval: 30000,
  });

  const { data: events } = useQuery({
    queryKey: ["/api/events"],
    refetchInterval: 15000,
  });

  const { data: alerts } = useQuery({
    queryKey: ["/api/alerts"],
    refetchInterval: 10000,
  });

  const formattedEvents = events?.slice(0, 4).map((event: any) => ({
    id: event.id,
    type: event.type,
    poolPair: event.poolPair,
    message: event.message,
    timestamp: new Date(event.timestamp).toLocaleString(),
  })) || [];

  const formattedAlerts = alerts?.slice(0, 3).map((alert: any) => ({
    id: alert.id,
    message: alert.message,
    time: new Date(alert.time).toLocaleTimeString(),
    type: alert.type,
  })) || [];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
                Saros DLMM
              </h1>
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => (
                  <Link key={item.path} href={item.path}>
                    <Button
                      variant={location === item.path ? "secondary" : "ghost"}
                      size="sm"
                      data-testid={`nav-${item.label.toLowerCase()}`}
                    >
                      {item.icon}
                      <span className="ml-2">{item.label}</span>
                    </Button>
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <WalletConnect isConnected={true} address="7xKX...9mPq" network="Devnet" />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Portfolio Overview</h2>
            <p className="text-muted-foreground">
              Automated liquidity management for your Saros DLMM positions
            </p>
          </div>

          <DashboardStats
            totalLiquidity={stats?.totalLiquidity || "$0.00"}
            totalFees={stats?.totalFees || "$0.00"}
            activePositions={stats?.activePositions || 0}
            avgAPY={stats?.avgAPY || "0%"}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-xl font-semibold">Active Positions</h3>
              {positions && positions.length > 0 ? (
                positions.map((pos: any) => (
                  <PositionCard
                    key={pos.id}
                    poolPair={pos.poolPair}
                    rangeMin={pos.rangeMin}
                    rangeMax={pos.rangeMax}
                    liquidity={`$${pos.liquidity}`}
                    feesEarned={`$${pos.feesEarned}`}
                    status={pos.status}
                    currentPrice={pos.currentPrice}
                    binDistribution={pos.binDistribution}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No active positions
                </div>
              )}
            </div>

            <div className="space-y-6">
              <TelegramBot
                botUsername="saros_dlmm_bot"
                botUrl="https://t.me/saros_dlmm_bot"
                isConnected={true}
                recentAlerts={formattedAlerts}
              />

              <RebalancingActivity events={formattedEvents} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <VolatilityChart poolPair="SOL/USDC" />
            <StrategySimulator />
          </div>
        </div>
      </main>
    </div>
  );
}
