"use client"

import { useState } from "react"
import useSWR from "swr"
import { useWallet } from "@solana/wallet-adapter-react"
import { PortfolioStats } from "../components/portfolio-stats"
import { PositionList } from "../components/position-list"
import { VolatilityChart } from "../components/volatility-chart"
import { TelegramBotPanel } from "../components/telegram-bot-panel"
import { SarosLogo } from "../components/saros-logo"
import { WalletButton } from "../components/wallet-button"
import { ThemeToggle } from "../components/theme-toggle"
import { Card, CardContent } from "../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Activity, TrendingUp, Wallet, Settings, BarChart3, AlertCircle } from "lucide-react"
import Link from "next/link"

// SWR fetcher function
const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function DashboardPage() {
  const { connected, publicKey } = useWallet()
  const [selectedPool, setSelectedPool] = useState<string | null>(null)

  // Fetch positions using SWR - only when wallet is connected
  const { data: positionsData, error: positionsError } = useSWR(
    connected && publicKey ? `/api/positions?wallet=${publicKey.toBase58()}` : null,
    fetcher,
    {
      refreshInterval: 10000, // Refresh every 10 seconds
      revalidateOnFocus: true,
    },
  )

  // Fetch volatility data for selected pool
  const { data: volatilityData } = useSWR(selectedPool ? `/api/volatility?pool=${selectedPool}` : null, fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
  })

  const positions = positionsData?.positions || []
  const stats = positionsData?.stats || {
    totalValue: 0,
    totalFees: 0,
    avgApy: 0,
    activePositions: 0,
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <SarosLogo className="h-8 w-8" />
            <div>
              <h1 className="text-lg font-bold">Saros DLMM</h1>
              <p className="text-xs text-muted-foreground">Auto Rebalancer</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Dashboard
            </Link>
            <Link
              href="/pools"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Pools
            </Link>
            <Link
              href="/analytics"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Analytics
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <WalletButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 sm:py-8 lg:px-8">
        {!connected ? (
          // Wallet not connected state
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="rounded-full bg-primary/10 p-6 mb-6">
              <Wallet className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Connect your Solana wallet to view and manage your DLMM liquidity positions with automated rebalancing.
            </p>
            <WalletButton />
            <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span>Devnet mode - Safe for testing</span>
            </div>
          </div>
        ) : (
          <>
            {/* Portfolio Stats */}
            <div className="mb-6">
              <PortfolioStats stats={stats} />
            </div>

            {/* Main Dashboard Tabs */}
            <Tabs defaultValue="positions" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
                <TabsTrigger value="positions" className="gap-2">
                  <Activity className="h-4 w-4" />
                  <span className="hidden sm:inline">Positions</span>
                </TabsTrigger>
                <TabsTrigger value="volatility" className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="hidden sm:inline">Volatility</span>
                </TabsTrigger>
                <TabsTrigger value="bot" className="gap-2">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Bot</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="positions" className="space-y-4">
                <PositionList
                  positions={positions}
                  onSelectPosition={setSelectedPool}
                  isLoading={!positionsData && !positionsError}
                />
              </TabsContent>

              <TabsContent value="volatility" className="space-y-4">
                {selectedPool && volatilityData ? (
                  <VolatilityChart data={volatilityData} />
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground text-center">Select a position to view volatility analysis</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="bot" className="space-y-4">
                <TelegramBotPanel />
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  )
}
