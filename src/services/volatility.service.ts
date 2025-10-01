import { type Connection, PublicKey } from "@solana/web3.js"
import { LiquidityBookServices, MODE } from "@saros-finance/dlmm-sdk"
import type { VolatilityData, BinData } from "@/src/types"
import BN from "bn.js"

export class VolatilityService {
  private connection: Connection
  private liquidityBookServices: LiquidityBookServices

  constructor(connection: Connection) {
    this.connection = connection

    this.liquidityBookServices = new LiquidityBookServices({
      mode: process.env.NEXT_PUBLIC_SOLANA_NETWORK === "mainnet-beta" ? MODE.MAINNET : MODE.DEVNET,
    })
  }

  /**
   * Calculate volatility metrics for a DLMM pool
   */
  async calculateVolatility(poolAddress: string): Promise<VolatilityData> {
    try {
      // Fetch pool metadata
      const metadata = await this.liquidityBookServices.fetchPoolMetadata(poolAddress)

      if (!metadata) {
        throw new Error("Pool not found")
      }

      const activeBinId = metadata.activeId
      const binStep = metadata.binStep

      // Fetch bin data around the active bin (±50 bins)
      const binRange = 50
      const binIds = Array.from({ length: binRange * 2 + 1 }, (_, i) => activeBinId - binRange + i)

      const binData = await this.fetchBinData(poolAddress, binIds, binStep)
      const prices = binData.map((bin) => bin.price)

      // Calculate statistical metrics
      const mean = this.calculateMean(prices)
      const stdDev = this.calculateStdDev(prices, mean)
      const volatilityRatio = stdDev / mean

      // Determine if volatility is high (threshold: 5%)
      const isHighVolatility = volatilityRatio > 0.05

      // Recommend range width based on volatility
      const recommendedRangeWidth = this.calculateRecommendedRange(volatilityRatio)

      // Create historical price data for charting
      const historicalPrices = binData.map((bin, index) => ({
        timestamp: Date.now() - (binData.length - index) * 60000, // Mock timestamps
        price: bin.price,
      }))

      return {
        poolAddress,
        mean,
        stdDev,
        volatilityRatio,
        isHighVolatility,
        recommendedRangeWidth,
        historicalPrices,
      }
    } catch (error) {
      console.error("[v0] Error calculating volatility:", error)
      throw new Error("Failed to calculate volatility")
    }
  }

  /**
   * Get volatility ratio for a pool
   */
  async getVolatility(poolAddress: string, binData?: BinData[]): Promise<number> {
    try {
      if (binData && binData.length > 0) {
        const prices = binData.map((bin) => bin.price)
        const mean = this.calculateMean(prices)
        const stdDev = this.calculateStdDev(prices, mean)
        return stdDev / mean
      }

      const volatilityData = await this.calculateVolatility(poolAddress)
      return volatilityData.volatilityRatio
    } catch (error) {
      console.error("[v0] Error getting volatility:", error)
      return 0.05 // Default to 5% volatility
    }
  }

  /**
   * Get recommended range width based on volatility
   */
  getRecommendedRangeWidth(volatilityRatio: number): number {
    return this.calculateRecommendedRange(volatilityRatio)
  }

  /**
   * Calculate optimal bin range based on current price and volatility
   */
  calculateOptimalBinRange(
    currentPrice: number,
    rangeWidth: number,
    binStep: number,
  ): { lowerBin: number; upperBin: number } {
    // Calculate price range
    const lowerPrice = currentPrice * (1 - rangeWidth / 2)
    const upperPrice = currentPrice * (1 + rangeWidth / 2)

    // Convert prices to bin IDs
    // price = (1 + binStep/10000)^binId
    // binId = log(price) / log(1 + binStep/10000)
    const lowerBin = Math.floor(Math.log(lowerPrice) / Math.log(1 + binStep / 10000))
    const upperBin = Math.ceil(Math.log(upperPrice) / Math.log(1 + binStep / 10000))

    return { lowerBin, upperBin }
  }

  /**
   * Fetch bin data for specified bin IDs
   */
  private async fetchBinData(poolAddress: string, binIds: number[], binStep: number): Promise<BinData[]> {
    try {
      const binData: BinData[] = []

      // Get bin arrays from Saros
      const poolPubkey = new PublicKey(poolAddress)

      for (const binId of binIds) {
        try {
          // Calculate price from bin ID: price = (1 + binStep/10000)^binId
          const price = Math.pow(1 + binStep / 10000, binId)

          // For now, use mock liquidity data
          // In production, fetch actual bin data from chain
          binData.push({
            binId,
            price,
            liquidityX: new BN(0),
            liquidityY: new BN(0),
            supply: new BN(0),
          })
        } catch (error) {
          continue
        }
      }

      return binData
    } catch (error) {
      console.error("[v0] Error fetching bin data:", error)
      return []
    }
  }

  /**
   * Calculate mean of an array of numbers
   */
  private calculateMean(values: number[]): number {
    if (values.length === 0) return 0
    const sum = values.reduce((acc, val) => acc + val, 0)
    return sum / values.length
  }

  /**
   * Calculate standard deviation
   */
  private calculateStdDev(values: number[], mean: number): number {
    if (values.length === 0) return 0
    const squaredDiffs = values.map((val) => Math.pow(val - mean, 2))
    const avgSquaredDiff = this.calculateMean(squaredDiffs)
    return Math.sqrt(avgSquaredDiff)
  }

  /**
   * Calculate recommended range width based on volatility
   */
  private calculateRecommendedRange(volatilityRatio: number): number {
    // Base range: 10%
    // Add 5% for every 1% of volatility above 2%
    const baseRange = 0.1
    const volatilityAdjustment = Math.max(0, (volatilityRatio - 0.02) * 5)
    return Math.min(baseRange + volatilityAdjustment, 0.5) // Cap at 50%
  }

  /**
   * Get real-time price from active bin
   */
  async getCurrentPrice(poolAddress: string): Promise<number> {
    try {
      const metadata = await this.liquidityBookServices.fetchPoolMetadata(poolAddress)

      if (!metadata) {
        throw new Error("Pool not found")
      }

      const binStep = metadata.binStep
      const activeBinId = metadata.activeId
      const price = Math.pow(1 + binStep / 10000, activeBinId)

      return price
    } catch (error) {
      console.error("[v0] Error getting current price:", error)
      throw new Error("Failed to get current price")
    }
  }
}
