// src/services/dlmm.service.ts
import { type Connection, PublicKey } from "@solana/web3.js"
import { LiquidityBookServices, MODE } from "@saros-finance/dlmm-sdk"
import type { Position, PortfolioStats, PoolState, SDKTokenInfo, PoolMetadata as LocalPoolMetadata } from "@/src/types"
import BN from "bn.js"

export class DLMMService {
  private connection: Connection
  private liquidityBookServices: LiquidityBookServices

  constructor(connection: Connection) {
    this.connection = connection

    // Initialize Saros LiquidityBookServices
    this.liquidityBookServices = new LiquidityBookServices({
      mode: process.env.NEXT_PUBLIC_SOLANA_NETWORK === "mainnet-beta" ? MODE.MAINNET : MODE.DEVNET,
    })
  }

  /**
   * Fetch all DLMM positions for a given wallet address
   */
  async getUserPositions(walletAddress: string): Promise<Position[]> {
    try {
      const userPubkey = new PublicKey(walletAddress)

      // Get all pool addresses from Saros
      const poolAddresses = await this.liquidityBookServices.fetchPoolAddresses()

      const positions: Position[] = []

      // Check each pool for user positions
      for (const poolAddress of poolAddresses) {
        try {
          // Use mapped pool metadata (LocalPoolMetadata) which contains binStep/activeId
          const poolMetadata = await this.getPoolMetadata(poolAddress)

          if (!poolMetadata) continue

          // Get user positions for this pool using SDK signature { pair, payer }
          const userPositionsRaw = await this.liquidityBookServices.getUserPositions({
            pair: new PublicKey(poolAddress),
            payer: userPubkey,
          })

          // Normalize
          const userPositions = Array.isArray(userPositionsRaw) ? userPositionsRaw : (userPositionsRaw ?? [])

          for (const position of userPositions) {
            // Calculate position metrics (uses mapped fields)
            const isInRange =
              position.lowerBinId <= poolMetadata.activeId && position.upperBinId >= poolMetadata.activeId

            // Get token amounts (use the mapped token decimals)
            const liquidityX = this.bnToNumber(new BN(position.totalXAmount), poolMetadata.tokenX.decimals)
            const liquidityY = this.bnToNumber(new BN(position.totalYAmount), poolMetadata.tokenY.decimals)

            // Get unclaimed fees
            const feesX = this.bnToNumber(new BN(position.feeX || 0), poolMetadata.tokenX.decimals)
            const feesY = this.bnToNumber(new BN(position.feeY || 0), poolMetadata.tokenY.decimals)

            // Calculate USD value (simplified)
            const valueUSD = this.calculatePositionValue(liquidityX, liquidityY)

            // Estimate APY
            const apy = this.estimateAPY(feesX, feesY, valueUSD)

            positions.push({
              positionId: position.publicKey.toBase58(),
              poolAddress,
              tokenX: poolMetadata.tokenX.symbol || "Unknown",
              tokenY: poolMetadata.tokenY.symbol || "Unknown",
              tokenXMint: poolMetadata.tokenX.mint,
              tokenYMint: poolMetadata.tokenY.mint,
              lowerBin: position.lowerBinId,
              upperBin: position.upperBinId,
              currentBin: poolMetadata.activeId,
              liquidityX,
              liquidityY,
              feesEarnedX: feesX,
              feesEarnedY: feesY,
              isInRange,
              valueUSD,
              apy,
              lastUpdated: Date.now(),
            })
          }
        } catch (error) {
          console.error(`[v0] Error processing pool ${poolAddress}:`, error)
          continue
        }
      }

      return positions
    } catch (error) {
      console.error("[v0] Error fetching user positions:", error)
      throw new Error("Failed to fetch user positions")
    }
  }

  /**
   * Get all available pool addresses
   */
  async getAllPools(): Promise<string[]> {
    try {
      return await this.liquidityBookServices.fetchPoolAddresses()
    } catch (error) {
      console.error("[v0] Error fetching pool addresses:", error)
      return []
    }
  }

  /**
   * Get pool metadata (mapped to local shape)
   */
  async getPoolMetadata(poolAddress: string): Promise<LocalPoolMetadata | null> {
    try {
      // treat SDK return as any so we can defensively map fields
      const raw: any = await this.liquidityBookServices.fetchPoolMetadata(poolAddress)

      if (!raw) return null

      // helper mapper for token info
      const mapToken = (t: any): SDKTokenInfo => {
        return {
          mint: t?.mint ?? t?.address ?? t?.tokenMint ?? "",
          decimals: Number(t?.decimals ?? t?.decimalsToken ?? 0),
          symbol: t?.symbol ?? t?.ticker ?? undefined,
        }
      }

      // Normalize common property variations from SDK (be defensive)
      const activeId = raw.activeId ?? raw.active_id ?? raw.active ?? 0
      const binStep = raw.binStep ?? raw.bin_step ?? raw.bin_step_value ?? raw.bin_step_bps ?? 0
      const protocolFeeRate = raw.protocolFeeRate ?? raw.protocol_fee_rate ?? raw.protocolFee ?? 0

      const tokenXRaw = raw.tokenX ?? raw.token_x ?? raw.baseToken ?? raw.tokenBase ?? raw.tokenBaseInfo ?? {}
      const tokenYRaw = raw.tokenY ?? raw.token_y ?? raw.quoteToken ?? raw.tokenQuote ?? raw.tokenQuoteInfo ?? {}

      const mapped: LocalPoolMetadata = {
        activeId,
        binStep,
        tokenX: mapToken(tokenXRaw),
        tokenY: mapToken(tokenYRaw),
        protocolFeeRate,
      }

      return mapped
    } catch (error) {
      console.error("[v0] Error fetching pool metadata:", error)
      return null
    }
  }

  /**
   * Get pool configuration (alias for getPoolMetadata)
   */
  async getPoolConfig(poolAddress: string) {
    return this.getPoolMetadata(poolAddress)
  }

  /**
   * Get the active bin ID for a pool
   */
  async getActiveBin(poolAddress: string): Promise<number> {
    try {
      const metadata = await this.getPoolMetadata(poolAddress)
      if (!metadata) {
        throw new Error("Pool not found")
      }
      return metadata.activeId
    } catch (error) {
      console.error("[v0] Error getting active bin:", error)
      throw error
    }
  }

  /**
   * Get bin data for a pool
   */
  async getBinData(poolAddress: string, binIds: number[]) {
    try {
      const metadata = await this.getPoolMetadata(poolAddress)
      if (!metadata) {
        throw new Error("Pool not found")
      }

      const binData = binIds.map((binId) => {
        const price = Math.pow(1 + metadata.binStep / 10000, binId)
        return {
          binId,
          price,
          liquidityX: new BN(0),
          liquidityY: new BN(0),
          supply: new BN(0),
        }
      })

      return binData
    } catch (error) {
      console.error("[v0] Error getting bin data:", error)
      return []
    }
  }

  /**
   * Calculate price for a specific bin
   */
  calculateBinPrice(binId: number, binStep: number): number {
    return Math.pow(1 + binStep / 10000, binId)
  }

  /**
   * Rebalance a position to a new range
   */
  async rebalancePosition(positionId: string, lowerBin: number, upperBin: number): Promise<boolean> {
    try {
      console.log(`[v0] Rebalancing position ${positionId} to range [${lowerBin}, ${upperBin}]`)
      // TODO: Implement actual rebalancing logic using Saros SDK
      // This would involve:
      // 1. Close existing position
      // 2. Create new position with new range
      // 3. Transfer liquidity
      return true
    } catch (error) {
      console.error("[v0] Error rebalancing position:", error)
      return false
    }
  }

  /**
   * Close a position
   */
  async closePosition(positionId: string): Promise<boolean> {
    try {
      console.log(`[v0] Closing position ${positionId}`)
      // TODO: Implement actual position closing logic using Saros SDK
      return true
    } catch (error) {
      console.error("[v0] Error closing position:", error)
      return false
    }
  }

  /**
   * Get pool state information
   */
  async getPoolState(poolAddress: string): Promise<PoolState> {
    try {
      const metadata = await this.getPoolMetadata(poolAddress)

      if (!metadata) {
        throw new Error("Pool metadata not found")
      }

      return {
        address: new PublicKey(poolAddress),
        tokenXMint: new PublicKey(metadata.tokenX.mint),
        tokenYMint: new PublicKey(metadata.tokenY.mint),
        binStep: metadata.binStep,
        activeId: metadata.activeId,
        protocolFee: metadata.protocolFeeRate || 0,
        maxBinId: metadata.activeId + 1000,
        minBinId: metadata.activeId - 1000,
      }
    } catch (error) {
      console.error("[v0] Error getting pool state:", error)
      throw new Error("Failed to get pool state")
    }
  }

  /**
   * Get quote for a swap
   */
  async getSwapQuote(poolAddress: string, amountIn: number, swapForY: boolean, slippage = 0.5) {
    try {
      const metadata = await this.getPoolMetadata(poolAddress)

      if (!metadata) {
        throw new Error("Pool not found")
      }

      const decimals = swapForY ? metadata.tokenX.decimals : metadata.tokenY.decimals
      const amountInBigInt = BigInt(Math.floor(amountIn * Math.pow(10, decimals)))

      const quote = await this.liquidityBookServices.getQuote({
        amount: amountInBigInt,
        isExactInput: true,
        swapForY,
        pair: new PublicKey(poolAddress),
        tokenBase: new PublicKey(metadata.tokenX.mint),
        tokenQuote: new PublicKey(metadata.tokenY.mint),
        tokenBaseDecimal: metadata.tokenX.decimals,
        tokenQuoteDecimal: metadata.tokenY.decimals,
        slippage,
      })

      return quote
    } catch (error) {
      console.error("[v0] Error getting swap quote:", error)
      throw error
    }
  }

  /**
   * Calculate portfolio statistics
   */
  calculatePortfolioStats(positions: Position[]): PortfolioStats {
    const totalValue = positions.reduce((sum, p) => sum + p.valueUSD, 0)
    const totalFees = positions.reduce((sum, p) => sum + p.feesEarnedX + p.feesEarnedY, 0)
    const avgApy = positions.length > 0 ? positions.reduce((sum, p) => sum + p.apy, 0) / positions.length : 0
    const activePositions = positions.filter((p) => p.isInRange).length

    return {
      totalValue,
      totalFees,
      avgApy,
      activePositions,
    }
  }

  /**
   * Helper: Convert BN to number with decimals
   */
  private bnToNumber(bn: BN, decimals: number): number {
    const divisor = new BN(10).pow(new BN(decimals))
    const quotient = bn.div(divisor)
    const remainder = bn.mod(divisor)
    return quotient.toNumber() + remainder.toNumber() / divisor.toNumber()
  }

  /**
   * Helper: Calculate position value in USD (simplified)
   */
  private calculatePositionValue(tokenX: number, tokenY: number): number {
    // Simplified: assume 1:1 USD value
    // In production, multiply by actual token prices from oracle
    return tokenX + tokenY
  }

  /**
   * Helper: Estimate APY based on fees (simplified)
   */
  private estimateAPY(feeX: number, feeY: number, valueUSD: number): number {
    if (valueUSD === 0) return 0
    const totalFees = feeX + feeY
    // Simplified: assume fees are from 1 day, annualize
    return (totalFees / valueUSD) * 365 * 100
  }
}
