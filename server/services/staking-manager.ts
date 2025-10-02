import BN from "bn.js"
import { connection } from "../solana/connection"
import { getDLMMClient, type DLMMPosition } from "../solana/dlmm-client"
import { storage } from "../storage"
import { telegramBot } from "./telegram-bot"

export interface StakingConfig {
  enabled: boolean
  autoStake: boolean // Automatically stake after rebalancing
  minLiquidityThreshold: number // Minimum liquidity to stake
}

export interface StakingPosition {
  positionId: string
  poolAddress: string
  stakedAmount: BN
  rewardsClaimed: BN
  stakingStartTime: number
  estimatedAPY: number
}

export class StakingManager {
  private stakingConfigs: Map<string, StakingConfig> = new Map()
  private stakingPositions: Map<string, StakingPosition> = new Map()

  /**
   * Configure staking for a position
   */
  setStakingConfig(positionId: string, config: StakingConfig) {
    this.stakingConfigs.set(positionId, config)
    console.log(`Staking configured for position ${positionId}:`, config)
  }

  /**
   * Stake a DLMM position for additional yield
   */
  async stakePosition(position: DLMMPosition): Promise<{ success: boolean; signature?: string }> {
    try {
      const config = this.stakingConfigs.get(position.publicKey)
      if (!config || !config.enabled) {
        return { success: false }
      }

      // Check minimum liquidity threshold
      const liquidityValue = Number.parseFloat(position.liquidity.toString()) / 1e8
      if (liquidityValue < config.minLiquidityThreshold) {
        console.log(`Position ${position.publicKey} below staking threshold`)
        return { success: false }
      }

      // Build staking transaction
      // Note: This requires the Saros Staking SDK integration
      const stakingTx = await this.buildStakingTransaction(position)

      // Send transaction
      const signature = await connection.sendRawTransaction(stakingTx.serialize())
      await connection.confirmTransaction(signature, "confirmed")

      // Record staking position
      const stakingPosition: StakingPosition = {
        positionId: position.publicKey,
        poolAddress: position.poolAddress,
        stakedAmount: position.liquidity,
        rewardsClaimed: new BN(0),
        stakingStartTime: Date.now(),
        estimatedAPY: this.estimateStakingAPY(position.poolPair),
      }

      this.stakingPositions.set(position.publicKey, stakingPosition)

      // Log event
      await storage.createRebalancingEvent({
        positionId: position.publicKey,
        type: "success",
        poolPair: position.poolPair,
        message: `Position staked for additional yield (Est. APY: ${stakingPosition.estimatedAPY}%)`,
      })

      await telegramBot.sendAlert(
        `Staked ${position.poolPair} position for ${stakingPosition.estimatedAPY}% APY`,
        "success",
      )

      return { success: true, signature }
    } catch (error) {
      console.error("Staking error:", error)
      return { success: false }
    }
  }

  /**
   * Unstake a position
   */
  async unstakePosition(positionId: string): Promise<{ success: boolean; signature?: string }> {
    try {
      const stakingPosition = this.stakingPositions.get(positionId)
      if (!stakingPosition) {
        return { success: false }
      }

      // Build unstaking transaction
      const unstakingTx = await this.buildUnstakingTransaction(stakingPosition)

      // Send transaction
      const signature = await connection.sendRawTransaction(unstakingTx.serialize())
      await connection.confirmTransaction(signature, "confirmed")

      // Remove from tracking
      this.stakingPositions.delete(positionId)

      await storage.createRebalancingEvent({
        positionId,
        type: "success",
        poolPair: "N/A",
        message: `Position unstaked. Total rewards claimed: ${stakingPosition.rewardsClaimed.toString()}`,
      })

      return { success: true, signature }
    } catch (error) {
      console.error("Unstaking error:", error)
      return { success: false }
    }
  }

  /**
   * Claim staking rewards
   */
  async claimRewards(positionId: string): Promise<{ success: boolean; amount: BN; signature?: string }> {
    try {
      const stakingPosition = this.stakingPositions.get(positionId)
      if (!stakingPosition) {
        return { success: false, amount: new BN(0) }
      }

      // Calculate pending rewards
      const pendingRewards = await this.calculatePendingRewards(stakingPosition)

      // Build claim transaction
      const claimTx = await this.buildClaimTransaction(stakingPosition)

      // Send transaction
      const signature = await connection.sendRawTransaction(claimTx.serialize())
      await connection.confirmTransaction(signature, "confirmed")

      // Update claimed rewards
      stakingPosition.rewardsClaimed = stakingPosition.rewardsClaimed.add(pendingRewards)
      this.stakingPositions.set(positionId, stakingPosition)

      await telegramBot.sendAlert(`Claimed ${pendingRewards.toString()} rewards from staking`, "success")

      return { success: true, amount: pendingRewards, signature }
    } catch (error) {
      console.error("Claim rewards error:", error)
      return { success: false, amount: new BN(0) }
    }
  }

  /**
   * Auto-stake after rebalancing (hybrid yield boost)
   */
  async autoStakeAfterRebalance(position: DLMMPosition): Promise<void> {
    const config = this.stakingConfigs.get(position.publicKey)
    if (!config || !config.autoStake) return

    console.log(`Auto-staking position ${position.publicKey} after rebalance...`)
    await this.stakePosition(position)
  }

  /**
   * Get all staking positions for a wallet
   */
  async getStakingPositions(walletAddress: string): Promise<StakingPosition[]> {
    const dlmmClient = getDLMMClient()
    const positions = await dlmmClient.getUserPositions(walletAddress)

    const stakingPositions: StakingPosition[] = []

    for (const position of positions) {
      const stakingPos = this.stakingPositions.get(position.publicKey)
      if (stakingPos) {
        stakingPositions.push(stakingPos)
      }
    }

    return stakingPositions
  }

  /**
   * Calculate total staking rewards
   */
  async calculateTotalRewards(walletAddress: string): Promise<BN> {
    const stakingPositions = await this.getStakingPositions(walletAddress)

    let totalRewards = new BN(0)

    for (const position of stakingPositions) {
      const pending = await this.calculatePendingRewards(position)
      totalRewards = totalRewards.add(pending).add(position.rewardsClaimed)
    }

    return totalRewards
  }

  // Private helper methods

  private async buildStakingTransaction(position: DLMMPosition): Promise<any> {
    // Build staking transaction using Saros Staking SDK
    // This is a placeholder - actual implementation requires SDK integration
    throw new Error("Staking transaction builder not implemented - requires Saros Staking SDK")
  }

  private async buildUnstakingTransaction(stakingPosition: StakingPosition): Promise<any> {
    // Build unstaking transaction
    throw new Error("Unstaking transaction builder not implemented - requires Saros Staking SDK")
  }

  private async buildClaimTransaction(stakingPosition: StakingPosition): Promise<any> {
    // Build claim rewards transaction
    throw new Error("Claim transaction builder not implemented - requires Saros Staking SDK")
  }

  private async calculatePendingRewards(stakingPosition: StakingPosition): Promise<BN> {
    // Calculate pending rewards based on time staked and APY
    const timeStaked = Date.now() - stakingPosition.stakingStartTime
    const daysStaked = timeStaked / (1000 * 60 * 60 * 24)

    const stakedAmount = Number.parseFloat(stakingPosition.stakedAmount.toString())
    const dailyReward = (stakedAmount * stakingPosition.estimatedAPY) / 100 / 365

    const pendingReward = dailyReward * daysStaked

    return new BN(Math.floor(pendingReward * 1e8))
  }

  private estimateStakingAPY(poolPair: string): number {
    // Estimate staking APY based on pool pair
    const apyMap: Record<string, number> = {
      "SOL/USDC": 12.5,
      "SAROS/USDC": 25.0,
      "RAY/SOL": 18.0,
    }

    return apyMap[poolPair] || 15.0
  }
}

export const stakingManager = new StakingManager()
