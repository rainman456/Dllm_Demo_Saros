import { useWallet } from "@solana/wallet-adapter-react"
import { useQuery } from "@tanstack/react-query"
import DashboardStats from "@/components/DashboardStats"
import PositionCard from "@/components/PositionCard"
import RebalancingActivity from "@/components/RebalancingActivity"
import WalletConnect from "@/components/WalletConnect"
import ThemeToggle from "@/components/ThemeToggle"
import { LayoutDashboard, TrendingUp, Zap, Settings, AlertCircle } from "lucide-react"
import { Link, useLocation } from "wouter"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useWalletPositions, usePositionStats } from "@/hooks/use-wallet-positions"
import { Skeleton } from "@/components/ui/skeleton"

export default function Dashboard() {
  const [location] = useLocation()
  const { connected, publicKey } = useWallet()

  const navItems = [
    { path: "/", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { path: "/analytics", label: "Analytics", icon: <TrendingUp className="w-4 h-4" /> },
    { path: "/simulator", label: "Simulator", icon: <Zap className="w-4 h-4" /> },
    { path: "/settings", label: "Settings", icon: <Settings className="w-4 h-4" /> },
  ]

  const { data: stats, isLoading: statsLoading } = usePositionStats()
  const { data: positions, isLoading: positionsLoading } = useWalletPositions()

  const { data: events } = useQuery({
    queryKey: ["/api/events"],
    refetchInterval: 15000,
    enabled: connected,
  })

  const formattedEvents =
    events?.slice(0, 4).map((event: any) => ({
      id: event.id,
      type: event.type,
      poolPair: event.poolPair,
      message: event.message,
      timestamp: new Date(event.timestamp).toLocaleString(),
    })) || []

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
                Saros DLMM Rebalancer
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
              <WalletConnect network="Devnet" />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!connected ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <AlertCircle className="w-16 h-16 text-muted-foreground" />
            <h2 className="text-2xl font-bold">Connect Your Wallet</h2>
            <p className="text-muted-foreground text-center max-w-md">
              Connect your Solana wallet to view and manage your DLMM positions with automated rebalancing.
            </p>
            <WalletConnect network="Devnet" />
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Portfolio Overview</h2>
              <p className="text-muted-foreground">
                Automated liquidity management for your Saros DLMM positions on Solana Devnet
              </p>
            </div>

            {statsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            ) : (
              <DashboardStats stats={stats} />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Active Positions</h3>
                  {positions && positions.length > 0 && (
                    <span className="text-sm text-muted-foreground">{positions.length} positions</span>
                  )}
                </div>

                {positionsLoading ? (
                  <div className="space-y-4">
                    {[...Array(2)].map((_, i) => (
                      <Skeleton key={i} className="h-64" />
                    ))}
                  </div>
                ) : positions && positions.length > 0 ? (
                  <div className="space-y-4">
                    {positions.map((position) => (
                      <PositionCard key={position.id} position={position} />
                    ))}
                  </div>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No active positions found. Create a position on Saros Finance to get started.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Recent Activity</h3>
                <RebalancingActivity events={formattedEvents} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
