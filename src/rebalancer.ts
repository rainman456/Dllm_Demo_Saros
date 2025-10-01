import type { Connection, Keypair } from "@solana/web3.js"
import { DLMMService } from "./services/dlmm.service"
import { VolatilityService } from "./services/volatility.service"
import { TelegramService } from "./services/telegram.service"
import { Logger } from "./utils/logger"
import { config, getConnection, validateConfig } from "./config"
import { getWallet } from "./utils/wallet"
import type { Position, RebalanceAction, VolatilityMetrics } from "./types"
import { StakeService } from "./services/stake.service"
import { CalculationUtils } from "./utils/calculations"

/**
 * Automated Rebalancer - Monitors positions and rebalances when out of range
 * Uses volatility-adjusted ranges for optimal capital efficiency
 */
export class AutomatedRebalancer {
  private connection: Connection
  private wallet: Keypair
  private dlmmService: DLMMService
  private volatilityService: VolatilityService
  private telegramService: TelegramService
  private stakeService: StakeService

  private isRunning = false
  private checkInterval: NodeJS.Timeout | null = null

  constructor() {
    this.connection = getConnection()
    this.wallet = getWallet()
    this.dlmmService = new DLMMService(this.connection, this.wallet)
    this.volatilityService = new VolatilityService()
    this.telegramService = new TelegramService()
    this.stakeService = new StakeService(this.connection,  this.wallet)
  }


  /**
   * Rebalance a position
   */
  // private async rebalancePosition(position: Position, volatility: VolatilityMetrics): Promise<void> {
  //   try {
  //     Logger.info(`Rebalancing position ${position.positionId}`)

  //     const isStaked = await this.stakeService.isStakingSupported(position.poolAddress)
  //     if (isStaked) {
  //       Logger.info("Unstaking position before rebalancing...")
  //       await this.stakeService.unstakePosition(position.poolAddress, position.positionId)

  //       // Claim any pending rewards
  //       await this.stakeService.claimRewards(position.poolAddress, position.positionId)
  //     }

  //     // Remove liquidity from current position
  //     const removeTx = await this.dlmmService.removeLiquidity(position.poolAddress, position.positionId, 100)

  //     Logger.info(`Liquidity removed: ${removeTx}`)

  //     // Calculate new optimal range based on volatility
  //     const rangeWidth = this.volatilityService.getRecommendedRangeWidth(volatility)
  //     const currentPrice = position.currentPrice
  //     const poolConfig = await this.dlmmService.getPoolConfig(position.poolAddress)

  //     if (!poolConfig) {
  //       throw new Error("Failed to get pool config")
  //     }

  //     const newLowerPrice = currentPrice * (1 - rangeWidth / 2)
  //     const newUpperPrice = currentPrice * (1 + rangeWidth / 2)

  //     const newLowerBin = CalculationUtils.priceToBinId(newLowerPrice, poolConfig.binStep)
  //     const newUpperBin = CalculationUtils.priceToBinId(newUpperPrice, poolConfig.binStep)

  //     // Add liquidity to new position
  //     const addTx = await this.dlmmService.addLiquidity(
  //       position.poolAddress,
  //       newLowerBin,
  //       newUpperBin,
  //       position.liquidityX,
  //       position.liquidityY,
  //     )

  //     Logger.success(`Position rebalanced successfully: ${addTx}`)

  //     if (isStaked) {
  //       Logger.info("Staking new position for hybrid yield boost...")
  //       const newPositionId = addTx // Simplified - actual position ID would be parsed from transaction
  //       await this.stakeService.stakePosition(position.poolAddress, newPositionId)
  //       Logger.success("Position staked successfully for additional farming rewards")
  //     }

  //     // Send Telegram notification
  //     await this.telegramService.sendMessage(
  //       `✅ Position rebalanced successfully!\n\n` +
  //         `Pool: ${position.tokenX}/${position.tokenY}\n` +
  //         `New Range: ${newLowerBin} - ${newUpperBin}\n` +
  //         `Volatility: ${(volatility.volatilityRatio * 100).toFixed(2)}%\n` +
  //         `${isStaked ? "🌾 Staked for farming rewards\n" : ""}` +
  //         `TX: ${addTx.slice(0, 8)}...`,
  //     )
  //   } catch (error) {
  //     Logger.error("Failed to rebalance position", error)
  //     await this.telegramService.sendMessage(
  //       `❌ Rebalancing failed: ${error instanceof Error ? error.message : "Unknown error"}`,
  //     )
  //   }
  // }

  /**
   * Start the automated rebalancer
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      Logger.warn("Rebalancer is already running")
      return
    }

    Logger.info("Starting automated rebalancer...")
    this.isRunning = true

    // Send startup notification
    await this.telegramService.sendMessage("Automated rebalancer started. Monitoring positions...")

    // Run initial check
    await this.checkAndRebalance()

    // Schedule periodic checks
  //   this.checkInterval = setInterval(() => {
  //     this.checkAndRebalance().catch((error) => {
  //       Logger.error("Error in rebalance check", error)
  //     })
  //   }, config.rebalancer.checkInterval * 1000)

  //   Logger.success("Automated rebalancer started successfully")
  // }

    const intervalMs = config.rebalancer.intervalMinutes * 60 * 1000
    this.checkInterval = setInterval(() => {
      this.checkAndRebalance()
    }, intervalMs)

    Logger.success(`Rebalancer started with ${config.rebalancer.intervalMinutes}min interval`)
  }


  /**
   * Stop the automated rebalancer
   */
  stop(): void {
    if (!this.isRunning) {
      Logger.warn("Rebalancer is not running")
      return
    }

    Logger.info("Stopping automated rebalancer...")
    this.isRunning = false

    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }

    Logger.success("Automated rebalancer stopped")
  }

  /**
   * Check all positions and rebalance if necessary
   */
  private async checkAndRebalance(): Promise<void> {
    try {
      Logger.info("Checking positions for rebalancing...")

      const positions = await this.dlmmService.getUserPositions(config.pools.monitored)

      if (positions.length === 0) {
        Logger.info("No positions found")
        return
      }

      for (const position of positions) {
        try {
          // Get volatility metrics
          const binData = await this.dlmmService.getBinData(position.poolAddress)
          const volatility = this.volatilityService.calculateVolatilityFromPrices(binData)

          // Check if position needs rebalancing
          if (this.shouldRebalance(position, volatility)) {
            await this.rebalancePosition(position, volatility)
          }

          // Check stop-loss
          await this.checkStopLoss(position)
        } catch (error) {
          Logger.error(`Failed to process position ${position.positionId}`, error)
        }
      }
    } catch (error) {
      Logger.error("Failed to check and rebalance", error)
    }
  }

  /**
   * Determine if a position should be rebalanced
   */
  private shouldRebalance(position: Position, volatility: VolatilityMetrics): boolean {
    // Check if out of range
    if (!position.isInRange) {
      Logger.info(`Position ${position.positionId} is out of range`)
      return true
    }

    // Check volatility threshold
    if (volatility.volatilityRatio > config.rebalancer.volatilityThreshold) {
      Logger.info(`Position ${position.positionId} exceeds volatility threshold`)
      return true
    }

    // Check if close to range boundaries
    const rangeWidth = position.upperBin - position.lowerBin
    const distanceToLower = position.currentBin - position.lowerBin
    const distanceToUpper = position.upperBin - position.currentBin

    const minDistance = rangeWidth * config.rebalancer.outOfRangeThreshold

    if (distanceToLower < minDistance || distanceToUpper < minDistance) {
      Logger.info(`Position ${position.positionId} is close to range boundary`)
      return true
    }

    return false
  }

  /**
   * Rebalance a position
   */
  private async rebalancePosition(position: Position, volatility: VolatilityMetrics): Promise<void> {
    try {
      Logger.info(`Rebalancing position ${position.positionId}`)

      const isStaked = await this.stakeService.isStakingSupported(position.poolAddress)
      if (isStaked) {
        Logger.info("Unstaking position before rebalancing...")
        await this.stakeService.unstakePosition(position.poolAddress, position.positionId)

        // Claim any pending rewards
        await this.stakeService.claimRewards(position.poolAddress, position.positionId)
      }

      // Remove liquidity from current position
      const removeTx = await this.dlmmService.removeLiquidity(position.poolAddress, position.positionId, 100)

      Logger.info(`Liquidity removed: ${removeTx}`)

      // Calculate new optimal range based on volatility
      const rangeWidth = this.volatilityService.getRecommendedRangeWidth(volatility)
      const currentPrice = this.dlmmService.calculateBinPrice(
        position.currentBin,
        await this.getBinStep(position.poolAddress),
      )

      const poolConfig = await this.dlmmService.getPoolConfig(position.poolAddress)

      if (!poolConfig) {
        throw new Error("Failed to get pool config")
      }

      const newLowerPrice = currentPrice * (1 - rangeWidth / 2)
      const newUpperPrice = currentPrice * (1 + rangeWidth / 2)

      const newLowerBin = CalculationUtils.priceToBinId(newLowerPrice, poolConfig.binStep)
      const newUpperBin = CalculationUtils.priceToBinId(newUpperPrice, poolConfig.binStep)

      // Add liquidity to new position
      const addTx = await this.dlmmService.addLiquidity(
        position.poolAddress,
        newLowerBin,
        newUpperBin,
        position.liquidityX,
        position.liquidityY,
      )

      Logger.success(`Position rebalanced successfully: ${addTx}`)

      if (isStaked) {
        Logger.info("Staking new position for hybrid yield boost...")
        const newPositionId = addTx // Simplified - actual position ID would be parsed from transaction
        await this.stakeService.stakePosition(position.poolAddress, newPositionId)
        Logger.success("Position staked successfully for additional farming rewards")
      }

      // Send Telegram notification
      await this.telegramService.sendMessage(
        `✅ Position rebalanced successfully!\n\n` +
          `Pool: ${position.tokenX}/${position.tokenY}\n` +
          `New Range: ${newLowerBin} - ${newUpperBin}\n` +
          `Volatility: ${(volatility.volatilityRatio * 100).toFixed(2)}%\n` +
          `${isStaked ? "🌾 Staked for farming rewards\n" : ""}` +
          `TX: ${addTx.slice(0, 8)}...`,
      )
    } catch (error) {
      Logger.error("Failed to rebalance position", error)
      await this.telegramService.sendMessage(
        `❌ Rebalancing failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
    }
  }

  /**
   * Check and execute stop-loss if needed
   */
  private async checkStopLoss(position: Position): Promise<void> {
    if (!config.stopLoss.enabled) {
      return
    }

    const poolConfig = await this.dlmmService.getPoolConfig(position.poolAddress)
    if (!poolConfig) return

    const currentPrice = this.dlmmService.calculateBinPrice(position.currentBin, poolConfig.binStep)
    const lowerPrice = this.dlmmService.calculateBinPrice(position.lowerBin, poolConfig.binStep)

    const stopLossPrice = lowerPrice * (1 - config.stopLoss.percentage)

    if (currentPrice <= stopLossPrice) {
      Logger.warn(`Stop-loss triggered for position ${position.positionId}`)

      const closed = await this.dlmmService.closePosition(position)

      if (closed) {
        await this.telegramService.sendMessage(
          `🛑 Stop-loss triggered!\n\n` +
            `Pool: ${position.tokenX}/${position.tokenY}\n` +
            `Current Price: ${currentPrice.toFixed(6)}\n` +
            `Stop-Loss Price: ${stopLossPrice.toFixed(6)}\n` +
            `Position closed\n`,
        )
      }
    }
  }

  /**
   * Get bin step for a pool
   */
  private async getBinStep(poolAddress: string): Promise<number> {
    const poolConfig = await this.dlmmService.getPoolConfig(poolAddress)
    if (!poolConfig) {
      throw new Error("Failed to get pool config")
    }
    return poolConfig.binStep
  }

  /**
   * Get portfolio statistics
   */
  async getPortfolioStats(): Promise<any> {
    try {
      const positions = await this.dlmmService.getUserPositions(config.pools.monitored)

      const totalPositions = positions.length
      const positionsInRange = positions.filter((p) => p.isInRange).length
      const positionsOutOfRange = totalPositions - positionsInRange

      const totalValueUSD = positions.reduce((sum, p) => sum + p.valueUSD, 0)
      const averageAPY = positions.reduce((sum, p) => sum + p.apy, 0) / totalPositions || 0

      return {
        totalPositions,
        totalValueUSD,
        positionsInRange,
        positionsOutOfRange,
        averageAPY,
      }
    } catch (error) {
      Logger.error("Failed to get portfolio stats", error)
      throw error
    }
  }

  /**
   * Check a single position and rebalance if needed
   */
  private async checkPosition(position: Position): Promise<void> {
    try {
      const poolConfig = await this.dlmmService.getPoolConfig(position.poolAddress)
      if (!poolConfig) {
        Logger.error(`Failed to get pool config for ${position.poolAddress}`)
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
        Logger.warn(`Position ${position.positionId} is out of range`)
        await this.telegramService.sendOutOfRangeAlert(position)

        // Calculate new optimal range
        const binPrices = await this.dlmmService.getBinData(position.poolAddress)
        const volatility = await this.volatilityService.calculateVolatilityFromPrices(binPrices)
        const rangeWidth = this.volatilityService.getRecommendedRangeWidth(volatility)

        const currentPrice = this.dlmmService.calculateBinPrice(activeBin, poolConfig.binStep)
        const optimalRange = this.volatilityService.calculateOptimalBinRange(
          currentPrice,
          rangeWidth,
          poolConfig.binStep,
        )

        // Rebalance position
        const success = await this.dlmmService.rebalancePosition(position, optimalRange.lowerBin, optimalRange.upperBin)

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

          await this.telegramService.sendRebalanceNotification(action)
        }
      } else {
        Logger.info(`Position ${position.positionId} is in range`)
      }

      // Check stop-loss
      if (config.stopLoss.enabled) {
        const currentPrice = this.dlmmService.calculateBinPrice(activeBin, poolConfig.binStep)
        const lowerPrice = this.dlmmService.calculateBinPrice(position.lowerBin, poolConfig.binStep)

        const priceDropPercentage = ((lowerPrice - currentPrice) / lowerPrice) * 100

        if (priceDropPercentage > config.stopLoss.percentage) {
          Logger.warn(`Stop-loss triggered for position ${position.positionId}`)
          await this.telegramService.sendStopLossAlert(position, currentPrice)

          const closed = await this.dlmmService.closePosition(position)
          if (closed) {
            Logger.success(`Position ${position.positionId} closed due to stop-loss`)
          }
        }
      }
    } catch (error) {
      Logger.error(`Failed to check position ${position.positionId}`, error)
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
      Logger.info("Received SIGINT, shutting down...")
      rebalancer.stop()
      process.exit(0)
    })

    process.on("SIGTERM", () => {
      Logger.info("Received SIGTERM, shutting down...")
      rebalancer.stop()
      process.exit(0)
    })
  } catch (error) {
    Logger.error("Fatal error in rebalancer", error)
    process.exit(1)
  }
}

// Run if executed directly
if (require.main === module) {
  main()
}

