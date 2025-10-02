import { getDLMMClient } from "../solana/dlmm-client"
import { storage } from "../storage"
import type { Position } from "../../shared/schema"

interface VolatilityMetrics {
  poolAddress: string
  currentVolatility: number
  volatilityTrend: "increasing" | "decreasing" | "stable"
  riskLevel: "low" | "medium" | "high"
  lastUpdated: Date
  historicalData: Array<{
    timestamp: Date
    volatility: number
  }>
}

class VolatilityTracker {
  private metrics: Map<string, VolatilityMetrics> = new Map()
  private updateInterval: NodeJS.Timeout | null = null

  async start() {
    console.log("[VolatilityTracker] Starting volatility tracking service...")

    // Initial update
    await this.updateAllMetrics()

    // Update every 5 minutes
    this.updateInterval = setInterval(
      () => {
        this.updateAllMetrics().catch((err) => {
          console.error("[VolatilityTracker] Error updating metrics:", err)
        })
      },
      5 * 60 * 1000,
    )

    console.log("[VolatilityTracker] Service started successfully")
  }

  stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
    console.log("[VolatilityTracker] Service stopped")
  }

  async updateAllMetrics() {
    try {
      const positions = await storage.getPositions()
      const uniquePools = [...new Set(positions.map((p) => p.poolAddress))]

      for (const poolAddress of uniquePools) {
        await this.updatePoolMetrics(poolAddress)
      }
    } catch (error) {
      console.error("[VolatilityTracker] Error updating all metrics:", error)
      throw error
    }
  }

  async updatePoolMetrics(poolAddress: string) {
    try {
      const dlmmClient = getDLMMClient()

      // Check if pool address is valid and not empty
      if (!poolAddress || poolAddress.trim() === "") {
        console.warn("[VolatilityTracker] Skipping empty pool address")
        return
      }

      const activeBin = await dlmmClient.getActiveBin(poolAddress)
      const bins = await dlmmClient.getBinArrays(poolAddress, activeBin - 50, activeBin + 50)
      const volatility = await dlmmClient.calculateVolatility(bins)

      const existing = this.metrics.get(poolAddress)
      const historicalData = existing?.historicalData || []

      // Keep last 24 hours of data (288 data points at 5-min intervals)
      historicalData.push({
        timestamp: new Date(),
        volatility,
      })

      if (historicalData.length > 288) {
        historicalData.shift()
      }

      // Calculate trend
      const trend = this.calculateTrend(historicalData)
      const riskLevel = this.calculateRiskLevel(volatility)

      const metrics: VolatilityMetrics = {
        poolAddress,
        currentVolatility: volatility,
        volatilityTrend: trend,
        riskLevel,
        lastUpdated: new Date(),
        historicalData,
      }

      this.metrics.set(poolAddress, metrics)

      console.log(
        `[VolatilityTracker] Updated metrics for pool ${poolAddress.slice(0, 8)}... - Volatility: ${volatility.toFixed(4)}, Risk: ${riskLevel}`,
      )
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)

      if (errorMessage.includes("not found")) {
        console.error(
          `[VolatilityTracker] Pool ${poolAddress} not found. ` +
            `This pool may not exist on ${process.env.SOLANA_NETWORK || "devnet"}. ` +
            `Please verify the pool address or switch networks.`,
        )
      } else {
        console.error(`[VolatilityTracker] Error updating pool ${poolAddress}:`, error)
      }
    }
  }

  private calculateTrend(
    historicalData: Array<{ timestamp: Date; volatility: number }>,
  ): "increasing" | "decreasing" | "stable" {
    if (historicalData.length < 10) return "stable"

    const recent = historicalData.slice(-10)
    const older = historicalData.slice(-20, -10)

    if (older.length === 0) return "stable"

    const recentAvg = recent.reduce((sum, d) => sum + d.volatility, 0) / recent.length
    const olderAvg = older.reduce((sum, d) => sum + d.volatility, 0) / older.length

    const change = (recentAvg - olderAvg) / olderAvg

    if (change > 0.1) return "increasing"
    if (change < -0.1) return "decreasing"
    return "stable"
  }

  private calculateRiskLevel(volatility: number): "low" | "medium" | "high" {
    if (volatility < 0.02) return "low"
    if (volatility < 0.05) return "medium"
    return "high"
  }

  getMetrics(poolAddress: string): VolatilityMetrics | undefined {
    return this.metrics.get(poolAddress)
  }

  getAllMetrics(): VolatilityMetrics[] {
    return Array.from(this.metrics.values())
  }

  async getPositionRisk(position: Position): Promise<{
    volatility: number
    riskLevel: "low" | "medium" | "high"
    trend: "increasing" | "decreasing" | "stable"
    recommendation: string
  }> {
    const metrics = this.metrics.get(position.poolAddress)

    if (!metrics) {
      // Fetch fresh data if not cached
      await this.updatePoolMetrics(position.poolAddress)
      const freshMetrics = this.metrics.get(position.poolAddress)

      if (!freshMetrics) {
        return {
          volatility: 0,
          riskLevel: "low",
          trend: "stable",
          recommendation: "Unable to calculate risk - insufficient data",
        }
      }

      return this.generateRiskReport(freshMetrics, position)
    }

    return this.generateRiskReport(metrics, position)
  }

  private generateRiskReport(metrics: VolatilityMetrics, position: Position) {
    let recommendation = ""

    if (metrics.riskLevel === "high" && metrics.volatilityTrend === "increasing") {
      recommendation =
        "High risk detected with increasing volatility. Consider widening range or reducing position size."
    } else if (metrics.riskLevel === "high") {
      recommendation = "High volatility detected. Monitor position closely and consider stop-loss protection."
    } else if (metrics.riskLevel === "medium" && metrics.volatilityTrend === "increasing") {
      recommendation = "Moderate risk with increasing volatility. Consider adjusting range parameters."
    } else if (metrics.riskLevel === "low" && metrics.volatilityTrend === "stable") {
      recommendation = "Low risk environment. Position is stable with current parameters."
    } else {
      recommendation = "Normal market conditions. Continue monitoring position."
    }

    return {
      volatility: metrics.currentVolatility,
      riskLevel: metrics.riskLevel,
      trend: metrics.volatilityTrend,
      recommendation,
    }
  }

  async getVolatilityHistory(poolAddress: string, hours = 24): Promise<Array<{ timestamp: Date; volatility: number }>> {
    const metrics = this.metrics.get(poolAddress)
    if (!metrics) return []

    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000)
    return metrics.historicalData.filter((d) => d.timestamp >= cutoffTime)
  }

  getVolatilityTrend(poolAddress: string): "increasing" | "decreasing" | "stable" | null {
    const metrics = this.metrics.get(poolAddress)
    if (!metrics) return null
    return metrics.volatilityTrend
  }

  async startTracking(poolAddresses: string[]) {
    const validPools = poolAddresses.filter((addr) => addr && addr.trim() !== "")

    if (validPools.length === 0) {
      console.log("[VolatilityTracker] No valid pools to track. Skipping pool monitoring.")
      console.log("[VolatilityTracker] Add pool addresses to MONITORED_POOLS in .env to enable tracking.")
      return
    }

    console.log(`[VolatilityTracker] Starting tracking for ${validPools.length} pools...`)

    // Initial update for all pools
    for (const poolAddress of validPools) {
      await this.updatePoolMetrics(poolAddress)
    }

    // Start the regular update service
    await this.start()
  }
}

export const volatilityTracker = new VolatilityTracker()
