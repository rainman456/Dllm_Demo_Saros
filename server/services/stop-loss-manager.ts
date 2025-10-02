import BN from "bn.js"
import { getDLMMClient, type DLMMPosition } from "../solana/dlmm-client"
import { storage } from "../storage"
import { telegramBot } from "./telegram-bot"

export interface StopLossConfig {
  enabled: boolean
  percentage: number // Percentage drop to trigger stop-loss
  targetToken: "X" | "Y" | "STABLE" // Which token to swap to
}

export class StopLossManager {
  private stopLossConfigs: Map<string, StopLossConfig> = new Map()

  /**
   * Set stop-loss configuration for a position
   */
  setStopLoss(positionId: string, config: StopLossConfig) {
    this.stopLossConfigs.set(positionId, config)
    console.log(`Stop-loss configured for position ${positionId}:`, config)
  }

  /**
   * Check if stop-loss should be triggered
   */
  async checkStopLoss(position: DLMMPosition): Promise<boolean> {
    const config = this.stopLossConfigs.get(position.publicKey)
    if (!config || !config.enabled) return false

    try {
      const dlmmClient = getDLMMClient()
      const activeBin = await dlmmClient.getActiveBin(position.poolAddress)

      // Calculate price change from position entry
      const entryBin = (position.lowerBinId + position.upperBinId) / 2
      const priceChange = ((activeBin - entryBin) / entryBin) * 100

      // Trigger if price dropped below threshold
      if (Math.abs(priceChange) >= config.percentage) {
        console.log(`Stop-loss triggered for ${position.poolPair}: ${priceChange.toFixed(2)}% change`)
        return true
      }

      return false
    } catch (error) {
      console.error("Error checking stop-loss:", error)
      return false
    }
  }

  /**
   * Execute stop-loss: remove liquidity and swap to stable
   */
  async executeStopLoss(position: DLMMPosition): Promise<{ success: boolean; signature?: string }> {
    try {
      const dlmmClient = getDLMMClient()

      // Step 1: Remove all liquidity
      const binIds = []
      const liquidityShares = []

      for (let i = position.lowerBinId; i <= position.upperBinId; i++) {
        binIds.push(i)
        liquidityShares.push(position.liquidity)
      }

      const removeSig = await dlmmClient.removeLiquidity(
        position.publicKey,
        position.poolAddress,
        binIds,
        liquidityShares,
      )

      console.log(`Liquidity removed: ${removeSig}`)

      // Step 2: Swap to stable token (if configured)
      const config = this.stopLossConfigs.get(position.publicKey)
      if (config?.targetToken === "STABLE") {
        // Get quote for swap
        const quote = await dlmmClient.getQuote(position.liquidity, position.liquidity, true)

        // Execute swap with 1% slippage tolerance
        const minAmountOut = quote.amountOut.mul(new BN(99)).div(new BN(100))
        const swapSig = await dlmmClient.executeSwap(position.poolAddress, position.liquidity, minAmountOut, true)

        console.log(`Swapped to stable: ${swapSig}`)
      }

      // Log event
      await storage.createRebalancingEvent({
        positionId: position.publicKey,
        type: "alert",
        poolPair: position.poolPair,
        message: `Stop-loss executed: Liquidity removed and swapped to stable`,
      })

      await telegramBot.sendAlert(`Stop-loss executed for ${position.poolPair}`, "warning")

      return { success: true, signature: removeSig }
    } catch (error) {
      console.error("Stop-loss execution failed:", error)
      return { success: false }
    }
  }

  /**
   * Monitor all positions for stop-loss triggers
   */
  async monitorStopLoss(walletAddress: string): Promise<void> {
    try {
      const dlmmClient = getDLMMClient()
      const positions = await dlmmClient.getUserPositions(walletAddress)

      for (const position of positions) {
        const shouldTrigger = await this.checkStopLoss(position)

        if (shouldTrigger) {
          await this.executeStopLoss(position)
        }
      }
    } catch (error) {
      console.error("Stop-loss monitoring error:", error)
    }
  }
}

export const stopLossManager = new StopLossManager()
