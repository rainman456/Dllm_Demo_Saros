import BN from "bn.js"
import { getDLMMClient, type DLMMPosition } from "../solana/dlmm-client"
import { stakingManager } from "./staking-manager"
import { stopLossManager } from "./stop-loss-manager"

export interface RebalanceDecision {
  shouldRebalance: boolean
  reason: string
  newLowerBin?: number
  newUpperBin?: number
  volatility?: number
}

export async function checkPositionStatus(position: DLMMPosition): Promise<RebalanceDecision> {
  try {
    const dlmmClient = getDLMMClient()
    const activeBin = await dlmmClient.getActiveBin(position.poolAddress)

    const bins = await dlmmClient.getBinArrays(position.poolAddress, position.lowerBinId - 50, position.upperBinId + 50)

    const volatility = await dlmmClient.calculateVolatility(bins)

    const isOutOfRange = activeBin < position.lowerBinId || activeBin > position.upperBinId

    if (isOutOfRange) {
      const rangeWidth = calculateRangeWidth(volatility)
      const newLowerBin = activeBin - rangeWidth
      const newUpperBin = activeBin + rangeWidth

      return {
        shouldRebalance: true,
        reason: `Position out of range. Active bin ${activeBin} outside [${position.lowerBinId}, ${position.upperBinId}]`,
        newLowerBin,
        newUpperBin,
        volatility,
      }
    }

    const volatilityThreshold = Number.parseFloat(process.env.VOLATILITY_THRESHOLD || "0.15") * 100

    if (volatility > volatilityThreshold) {
      const rangeWidth = calculateRangeWidth(volatility)
      const newLowerBin = activeBin - rangeWidth
      const newUpperBin = activeBin + rangeWidth

      return {
        shouldRebalance: true,
        reason: `High volatility detected: ${volatility.toFixed(2)}%. Adjusting range.`,
        newLowerBin,
        newUpperBin,
        volatility,
      }
    }

    return {
      shouldRebalance: false,
      reason: "Position is in range and volatility is normal",
      volatility,
    }
  } catch (error) {
    console.error("Error checking position status:", error)
    return {
      shouldRebalance: false,
      reason: `Error: ${error}`,
    }
  }
}

function calculateRangeWidth(volatility: number): number {
  if (volatility < 5) {
    return 50 // Tight range for stable markets
  }
  if (volatility < 10) {
    return 75
  }
  if (volatility < 15) {
    return 100
  }
  return 150 // Wide range for volatile markets
}

export async function executeRebalance(
  position: DLMMPosition,
  newLowerBin: number,
  newUpperBin: number,
): Promise<{ success: boolean; signatures: string[] }> {
  try {
    const shouldStopLoss = await stopLossManager.checkStopLoss(position)
    if (shouldStopLoss) {
      console.log(`Stop-loss triggered for ${position.poolPair}, executing stop-loss instead of rebalance`)
      const stopLossResult = await stopLossManager.executeStopLoss(position)
      return {
        success: stopLossResult.success,
        signatures: stopLossResult.signature ? [stopLossResult.signature] : [],
      }
    }

    const dlmmClient = getDLMMClient()

    // Build bin IDs and liquidity shares for removal
    const binIds = []
    const liquidityShares = []

    for (let i = position.lowerBinId; i <= position.upperBinId; i++) {
      binIds.push(i)
      liquidityShares.push(position.liquidity)
    }

    // Remove liquidity from old position
    const removeSig = await dlmmClient.removeLiquidity(
      position.publicKey,
      position.poolAddress,
      binIds,
      liquidityShares,
    )

    // Add liquidity to new position
    const addSig = await dlmmClient.addLiquidityToPosition(
      position.publicKey,
      position.poolAddress,
      newLowerBin,
      newUpperBin,
      position.liquidity,
      new BN(0),
    )

    await stakingManager.autoStakeAfterRebalance(position)

    return {
      success: true,
      signatures: [removeSig, addSig],
    }
  } catch (error) {
    console.error("Rebalance error:", error)
    return {
      success: false,
      signatures: [],
    }
  }
}

export async function monitorAllPositions(walletAddress: string) {
  try {
    const dlmmClient = getDLMMClient()
    const positions = await dlmmClient.getUserPositions(walletAddress)
    const decisions: Array<{ position: DLMMPosition; decision: RebalanceDecision }> = []

    for (const position of positions) {
      const decision = await checkPositionStatus(position)
      decisions.push({ position, decision })
    }

    return decisions
  } catch (error) {
    console.error("Error monitoring positions:", error)
    return []
  }
}
