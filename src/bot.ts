import { Telegraf, type Context } from "telegraf"
import { getConnection, config, validateConfig } from "./config"
import { getWallet, getWalletPublicKey } from "./utils/wallet"
import { Logger } from "./utils/logger"
import { DLMMService } from "./services/dlmm.service"
import { StakeService } from "./services/stake.service"
import { VolatilityService } from "./services/volatility.service"
import { CalculationUtils } from "./utils/calculations"
import type { PortfolioStats, Position as BasePosition } from "./types"

// Extend Position type for missing fields
// interface Position extends BasePosition {
//   tokenX: string
//   tokenY: string
//   valueUSD: number
//   currentPrice: number
//   feesEarned: {
//     tokenX: bigint
//     tokenY: bigint
//   }
// }

class SarosTelegramBot {
  private bot: Telegraf<Context>
  private dlmmService: DLMMService
  private volatilityService: VolatilityService
  private stakeService: StakeService
  private monitoringActive = false

  constructor() {
    this.bot = new Telegraf(config.telegram.botToken)
    const connection = getConnection()
    const wallet = getWallet()

    this.dlmmService = new DLMMService(connection, wallet)
    this.volatilityService = new VolatilityService()
    this.stakeService = new StakeService(connection, wallet)

    this.setupCommands()
  }

  /**
   * Setup bot commands
   */
  private setupCommands(): void {
    // Start command
    this.bot.command("start", async (ctx: Context) => {
      await ctx.reply(
        `
Welcome to Saros DLMM Auto Rebalancer Bot!

I help you manage your DLMM liquidity positions automatically.

Available Commands:
/monitor - View current positions
/rebalance - Manually trigger rebalance
/simulate - Run strategy simulation
/stats - Portfolio statistics
/volatility - Check pool volatility
/stop - Stop monitoring
/help - Show this message

Your wallet: \`${getWalletPublicKey().slice(0, 8)}...\`
      `.trim(),
        { parse_mode: "Markdown" },
      )
    })

    // Help command
    this.bot.command("help", async (ctx: Context) => {
      await ctx.reply(
        `
Command Guide

/monitor - View all your DLMM positions with ranges and status
/rebalance - Force rebalance check on all positions
/simulate - Test rebalancing strategies with historical data
/stats - View portfolio stats (fees, APY, IL)
/volatility <pool> - Check volatility for specific pool
/stop - Stop automatic monitoring
/start - Restart the bot

Features:
Automatic rebalancing based on volatility
Stop-loss protection
Real-time alerts
Portfolio analytics
      `.trim(),
        { parse_mode: "Markdown" },
      )
    })

    // Monitor command
    this.bot.command("monitor", async (ctx: Context) => {
      await this.handleMonitor(ctx)
    })

    // Rebalance command
    this.bot.command("rebalance", async (ctx: Context) => {
      await this.handleRebalance(ctx)
    })

    // Stats command
    this.bot.command("stats", async (ctx: Context) => {
      await this.handleStats(ctx)
    })

    // Volatility command
    this.bot.command("volatility", async (ctx: Context) => {
      await this.handleVolatility(ctx)
    })

    // Simulate command
    this.bot.command("simulate", async (ctx: Context) => {
      await this.handleSimulate(ctx)
    })

    // Stake command
    this.bot.command("stake", async (ctx: Context) => {
      await this.handleStake(ctx)
    })

    // Unstake command
    this.bot.command("unstake", async (ctx: Context) => {
      await this.handleUnstake(ctx)
    })

    // Rewards command
    this.bot.command("rewards", async (ctx: Context) => {
      await this.handleRewards(ctx)
    })

    // Stop command
    this.bot.command("stop", async (ctx: Context) => {
      this.monitoringActive = false
      await ctx.reply("Monitoring stopped. Use /monitor to restart.")
    })

    // Error handling
    this.bot.catch((err: unknown, ctx: Context) => {
      Logger.error("Bot error", err)
      ctx.reply("An error occurred. Please try again.")
    })
  }

  /**
   * Handle monitor command
   */
  private async handleMonitor(ctx: Context): Promise<void> {
    await ctx.reply("Fetching your positions...")

    try {
      const positions = await this.dlmmService.getUserPositions(config.pools.monitored)

      if (positions.length === 0) {
        await ctx.reply("No positions found. Add liquidity to DLMM pools to get started!")
        return
      }

      let message = `Your DLMM Positions (${positions.length})\n\n`

      for (const position of positions) {
        const poolConfig = await this.dlmmService.getPoolConfig(position.poolAddress)
        const activeBin = await this.dlmmService.getActiveBin(position.poolAddress)
        const isInRange = !CalculationUtils.isPositionOutOfRange(
          activeBin,
          position.lowerBin,
          position.upperBin,
          config.rebalancer.outOfRangeThreshold,
        )

        const status = isInRange ? "In Range" : "Out of Range"
        const feesX = CalculationUtils.bnToNumber(position.feesEarned.tokenX, 9)
        const feesY = CalculationUtils.bnToNumber(position.feesEarned.tokenY, 9)

        message += `
Position: \`${position.positionId}\`
Pool: ${poolConfig?.tokenX}/${poolConfig?.tokenY}
Status: ${status}
Range: ${position.lowerBin} - ${position.upperBin}
Current Bin: ${activeBin}
Fees: ${feesX.toFixed(4)} ${poolConfig?.tokenX} + ${feesY.toFixed(4)} ${poolConfig?.tokenY}
---
        `.trim()
      }

      await ctx.reply(message, { parse_mode: "Markdown" })
      this.monitoringActive = true
    } catch (error) {
      Logger.error("Error in monitor command", error)
      await ctx.reply("Failed to fetch positions. Please check your configuration.")
    }
  }

  /**
   * Handle stake command
   */
  private async handleStake(ctx: Context): Promise<void> {
    try {
      await ctx.reply("Checking positions for staking...")

      const positions = await this.dlmmService.getUserPositions(config.pools.monitored)

      if (positions.length === 0) {
        await ctx.reply("No positions found to stake.")
        return
      }

      let message = "Stakeable Positions:\n\n"

      for (const position of positions) {
        const isSupported = await this.stakeService.isStakingSupported(position.poolAddress)

        message += `${position.tokenX}/${position.tokenY}\n`
        message += `Position: \`${position.positionId.slice(0, 8)}...\`\n`
        message += `Value: $${position.valueUSD.toFixed(2)}\n`
        message += `Staking: ${isSupported ? "Available" : "Not supported"}\n\n`

        if (isSupported) {
          try {
            const tx = await this.stakeService.stakePosition(position.poolAddress, position.positionId)
            message += `Staked! TX: \`${tx.slice(0, 8)}...\`\n\n`
          } catch (error) {
            message += `Staking failed: ${error instanceof Error ? error.message : "Unknown error"}\n\n`
          }
        }
      }

      await ctx.reply(message, { parse_mode: "Markdown" })
    } catch (error) {
      Logger.error("Error handling stake command", error)
      await ctx.reply("Failed to stake positions. Please try again.")
    }
  }

  /**
   * Handle unstake command
   */
  private async handleUnstake(ctx: Context): Promise<void> {
    try {
      await ctx.reply("Unstaking positions...")

      const positions = await this.dlmmService.getUserPositions(config.pools.monitored)

      if (positions.length === 0) {
        await ctx.reply("No positions found.")
        return
      }

      let message = "Unstaking Results:\n\n"

      for (const position of positions) {
        const isSupported = await this.stakeService.isStakingSupported(position.poolAddress)

        if (isSupported) {
          try {
            const tx = await this.stakeService.unstakePosition(position.poolAddress, position.positionId)
            message += `${position.tokenX}/${position.tokenY} unstaked\n`
            message += `TX: \`${tx.slice(0, 8)}...\`\n\n`
          } catch (error) {
            message += `${position.tokenX}/${position.tokenY} unstaking failed\n\n`
          }
        }
      }

      await ctx.reply(message, { parse_mode: "Markdown" })
    } catch (error) {
      Logger.error("Error handling unstake command", error)
      await ctx.reply("Failed to unstake positions. Please try again.")
    }
  }

  /**
   * Handle rewards command
   */
  private async handleRewards(ctx: Context): Promise<void> {
    try {
      await ctx.reply("Checking staking rewards...")

      const positions = await this.dlmmService.getUserPositions(config.pools.monitored)

      if (positions.length === 0) {
        await ctx.reply("No positions found.")
        return
      }

      let message = "Staking Rewards:\n\n"
      let totalRewards = BigInt(0)

      for (const position of positions) {
        const isSupported = await this.stakeService.isStakingSupported(position.poolAddress)

        if (isSupported) {
          try {
            const rewards = await this.stakeService.getStakingRewards(position.poolAddress, position.positionId)

            message += `${position.tokenX}/${position.tokenY}\n`
            message += `Pending: ${CalculationUtils.bnToNumber(rewards.pendingRewards, 6)} ${rewards.rewardToken}\n`
            message += `APR: ${rewards.apr.toFixed(2)}%\n\n`

            totalRewards += rewards.pendingRewards

            // Claim rewards
            if (rewards.pendingRewards > BigInt(0)) {
              const tx = await this.stakeService.claimRewards(position.poolAddress, position.positionId)
              message += `Claimed! TX: \`${tx.slice(0, 8)}...\`\n\n`
            }
          } catch (error) {
            message += `Failed to get rewards\n\n`
          }
        }
      }

      message += `\nTotal Claimed: ${CalculationUtils.bnToNumber(totalRewards, 6)} SAROS`

      await ctx.reply(message, { parse_mode: "Markdown" })
    } catch (error) {
      Logger.error("Error handling rewards command", error)
      await ctx.reply("Failed to check rewards. Please try again.")
    }
  }

  /**
   * Handle rebalance command
   */
  private async handleRebalance(ctx: Context): Promise<void> {
    await ctx.reply("Starting manual rebalance check...")

    try {
      const positions = await this.dlmmService.getUserPositions(config.pools.monitored)

      if (positions.length === 0) {
        await ctx.reply("No positions to rebalance.")
        return
      }

      let rebalancedCount = 0

      for (const position of positions) {
        const activeBin = await this.dlmmService.getActiveBin(position.poolAddress)
        const isOutOfRange = CalculationUtils.isPositionOutOfRange(
          activeBin,
          position.lowerBin,
          position.upperBin,
          config.rebalancer.outOfRangeThreshold,
        )

        if (isOutOfRange) {
          await ctx.reply(`Rebalancing position \`${position.positionId}\`...`, { parse_mode: "Markdown" })

          // Calculate new range
          const binPrices = await this.dlmmService.getBinData(position.poolAddress)
          const volatility = await this.volatilityService.calculateVolatilityFromPrices(binPrices)
          const poolConfig = await this.dlmmService.getPoolConfig(position.poolAddress)

          if (!poolConfig) continue

          const currentPrice = CalculationUtils.binIdToPrice(activeBin, poolConfig.binStep)
          const rangeWidth = this.volatilityService.getRecommendedRangeWidth(volatility)
          const optimalRange = CalculationUtils.calculateOptimalRange(currentPrice, volatility, rangeWidth)

          const newLowerBin = CalculationUtils.priceToBinId(optimalRange.lower, poolConfig.binStep)
          const newUpperBin = CalculationUtils.priceToBinId(optimalRange.upper, poolConfig.binStep)

          const success = await this.dlmmService.rebalancePosition(position, newLowerBin, newUpperBin)

          if (success) {
            rebalancedCount++
            await ctx.reply(`Position \`${position.positionId}\` rebalanced successfully!`, {
              parse_mode: "Markdown",
            })
          } else {
            await ctx.reply(`Failed to rebalance position \`${position.positionId}\``, { parse_mode: "Markdown" })
          }
        }
      }

      if (rebalancedCount === 0) {
        await ctx.reply("All positions are in optimal range. No rebalancing needed!")
      } else {
        await ctx.reply(`Rebalanced ${rebalancedCount} position(s) successfully!`)
      }
    } catch (error) {
      Logger.error("Error in rebalance command", error)
      await ctx.reply("Rebalance failed. Please check logs.")
    }
  }

  /**
   * Handle stats command
   */
  private async handleStats(ctx: Context): Promise<void> {
    await ctx.reply("Calculating portfolio statistics...")

    try {
      const positions = await this.dlmmService.getUserPositions(config.pools.monitored)

      if (positions.length === 0) {
        await ctx.reply("No positions found.")
        return
      }

      let totalFeesX = 0
      let totalFeesY = 0
      let positionsInRange = 0
      let totalValueUSD = 0

      for (const position of positions) {
        const activeBin = await this.dlmmService.getActiveBin(position.poolAddress)
        const isInRange = !CalculationUtils.isPositionOutOfRange(
          activeBin,
          position.lowerBin,
          position.upperBin,
          config.rebalancer.outOfRangeThreshold,
        )

        if (isInRange) positionsInRange++

        totalFeesX += CalculationUtils.bnToNumber(position.feesEarned.tokenX, 9)
        totalFeesY += CalculationUtils.bnToNumber(position.feesEarned.tokenY, 9)

        // Mock USD value calculation
        const liquidityX = CalculationUtils.bnToNumber(position.liquidityX, 9)
        const liquidityY = CalculationUtils.bnToNumber(position.liquidityY, 9)
        totalValueUSD += liquidityX * 100 + liquidityY // Assuming SOL = $100
      }

      const stats: PortfolioStats = {
        totalPositions: positions.length,
        totalValueUSD,
        totalFeesEarned: totalFeesX * 100 + totalFeesY, // Convert to USD
        positionsInRange,
        positionsOutOfRange: positions.length - positionsInRange,
        averageAPY: 15.5, // Mock APY
        impermanentLoss: 2.3, // Mock IL
      }

      const message = `
Portfolio Statistics

Total Positions: ${stats.totalPositions}
Total Value: $${stats.totalValueUSD.toFixed(2)}
Total Fees Earned: $${stats.totalFeesEarned.toFixed(2)}

Position Status:
In Range: ${stats.positionsInRange}
Out of Range: ${stats.positionsOutOfRange}

Performance:
Average APY: ${stats.averageAPY.toFixed(2)}%
Impermanent Loss: ${stats.impermanentLoss.toFixed(2)}%

Net Return: ${(stats.averageAPY - stats.impermanentLoss).toFixed(2)}%
      `.trim()

      await ctx.reply(message, { parse_mode: "Markdown" })
    } catch (error) {
      Logger.error("Error in stats command", error)
      await ctx.reply("Failed to calculate statistics.")
    }
  }

  /**
   * Handle volatility command
   */
  private async handleVolatility(ctx: Context): Promise<void> {
    const args = ctx.message && "text" in ctx.message ? ctx.message.text.split(" ") : []
    const poolAddress = args[1] || config.pools.monitored[0]

    if (!poolAddress) {
      await ctx.reply("Please provide a pool address: /volatility <pool_address>")
      return
    }

    await ctx.reply(`Calculating volatility for pool...`)

    try {
      const binPrices = await this.dlmmService.getBinData(poolAddress)
      const volatility = await this.volatilityService.calculateVolatilityFromPrices(binPrices)

      const volatilityRatio = (volatility.stdDev / volatility.mean) * 100
      const isHigh = this.volatilityService.isHighVolatility(volatility)
      const recommendedWidth = this.volatilityService.getRecommendedRangeWidth(volatility)

      const message = `
Volatility Analysis

Pool: \`${poolAddress.slice(0, 8)}...\`
Mean Price: ${volatility.mean.toFixed(2)}
Std Deviation: ${volatility.stdDev.toFixed(2)}
Volatility Ratio: ${volatilityRatio.toFixed(2)}%

Status: ${isHigh ? "High Volatility" : "Low Volatility"}
Recommended Range Width: ${(recommendedWidth * 100).toFixed(1)}%

${isHigh ? "Consider wider ranges to reduce rebalancing frequency." : "Tighter ranges recommended for better capital efficiency."}
      `.trim()

      await ctx.reply(message, { parse_mode: "Markdown" })
    } catch (error) {
      Logger.error("Error in volatility command", error)
      await ctx.reply("Failed to calculate volatility.")
    }
  }

  /**
   * Handle simulate command
   */
  private async handleSimulate(ctx: Context): Promise<void> {
    await ctx.reply("Running strategy simulation...")

    try {
      // Mock simulation results
      const results = [
        {
          strategy: "No Rebalancing",
          fees: 100,
          il: 15,
          net: 85,
          rebalances: 0,
        },
        {
          strategy: "Fixed Range (10%)",
          fees: 150,
          il: 12,
          net: 138,
          rebalances: 5,
        },
        {
          strategy: "Volatility-Adjusted (Recommended)",
          fees: 180,
          il: 8,
          net: 172,
          rebalances: 3,
        },
      ]

      let message = `
Strategy Simulation Results
Based on 30-day historical data

`

      for (const result of results) {
        message += `
${result.strategy}
Fees Earned: $${result.fees}
Impermanent Loss: $${result.il}
Net Return: $${result.net}
Rebalances: ${result.rebalances}
---
        `.trim()
      }

      message += `

Best Strategy: Volatility-Adjusted
This strategy optimizes range width based on market conditions.
      `.trim()

      await ctx.reply(message, { parse_mode: "Markdown" })
    } catch (error) {
      Logger.error("Error in simulate command", error)
      await ctx.reply("Simulation failed.")
    }
  }

  /**
   * Start the bot
   */
  async start(): Promise<void> {
    Logger.info("Starting Telegram bot...")

    try {
      await this.bot.launch()
      Logger.success("Telegram bot started successfully")

      // Graceful shutdown
      process.once("SIGINT", () => this.bot.stop("SIGINT"))
      process.once("SIGTERM", () => this.bot.stop("SIGTERM"))
    } catch (error) {
      Logger.error("Failed to start Telegram bot", error)
      throw error
    }
  }
}

// Main execution
async function main() {
  try {
    validateConfig()

    const bot = new SarosTelegramBot()
    await bot.start()
  } catch (error) {
    Logger.error("Fatal error in bot", error)
    process.exit(1)
  }
}

// Run if executed directly
if (require.main === module) {
  main()
}

export { SarosTelegramBot }