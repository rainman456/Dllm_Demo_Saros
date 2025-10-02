import { getDLMMClient, type DLMMBinArray } from "../solana/dlmm-client"

export interface VolatilityMetrics {
  current: number
  average: number
  stdDev: number
  trend: "increasing" | "decreasing" | "stable"
  riskLevel: "low" | "medium" | "high" | "extreme"
}

export interface PriceRange {
  min: number
  max: number
  current: number
  percentile25: number
  percentile75: number
}

export class VolatilityAnalyzer {
  private historicalData: Map<string, number[]> = new Map()
  private readonly maxHistorySize = 100

  /**
   * Calculate comprehensive volatility metrics
   */
  async analyzeVolatility(poolAddress: string): Promise<VolatilityMetrics> {
    const dlmmClient = getDLMMClient()
    const activeBin = await dlmmClient.getActiveBin(poolAddress)
    const bins = await dlmmClient.getBinArrays(poolAddress, activeBin - 100, activeBin + 100)

    const currentVol = await dlmmClient.calculateVolatility(bins)

    // Store historical volatility
    const history = this.historicalData.get(poolAddress) || []
    history.push(currentVol)
    if (history.length > this.maxHistorySize) {
      history.shift()
    }
    this.historicalData.set(poolAddress, history)

    // Calculate metrics
    const average = history.reduce((a, b) => a + b, 0) / history.length
    const variance = history.reduce((a, b) => a + Math.pow(b - average, 2), 0) / history.length
    const stdDev = Math.sqrt(variance)

    // Determine trend
    let trend: "increasing" | "decreasing" | "stable" = "stable"
    if (history.length >= 10) {
      const recent = history.slice(-5).reduce((a, b) => a + b, 0) / 5
      const older = history.slice(-10, -5).reduce((a, b) => a + b, 0) / 5
      if (recent > older * 1.2) trend = "increasing"
      else if (recent < older * 0.8) trend = "decreasing"
    }

    // Determine risk level
    let riskLevel: "low" | "medium" | "high" | "extreme" = "low"
    if (currentVol > 20) riskLevel = "extreme"
    else if (currentVol > 15) riskLevel = "high"
    else if (currentVol > 10) riskLevel = "medium"

    return {
      current: currentVol,
      average,
      stdDev,
      trend,
      riskLevel,
    }
  }

  /**
   * Calculate optimal range based on volatility
   */
  calculateOptimalRange(activeBin: number, volatility: number): { lower: number; upper: number } {
    let rangeWidth: number

    if (volatility < 5) {
      rangeWidth = 30 // Very tight for stable markets
    } else if (volatility < 10) {
      rangeWidth = 60
    } else if (volatility < 15) {
      rangeWidth = 100
    } else if (volatility < 20) {
      rangeWidth = 150
    } else {
      rangeWidth = 200 // Very wide for extreme volatility
    }

    return {
      lower: activeBin - rangeWidth,
      upper: activeBin + rangeWidth,
    }
  }

  /**
   * Analyze price distribution
   */
  async analyzePriceRange(bins: DLMMBinArray[]): Promise<PriceRange> {
    const prices = bins.map((b) => Number.parseFloat(b.price.toString()) / 1e8).sort((a, b) => a - b)

    const min = prices[0]
    const max = prices[prices.length - 1]
    const current = prices[Math.floor(prices.length / 2)]

    const p25Index = Math.floor(prices.length * 0.25)
    const p75Index = Math.floor(prices.length * 0.75)

    return {
      min,
      max,
      current,
      percentile25: prices[p25Index],
      percentile75: prices[p75Index],
    }
  }

  /**
   * Calculate impermanent loss estimate
   */
  calculateImpermanentLoss(priceChange: number): number {
    // IL formula: 2 * sqrt(price_ratio) / (1 + price_ratio) - 1
    const ratio = 1 + priceChange / 100
    const il = (2 * Math.sqrt(ratio)) / (1 + ratio) - 1
    return Math.abs(il) * 100
  }

  /**
   * Estimate fee APY based on volatility and liquidity
   */
  estimateFeeAPY(volatility: number, liquidityDepth: number): number {
    // Higher volatility = more trading = more fees
    // Lower liquidity depth = higher fee share
    const baseAPY = 20 // Base APY for average conditions
    const volMultiplier = 1 + volatility / 10
    const liquidityFactor = Math.max(0.5, 1 / Math.log10(liquidityDepth + 10))

    return baseAPY * volMultiplier * liquidityFactor
  }
}

export const volatilityAnalyzer = new VolatilityAnalyzer()
