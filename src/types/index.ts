import type { PublicKey } from "@solana/web3.js"
import type BN from "bn.js"

export interface DLMMPoolInfo {
  address: PublicKey
  tokenX: {
    mint: PublicKey
    symbol: string
    decimals: number
  }
  tokenY: {
    mint: PublicKey
    symbol: string
    decimals: number
  }
  activeId: number
  feeTier: number
  binStep: number
}

export interface PoolConfig {
  address: PublicKey
  tokenX: string
  tokenY: string
  feeTier: number
  binStep: number
  activeId: number
  poolAddress: string
}

export interface Position {
  positionId: string
  poolAddress: string
  tokenX: string
  tokenY: string
  lowerBin: number
  upperBin: number
  currentBin: number
  liquidityX: BN
  liquidityY: BN
  feesEarned: {
    tokenX: BN
    tokenY: BN
  }
  currentPrice: number
  isInRange: boolean
  valueUSD: number
  apy: number
}

export interface BinData {
  binId: number
  price: number
  liquidityX: BN
  liquidityY: BN
  supply: BN
}

export interface LiquidityParams {
  lowerBin: number
  upperBin: number
  amountX: BN
  amountY: BN
  slippage: number
}

export interface VolatilityData {
  stdDev: number
  mean: number
  recentPrices: number[]
  timestamp: number
}

export interface VolatilityMetrics {
  mean: number
  stdDev: number
  volatilityRatio: number
  averageSpread: number
  liquidityConcentration: number
  recommendedRangeWidth: number
  historicalPrices?: Array<{ timestamp: number; price: number }>
}

export interface RebalanceAction {
  positionId: string
  poolAddress: string
  action: "rebalance" | "stop-loss" | "none"
  reason: string
  oldRange: { lower: number; upper: number }
  newRange?: { lower: number; upper: number }
  timestamp: number
}

export interface PortfolioStats {
  totalPositions: number
  totalValueUSD: number
  totalFeesEarned: number
  positionsInRange: number
  positionsOutOfRange: number
  averageAPY: number
  impermanentLoss: number
}

export interface SimulationResult {
  strategy: string
  totalFees: number
  impermanentLoss: number
  netReturn: number
  rebalanceCount: number
  gasSpent: number
}

export interface StakePosition {
  positionId: string
  poolAddress: string
  stakedAmount: BN
  rewardsPending: BN
  stakedAt: number
  farmAddress: string
}
