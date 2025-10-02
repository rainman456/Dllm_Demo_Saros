import BN from "bn.js";
import {
  getUserPositions,
  getActiveBin,
  getBinArrays,
  calculateVolatility,
  removeLiquidity,
  addLiquidityToPosition,
  type DLMMPosition,
} from "../solana/dlmm-mock";

export interface RebalanceDecision {
  shouldRebalance: boolean;
  reason: string;
  newLowerBin?: number;
  newUpperBin?: number;
  volatility?: number;
}

export async function checkPositionStatus(
  position: DLMMPosition
): Promise<RebalanceDecision> {
  const activeBin = await getActiveBin(position.poolAddress);
  
  const bins = await getBinArrays(
    position.poolAddress,
    position.lowerBinId - 50,
    position.upperBinId + 50
  );
  
  const volatility = await calculateVolatility(bins);
  
  const isOutOfRange = activeBin < position.lowerBinId || activeBin > position.upperBinId;
  
  if (isOutOfRange) {
    const rangeWidth = calculateRangeWidth(volatility);
    const newLowerBin = activeBin - rangeWidth;
    const newUpperBin = activeBin + rangeWidth;
    
    return {
      shouldRebalance: true,
      reason: `Position out of range. Active bin ${activeBin} outside [${position.lowerBinId}, ${position.upperBinId}]`,
      newLowerBin,
      newUpperBin,
      volatility,
    };
  }
  
  if (volatility > 15) {
    const rangeWidth = calculateRangeWidth(volatility);
    const newLowerBin = activeBin - rangeWidth;
    const newUpperBin = activeBin + rangeWidth;
    
    return {
      shouldRebalance: true,
      reason: `High volatility detected: ${volatility.toFixed(2)}%. Adjusting range.`,
      newLowerBin,
      newUpperBin,
      volatility,
    };
  }
  
  return {
    shouldRebalance: false,
    reason: "Position is in range and volatility is normal",
    volatility,
  };
}

function calculateRangeWidth(volatility: number): number {
  if (volatility < 5) {
    return 50;
  } else if (volatility < 10) {
    return 75;
  } else if (volatility < 15) {
    return 100;
  } else {
    return 150;
  }
}

export async function executeRebalance(
  position: DLMMPosition,
  newLowerBin: number,
  newUpperBin: number
): Promise<{ success: boolean; signatures: string[] }> {
  try {
    const binIds = [];
    const liquidityShares = [];
    
    for (let i = position.lowerBinId; i <= position.upperBinId; i++) {
      binIds.push(i);
      liquidityShares.push(position.liquidity);
    }
    
    const removeSig = await removeLiquidity(
      position.publicKey,
      position.poolAddress,
      binIds,
      liquidityShares
    );
    
    const addSig = await addLiquidityToPosition(
      position.publicKey,
      position.poolAddress,
      newLowerBin,
      newUpperBin,
      position.liquidity,
      new BN(0)
    );
    
    return {
      success: true,
      signatures: [removeSig, addSig],
    };
  } catch (error) {
    console.error("Rebalance error:", error);
    return {
      success: false,
      signatures: [],
    };
  }
}

export async function monitorAllPositions(walletAddress: string) {
  const positions = await getUserPositions(walletAddress);
  const decisions: Array<{ position: DLMMPosition; decision: RebalanceDecision }> = [];
  
  for (const position of positions) {
    const decision = await checkPositionStatus(position);
    decisions.push({ position, decision });
  }
  
  return decisions;
}
