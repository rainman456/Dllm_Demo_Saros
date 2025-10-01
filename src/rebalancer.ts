import type { Connection, Keypair } from "@solana/web3.js"
import { DLMMService } from "./services/dlmm.service"
import { VolatilityService } from "./services/volatility.service"
import { TelegramService } from "./services/telegram.service"
import { config, getConnection, validateConfig } from "./config"
import { getWallet, getWalletPublicKey } from "./utils/wallet"
import type { Position, RebalanceAction } from "./types"

/**
 * Automated Rebalancer - Monitors positions and rebalances when out of range
 * Uses volatility-adjusted ranges for optimal capital efficiency
 */
export class AutomatedRebalancer {
  private connection: Connection
  private wallet: Keypair
  private walletAddress: string
  private dlmmService: DLMMService
  private volatilityService: VolatilityService
  private telegramService: TelegramService
  private isRunning = false
  private checkInterval: NodeJS.Timeout | null = null

  constructor() {
    this.connection = getConnection()
    this.wallet = getWallet()
    this.walletAddress = getWalletPublicKey()
    this.dlmmService = new DLMMService(this.connection)
    this.volatilityService = new VolatilityService(this.connection)
    this.telegramService = new TelegramService()
  }

  /**
   * Start the automated rebalancer
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.warn("[v0] Rebalancer is already running")
      return
    }

    console.log("[v0] Starting automated rebalancer...")
    this.isRunning = true

    // Send startup notification
    await this.telegramService.sendMessage("🤖 Automated rebalancer started. Monitoring positions...")

    // Run initial check
    await this.checkAndRebalance()

    // Schedule periodic checks (convert minutes to milliseconds)
    this.checkInterval = setInterval(
      () => {
        this.checkAndRebalance().catch((error) => {
          console.error("[v0] Error in rebalance check:", error)
        })
      },
      config.rebalancer.intervalMinutes * 60 * 1000,
    )

    console.log("[v0] Automated rebalancer started successfully")
  }

  /**
   * Stop the automated rebalancer
   */
  stop(): void {
    if (!this.isRunning) {
      console.warn("[v0] Rebalancer is not running")
      return
    }

    console.log("[v0] Stopping automated rebalancer...")
    this.isRunning = false

    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }

    console.log("[v0] Automated rebalancer stopped")
  }

  /**
   * Check all positions and rebalance if necessary
   */
  private async checkAndRebalance(): Promise<void> {
    try {
      console.log("[v0] Checking positions for rebalancing...")

      // Get all user positions
      const positions = await this.dlmmService.getUserPositions(this.walletAddress)

      if (positions.length === 0) {
        console.log("[v0] No positions to monitor")
        return
      }

      console.log(`[v0] Found ${positions.length} positions to monitor`)

      // Check each position
      for (const position of positions) {
        await this.checkPosition(position)
      }
    } catch (error) {
      console.error("[v0] Failed to check and rebalance positions:", error)
    }
  }

  /**
   * Check a single position and rebalance if needed
   */
  private async checkPosition(position: Position): Promise<void> {
    try {
      const poolConfig = await this.dlmmService.getPoolConfig(position.poolAddress)
      if (!poolConfig) {
        console.error(`[v0] Failed to get pool config for ${position.poolAddress}`)
        return
      }

      const activeBin = await this.dlmmService.getActiveBin(position.poolAddress)

      // Check if position is out of range
      const outOfRangeThreshold = config.rebalancer.outOfRangeThreshold
      const rangeSize = position.upperBin - position.lowerBin
      const distanceFromLower = activeBin - position.lowerBin
      const distanceFromUpper = position.upperBin - activeBin

      const isOutOfRange =
        distanceFromLower < rangeSize * outOfRangeThreshold || distanceFromUpper < rangeSize * outOfRangeThreshold

      if (isOutOfRange) {
        console.warn(`[v0] Position ${position.positionId} is out of range`)
        await this.telegramService.sendMessage(
          `⚠️ Position out of range!\nPool: ${position.tokenX}/${position.tokenY}\nCurrent bin: ${activeBin}\nRange: [${position.lowerBin}, ${position.upperBin}]`,
        )

        // Calculate new optimal range
        const binRange = 50
        const binIds = Array.from({ length: binRange * 2 + 1 }, (_, i) => activeBin - binRange + i)
        const binPrices = await this.dlmmService.getBinData(position.poolAddress, binIds)
        const volatility = await this.volatilityService.getVolatility(position.poolAddress, binPrices)
        const rangeWidth = this.volatilityService.getRecommendedRangeWidth(volatility)

        const currentPrice = this.dlmmService.calculateBinPrice(activeBin, poolConfig.binStep)
        const optimalRange = this.volatilityService.calculateOptimalBinRange(
          currentPrice,
          rangeWidth,
          poolConfig.binStep,
        )

        // Rebalance position
        const success = await this.dlmmService.rebalancePosition(
          position.positionId,
          optimalRange.lowerBin,
          optimalRange.upperBin,
        )

        if (success) {
          const action: RebalanceAction = {
            positionId: position.positionId,
            poolAddress: position.poolAddress,
            action: "rebalance",
            reason: "Position out of optimal range",
            oldRange: {
              lower: position.lowerBin,
              upper: position.upperBin,
            },
            newRange: {
              lower: optimalRange.lowerBin,
              upper: optimalRange.upperBin,
            },
            timestamp: Date.now(),
          }

          await this.telegramService.sendMessage(
            `✅ Position rebalanced!\nPool: ${position.tokenX}/${position.tokenY}\nOld range: [${action.oldRange.lower}, ${action.oldRange.upper}]\nNew range: [${action.newRange?.lower}, ${action.newRange?.upper}]`,
          )
        }
      } else {
        console.log(`[v0] Position ${position.positionId} is in range`)
      }

      // Check stop-loss
      if (config.rebalancer.stopLossEnabled) {
        const currentPrice = this.dlmmService.calculateBinPrice(activeBin, poolConfig.binStep)
        const lowerPrice = this.dlmmService.calculateBinPrice(position.lowerBin, poolConfig.binStep)

        const priceDropPercentage = ((lowerPrice - currentPrice) / lowerPrice) * 100

        if (priceDropPercentage > config.rebalancer.stopLossThreshold * 100) {
          console.warn(`[v0] Stop-loss triggered for position ${position.positionId}`)
          await this.telegramService.sendMessage(
            `🛑 Stop-loss triggered!\nPool: ${position.tokenX}/${position.tokenY}\nPrice drop: ${priceDropPercentage.toFixed(2)}%`,
          )

          const closed = await this.dlmmService.closePosition(position.positionId)
          if (closed) {
            console.log(`[v0] Position ${position.positionId} closed due to stop-loss`)
          }
        }
      }
    } catch (error) {
      console.error(`[v0] Failed to check position ${position.positionId}:`, error)
    }
  }
}

// Main execution
async function main() {
  try {
    validateConfig()

    const rebalancer = new AutomatedRebalancer()
    await rebalancer.start()

    // Graceful shutdown
    process.on("SIGINT", () => {
      console.log("[v0] Received SIGINT, shutting down...")
      rebalancer.stop()
      process.exit(0)
    })

    process.on("SIGTERM", () => {
      console.log("[v0] Received SIGTERM, shutting down...")
      rebalancer.stop()
      process.exit(0)
    })
  } catch (error) {
    console.error("[v0] Fatal error in rebalancer:", error)
    process.exit(1)
  }
}

// Run if executed directly
if (require.main === module) {
  main()
}
