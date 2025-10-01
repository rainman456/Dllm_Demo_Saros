import { Logger } from "../utils/logger";
import type { VolatilityMetrics } from "../types"


// export interface VolatilityMetrics {
//   mean: number;
//   stdDev: number;
//   volatilityRatio: number;
//   historicalPrices: Array<{ timestamp: number; price: number }>;
// }

/**
 * Volatility Service - Calculates market volatility for optimal range sizing
 * Uses bin price data to determine position range width
 */
export class VolatilityService {
  private readonly HIGH_VOLATILITY_THRESHOLD = 0.05; // 5%
  private readonly LOW_VOLATILITY_THRESHOLD = 0.02; // 2%


  /**
   * Calculate volatility from bin data
   */
 calculateVolatility(binData: Array<{ binId: number; price: number; liquidity: number }>): VolatilityMetrics {
    try {
      if (binData.length < 2) {
        return {
          mean: 0,
          stdDev: 0,
          volatilityRatio: 0,
          averageSpread: 0,
          liquidityConcentration: 0,
          recommendedRangeWidth: 0.1, // Default 10% range
        }
      }

      // Calculate price volatility (standard deviation)
      const prices = binData.map((b) => b.price)
      const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length
      const variance = prices.reduce((sum, p) => sum + Math.pow(p - avgPrice, 2), 0) / prices.length
      const stdDev = Math.sqrt(variance)
      const volatilityRatio = stdDev / avgPrice

      // Calculate average spread between bins
      const spreads = binData.slice(1).map((bin, i) => Math.abs(bin.price - binData[i].price))
      const averageSpread = spreads.reduce((sum, s) => sum + s, 0) / spreads.length

      // Calculate liquidity concentration (Herfindahl index)
      const totalLiquidity = binData.reduce((sum, b) => sum + b.liquidity, 0)
      const liquidityShares = binData.map((b) => b.liquidity / totalLiquidity)
      const liquidityConcentration = liquidityShares.reduce((sum, share) => sum + share * share, 0)

      // Recommend range width based on volatility
      // Higher volatility = wider range to reduce rebalancing frequency
      const baseRange = 0.1 // 10% base range
      const volatilityMultiplier = 1 + volatilityRatio * 5 // Scale up to 5x for high volatility
      const recommendedRangeWidth = Math.min(baseRange * volatilityMultiplier, 0.5) // Cap at 50%

      return {
        mean: avgPrice,
        stdDev,
        volatilityRatio,
        averageSpread,
        liquidityConcentration,
        recommendedRangeWidth,
      }
    } catch (error) {
      Logger.error("Failed to calculate volatility", error)
      return {
        mean: 0,
        stdDev: 0,
        volatilityRatio: 0,
        averageSpread: 0,
        liquidityConcentration: 0,
        recommendedRangeWidth: 0.1,
      }
    }
  }

  
  /**
   * Get recommended range width based on volatility metrics
   */
  getRecommendedRangeWidth(volatility: VolatilityMetrics): number {
    return volatility.recommendedRangeWidth
  }

  /**
   * Calculate optimal bin range for a given price and range width
   */
  calculateOptimalBinRange(
    currentPrice: number,
    rangeWidth: number,
    binStep: number,
  ): { lowerBin: number; upperBin: number } {
    const lowerPrice = currentPrice * (1 - rangeWidth / 2)
    const upperPrice = currentPrice * (1 + rangeWidth / 2)

    // Convert prices to bin IDs
    const lowerBin = Math.floor(Math.log(lowerPrice) / Math.log(1 + binStep / 10000))
    const upperBin = Math.ceil(Math.log(upperPrice) / Math.log(1 + binStep / 10000))

    return { lowerBin, upperBin }
  }

  /**
   * Get volatility for a specific pool
   */
  async getVolatility(
    poolAddress: string,
    binData: Array<{ binId: number; price: number; liquidity: number }>,
  ): Promise<VolatilityMetrics> {
    return this.calculateVolatility(binData)
  }

  /**
   * Calculate volatility from an array of prices
   * This is a convenience method that converts number[] to the required format
   */
  calculateVolatilityFromPrices(prices: number[]): VolatilityMetrics {
    try {
      if (prices.length < 2) {
        return {
          mean: 0,
          stdDev: 0,
          volatilityRatio: 0,
          averageSpread: 0,
          liquidityConcentration: 0,
          recommendedRangeWidth: 0.1, // Default 10% range
        }
      }

      // Convert prices to bin data format with equal liquidity distribution
      const binData = prices.map((price, index) => ({
        binId: index,
        price,
        liquidity: 1, // Equal weight for all bins when only prices are provided
      }))

      return this.calculateVolatility(binData)
    } catch (error) {
      Logger.error("Failed to calculate volatility from prices", error)
      return {
        mean: 0,
        stdDev: 0,
        volatilityRatio: 0,
        averageSpread: 0,
        liquidityConcentration: 0,
        recommendedRangeWidth: 0.1,
      }
    }
  }


  // /**
  //  * Calculate volatility metrics from bin price data
  //  * @param poolAddress - Pool address
  //  * @param binPrices - Array of historical bin prices
  //  */
  // async getVolatility(
  //   poolAddress: string,
  //   binPrices: number[]
  // ): Promise<VolatilityMetrics> {
  //   try {
  //     if (binPrices.length < 2) {
  //       throw new Error("Insufficient price data for volatility calculation");
  //     }

  //     // Calculate mean price
  //     const mean =
  //       binPrices.reduce((sum, price) => sum + price, 0) / binPrices.length;

  //     // Calculate standard deviation
  //     const squaredDiffs = binPrices.map((price) => Math.pow(price - mean, 2));
  //     const variance =
  //       squaredDiffs.reduce((sum, diff) => sum + diff, 0) / binPrices.length;
  //     const stdDev = Math.sqrt(variance);

  //     // Calculate volatility ratio (coefficient of variation)
  //     const volatilityRatio = stdDev / mean;

  //     // Format historical prices for charting
  //     const historicalPrices = binPrices.map((price, index) => ({
  //       timestamp: Date.now() - (binPrices.length - index) * 60000, // 1 minute intervals
  //       price,
  //     }));

  //     Logger.info(`Volatility calculated for ${poolAddress}`, {
  //       mean: mean.toFixed(2),
  //       stdDev: stdDev.toFixed(2),
  //       volatilityRatio: (volatilityRatio * 100).toFixed(2) + "%",
  //     });

  //     return {
  //       mean,
  //       stdDev,
  //       volatilityRatio,
  //       historicalPrices,
  //     };
  //   } catch (error) {
  //     Logger.error("Failed to calculate volatility", error);
  //     throw error;
  //   }
  // }

  /**
   * Determine if volatility is high
   * @param metrics - Volatility metrics
   */
  isHighVolatility(metrics: VolatilityMetrics): boolean {
    return metrics.volatilityRatio > this.HIGH_VOLATILITY_THRESHOLD;
  }

  /**
   * Determine if volatility is low
   * @param metrics - Volatility metrics
   */
  isLowVolatility(metrics: VolatilityMetrics): boolean {
    return metrics.volatilityRatio < this.LOW_VOLATILITY_THRESHOLD;
  }

  /**
   * Get recommended range width based on volatility
   * Higher volatility = wider range to reduce rebalancing frequency
   * Lower volatility = tighter range for better capital efficiency
   * @param metrics - Volatility metrics
   */
  // getRecommendedRangeWidth(metrics: VolatilityMetrics): number {
  //   const { volatilityRatio } = metrics;

  //   // Base range width: 10%
  //   const baseWidth = 0.1;

  //   // Adjust based on volatility
  //   // High volatility: increase range width up to 30%
  //   // Low volatility: decrease range width down to 5%
  //   if (volatilityRatio > this.HIGH_VOLATILITY_THRESHOLD) {
  //     // High volatility: wider range
  //     const multiplier =
  //       1 + (volatilityRatio - this.HIGH_VOLATILITY_THRESHOLD) * 10;
  //     return Math.min(baseWidth * multiplier, 0.3); // Cap at 30%
  //   } else if (volatilityRatio < this.LOW_VOLATILITY_THRESHOLD) {
  //     // Low volatility: tighter range
  //     const multiplier = volatilityRatio / this.LOW_VOLATILITY_THRESHOLD;
  //     return Math.max(baseWidth * multiplier, 0.05); // Floor at 5%
  //   }

  //   // Medium volatility: use base width
  //   return baseWidth;
  // }

  /**
   * Calculate optimal bin range around current price
   * @param currentPrice - Current market price
   * @param rangeWidth - Range width as percentage (e.g., 0.1 for 10%)
   * @param binStep - Bin step in basis points
   */
  // calculateOptimalBinRange(
  //   currentPrice: number,
  //   rangeWidth: number,
  //   binStep: number
  // ): {
  //   lowerBin: number;
  //   upperBin: number;
  //   lowerPrice: number;
  //   upperPrice: number;
  // } {
  //   // Calculate price bounds
  //   const lowerPrice = currentPrice * (1 - rangeWidth / 2);
  //   const upperPrice = currentPrice * (1 + rangeWidth / 2);

  //   // Convert to bin IDs
  //   const lowerBin = this.priceToBinId(lowerPrice, binStep);
  //   const upperBin = this.priceToBinId(upperPrice, binStep);

  //   return {
  //     lowerBin,
  //     upperBin,
  //     lowerPrice,
  //     upperPrice,
  //   };
  // }

  /**
   * Convert price to bin ID
   * Formula: binId = log(price) / log(1 + binStep / 10000)
   */
  private priceToBinId(price: number, binStep: number): number {
    return Math.floor(Math.log(price) / Math.log(1 + binStep / 10000));
  }

  /**
   * Convert bin ID to price
   * Formula: price = (1 + binStep / 10000) ^ binId
   */
  private binIdToPrice(binId: number, binStep: number): number {
    return Math.pow(1 + binStep / 10000, binId);
  }
}
