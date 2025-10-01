import type { Connection, PublicKey } from "@solana/web3.js"
import { DLMMService } from "./dlmm.service"
import { VolatilityService } from "./volatility.service"
import { TelegramService } from "./telegram.service"
import { Logger } from "../utils/logger"
import { config } from "../config"
import type { Position, RebalanceAction } from "../types"

export class RebalancerService {
  private dlmmService: DLMMService
  private volatilityService: VolatilityService
  private telegramService: TelegramService
  private connection: Connection

  constructor(connection: Connection) {
    this.connection = connection
    this.dlmmService = new DLMMService(connection)
    this.volatilityService = new VolatilityService(connection)
    this.telegramService = new TelegramService()
  }

  async checkPosition(position: Position): Promise<RebalanceAction | null> {
    try {
      if (!position.isInRange) {
        Logger.info(`Position ${position.positionId} is out of range`)
        await this.telegramService.sendOutOfRangeAlert(position)

        const volatilityData = await this.volatilityService.calculateVolatility(position.poolAddress)
        const rangeWidth = Math.max(volatilityData.recommendedRangeWidth, 10)
        const newLowerBin = position.currentBin - Math.floor(rangeWidth / 2)
        const newUpperBin = position.currentBin + Math.floor(rangeWidth / 2)

        return {
          positionId: position.positionId,
          poolAddress: position.poolAddress,
          action: "rebalance",
          reason: "Position out of range",
          oldRange: {
            lower: position.lowerBin,
            upper: position.upperBin,
          },
          newRange: {
            lower: newLowerBin,
            upper: newUpperBin,
          },
          timestamp: Date.now(),
        }
      }

      const priceChange = Math.abs((position.currentBin - position.lowerBin) / position.lowerBin)

      if (priceChange > config.rebalancer.stopLossThreshold) {
        Logger.warn(`Stop-loss triggered for position ${position.positionId}`)
        await this.telegramService.sendStopLossAlert(position, position.currentBin)

        return {
          positionId: position.positionId,
          poolAddress: position.poolAddress,
          action: "close",
          reason: "Stop-loss threshold exceeded",
          oldRange: {
            lower: position.lowerBin,
            upper: position.upperBin,
          },
          timestamp: Date.now(),
        }
      }

      const volatilityData = await this.volatilityService.calculateVolatility(position.poolAddress)

      if (volatilityData.isHighVolatility) {
        const currentRangeWidth = position.upperBin - position.lowerBin
        const recommendedWidth = volatilityData.recommendedRangeWidth

        if (currentRangeWidth < recommendedWidth * 0.8) {
          Logger.info(`Adjusting range for high volatility: ${position.positionId}`)

          const newLowerBin = position.currentBin - Math.floor(recommendedWidth / 2)
          const newUpperBin = position.currentBin + Math.floor(recommendedWidth / 2)

          return {
            positionId: position.positionId,
            poolAddress: position.poolAddress,
            action: "adjust",
            reason: "High volatility detected - widening range",
            oldRange: {
              lower: position.lowerBin,
              upper: position.upperBin,
            },
            newRange: {
              lower: newLowerBin,
              upper: newUpperBin,
            },
            timestamp: Date.now(),
          }
        }
      }

      return null
    } catch (error) {
      Logger.error(`Error checking position ${position.positionId}`, error)
      await this.telegramService.sendErrorAlert(
        error instanceof Error ? error.message : "Unknown error",
        `Checking position ${position.positionId}`,
      )
      return null
    }
  }

  async monitorPositions(userAddress: string): Promise<RebalanceAction[]> {
    try {
      Logger.info(`Monitoring positions for user: ${userAddress}`)

      const positions = await this.dlmmService.getUserPositions(userAddress)
      const actions: RebalanceAction[] = []

      for (const position of positions) {
        const action = await this.checkPosition(position)
        if (action) {
          actions.push(action)
        }
      }

      if (actions.length > 0) {
        Logger.info(`Found ${actions.length} positions requiring action`)
      }

      return actions
    } catch (error) {
      Logger.error("Error monitoring positions", error)
      await this.telegramService.sendErrorAlert(
        error instanceof Error ? error.message : "Unknown error",
        "Monitoring positions",
      )
      return []
    }
  }

  async executeRebalance(action: RebalanceAction, userPublicKey: PublicKey): Promise<string | null> {
    try {
      Logger.info(`Executing rebalance action for position ${action.positionId}`)
      await this.telegramService.sendRebalanceNotification(action)
      return "mock-signature"
    } catch (error) {
      Logger.error("Error executing rebalance", error)
      await this.telegramService.sendErrorAlert(
        error instanceof Error ? error.message : "Unknown error",
        `Executing rebalance for ${action.positionId}`,
      )
      return null
    }
  }

  async sendDailySummary(userAddress: string): Promise<void> {
    try {
      const positions = await this.dlmmService.getUserPositions(userAddress)
      const totalFees = positions.reduce((sum, pos) => sum + pos.feesEarnedX + pos.feesEarnedY, 0)
      const rebalancedToday = 0

      await this.telegramService.sendDailySummary(positions.length, rebalancedToday, totalFees)
    } catch (error) {
      Logger.error("Error sending daily summary", error)
    }
  }


}