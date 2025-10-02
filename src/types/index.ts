import type { PublicKey } from "@solana/web3.js"
import type BN from "bn.js"

export interface Position {
  positionId: string
  poolAddress: string
  tokenX: string
  tokenY: string
  tokenXMint: string
  tokenYMint: string
  lowerBin: number
  upperBin: number
  currentBin: number
  liquidityX: number
  liquidityY: number
  feesEarnedX: number
  feesEarnedY: number
  isInRange: boolean
  valueUSD: number
  apy: number
  lastUpdated: number
}

export interface PortfolioStats {
  totalValue: number
  totalFees: number
  avgApy: number
  activePositions: number
}

export interface VolatilityData {
  poolAddress: string
  mean: number
  stdDev: number
  volatilityRatio: number
  isHighVolatility: boolean
  recommendedRangeWidth: number
  historicalPrices: Array<{
    timestamp: number
    price: number
  }>
}

export interface BinData {
  binId: number
  price: number
  liquidityX: BN
  liquidityY: BN
  supply: BN
}

export interface PoolState {
  address: PublicKey
  tokenXMint: PublicKey
  tokenYMint: PublicKey
  binStep: number
  activeId: number
  protocolFee: number
  maxBinId: number
  minBinId: number
}

export interface RebalanceAction {
  positionId: string
  poolAddress: string
  action: "rebalance" | "close" | "adjust"
  reason: string
  oldRange: {
    lower: number
    upper: number
  }
  newRange?: {
    lower: number
    upper: number
  }
  timestamp: number
  txSignature?: string
}

export interface PortfolioStats {
  totalValue: number
  totalFees: number
  avgApy: number
  activePositions: number
  totalPositions?: number; // Added for bot summary
  totalFeesEarned?: number; // Alias for totalFees
  positionsInRange?: number; // Calculated active
  positionsOutOfRange?: number; // Calculated
  averageAPY?: number; // Alias for avgApy
  impermanentLoss?: number; // Add if needed for calculations
}


export interface SDKTokenInfo {
  mint: string
  decimals: number
  symbol?: string
}

export interface PoolMetadata {
  activeId: number            // active bin id
  binStep: number            // bin step (basis points / per-bin increment)
  tokenX: SDKTokenInfo
  tokenY: SDKTokenInfo
  protocolFeeRate?: number
}