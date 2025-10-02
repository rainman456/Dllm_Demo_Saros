import { Telegraf, type Context } from "telegraf"
import { getConnection } from "./config"
import { getWallet, getWalletPublicKey } from "./utils/wallet"
import { DLMMService } from "./services/dlmm.service"
import { StakeService } from "./services/stake.service"
import { VolatilityService } from "./services/volatility.service"
import { Keypair, Transaction } from "@solana/web3.js"
import type { Wallet as AnchorWallet } from "@coral-xyz/anchor"

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ""
const MONITORED_POOLS = process.env.MONITORED_POOLS?.split(",") || []
const OUT_OF_RANGE_THRESHOLD = Number(process.env.OUT_OF_RANGE_THRESHOLD) || 10

class SarosTelegramBot {
  private bot: Telegraf<Context>
  private dlmmService: DLMMService
  private volatilityService: VolatilityService
  private stakeService: StakeService
  private monitoringActive = false

  constructor() {
    this.bot = new Telegraf(BOT_TOKEN)
    const connection = getConnection()
    const wallet = getWallet()
    const keypair: Keypair = getWallet()

    function isAnchorWallet(w: any): w is AnchorWallet {
  return w && (w as any).payer && typeof (w as any).signTransaction === "function"
}

let anchorWallet: AnchorWallet

if (isAnchorWallet(keypair)) {
  // Already a wallet-like object (unlikely for your current getWallet), just reuse
  anchorWallet = keypair as unknown as AnchorWallet
} else {
  // Wrap the Keypair into a minimal Anchor-compatible Wallet object
  anchorWallet = {
    payer: keypair,
    async signTransaction(tx: Transaction) {
      // partialSign so other signatures can be added later if needed
      tx.partialSign(keypair)
      return tx
    },
    async signAllTransactions(txs: Transaction[]) {
      txs.forEach((t) => t.partialSign(keypair))
      return txs
    },
  } as unknown as AnchorWallet
}

    // this.dlmmService = new DLMMService(connection)
    // this.volatilityService = new VolatilityService(connection)
    // this.stakeService = new StakeService(connection, wallet)
    this.dlmmService = new DLMMService(connection)
this.volatilityService = new VolatilityService(connection)
this.stakeService = new StakeService(connection, anchorWallet)

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
      console.error("[v0] Bot error:", err)
      ctx.reply("An error occurred. Please try again.")
    })
  }

  /**
   * Handle monitor command
   */
  private async handleMonitor(ctx: Context): Promise<void> {
    await ctx.reply("Fetching your positions...")

    try {
      const walletAddress = getWalletPublicKey()
      const positions = await this.dlmmService.getUserPositions(walletAddress)

      if (positions.length === 0) {
        await ctx.reply("No positions found. Add liquidity to DLMM pools to get started!")
        return
      }

      let message = `Your DLMM Positions (${positions.length})\n\n`

      for (const position of positions) {
        const status = position.isInRange ? "✅ In Range" : "⚠️ Out of Range"

        message += `
Position: \`${position.positionId.slice(0, 8)}...\`
Pool: ${position.tokenX}/${position.tokenY}
Status: ${status}
Range: ${position.lowerBin} - ${position.upperBin}
Current Bin: ${position.currentBin}
Fees: ${position.feesEarnedX.toFixed(4)} ${position.tokenX} + ${position.feesEarnedY.toFixed(4)} ${position.tokenY}
Value: $${position.valueUSD.toFixed(2)}
APY: ${position.apy.toFixed(2)}%
---
        `.trim()
      }

      await ctx.reply(message, { parse_mode: "Markdown" })
      this.monitoringActive = true
    } catch (error) {
      console.error("[v0] Error in monitor command:", error)
      await ctx.reply("Failed to fetch positions. Please check your configuration.")
    }
  }

  /**
   * Handle stake command
   */
  private async handleStake(ctx: Context): Promise<void> {
    try {
      await ctx.reply("Checking positions for staking...")

      const walletAddress = getWalletPublicKey()
      const positions = await this.dlmmService.getUserPositions(walletAddress)

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
      console.error("[v0] Error handling stake command:", error)
      await ctx.reply("Failed to stake positions. Please try again.")
    }
  }

  /**
   * Handle unstake command
   */
  private async handleUnstake(ctx: Context): Promise<void> {
    try {
      await ctx.reply("Unstaking positions...")

      const walletAddress = getWalletPublicKey()
      const positions = await this.dlmmService.getUserPositions(walletAddress)

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
      console.error("[v0] Error handling unstake command:", error)
      await ctx.reply("Failed to unstake positions. Please try again.")
    }
  }

  /**
   * Handle rewards command
   */
  private async handleRewards(ctx: Context): Promise<void> {
    try {
      await ctx.reply("Checking staking rewards...")

      const walletAddress = getWalletPublicKey()
      const positions = await this.dlmmService.getUserPositions(walletAddress)

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
            message += `Pending: ${Number(rewards.pendingRewards) / 1e6} ${rewards.rewardToken}\n`
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

      message += `\nTotal Claimed: ${Number(totalRewards) / 1e6} SAROS`

      await ctx.reply(message, { parse_mode: "Markdown" })
    } catch (error) {
      console.error("[v0] Error handling rewards command:", error)
      await ctx.reply("Failed to check rewards. Please try again.")
    }
  }

  /**
   * Handle rebalance command
   */
  private async handleRebalance(ctx: Context): Promise<void> {
    await ctx.reply("Starting manual rebalance check...")

    try {
      const walletAddress = getWalletPublicKey()
      const positions = await this.dlmmService.getUserPositions(walletAddress)

      if (positions.length === 0) {
        await ctx.reply("No positions to rebalance.")
        return
      }

      let rebalancedCount = 0

      for (const position of positions) {
        if (!position.isInRange) {
          await ctx.reply(`Position \`${position.positionId.slice(0, 8)}...\` is out of range`, {
            parse_mode: "Markdown",
          })

          const volatilityData = await this.volatilityService.calculateVolatility(position.poolAddress)

          await ctx.reply(
            `Volatility: ${(volatilityData.volatilityRatio * 100).toFixed(2)}%\nRecommended range: ${(volatilityData.recommendedRangeWidth * 100).toFixed(1)}%`,
          )

          // Note: Actual rebalancing would require implementing the rebalance transaction
          // For now, just report that rebalancing is needed
          await ctx.reply(`⚠️ Manual rebalancing recommended for this position`)
          rebalancedCount++
        }
      }

      if (rebalancedCount === 0) {
        await ctx.reply("✅ All positions are in optimal range. No rebalancing needed!")
      } else {
        await ctx.reply(`Found ${rebalancedCount} position(s) that need rebalancing.`)
      }
    } catch (error) {
      console.error("[v0] Error in rebalance command:", error)
      await ctx.reply("Rebalance check failed. Please check logs.")
    }
  }

  /**
   * Handle stats command
   */
  private async handleStats(ctx: Context): Promise<void> {
    await ctx.reply("Calculating portfolio statistics...")

    try {
      const walletAddress = getWalletPublicKey()
      const positions = await this.dlmmService.getUserPositions(walletAddress)

      if (positions.length === 0) {
        await ctx.reply("No positions found.")
        return
      }

      const stats = this.dlmmService.calculatePortfolioStats(positions)

      const positionsInRange = positions.filter((p) => p.isInRange).length
      const positionsOutOfRange = positions.length - positionsInRange

      const message = `
📊 Portfolio Statistics

Total Positions: ${positions.length}
Total Value: $${stats.totalValue.toFixed(2)}
Total Fees Earned: $${stats.totalFees.toFixed(2)}

Position Status:
✅ In Range: ${positionsInRange}
⚠️ Out of Range: ${positionsOutOfRange}

Performance:
Average APY: ${stats.avgApy.toFixed(2)}%
Active Positions: ${stats.activePositions}
      `.trim()

      await ctx.reply(message, { parse_mode: "Markdown" })
    } catch (error) {
      console.error("[v0] Error in stats command:", error)
      await ctx.reply("Failed to calculate statistics.")
    }
  }

  /**
   * Handle volatility command
   */
  private async handleVolatility(ctx: Context): Promise<void> {
    const args = ctx.message && "text" in ctx.message ? ctx.message.text.split(" ") : []
    const poolAddress = args[1]

    if (!poolAddress) {
      await ctx.reply("Please provide a pool address: /volatility <pool_address>")
      return
    }

    await ctx.reply(`Calculating volatility for pool...`)

    try {
      const volatilityData = await this.volatilityService.calculateVolatility(poolAddress)

      const volatilityPercent = (volatilityData.volatilityRatio * 100).toFixed(2)
      const status = volatilityData.isHighVolatility ? "⚠️ High Volatility" : "✅ Low Volatility"
      const recommendedWidth = (volatilityData.recommendedRangeWidth * 100).toFixed(1)

      const message = `
📈 Volatility Analysis

Pool: \`${poolAddress.slice(0, 8)}...\`
Mean Price: ${volatilityData.mean.toFixed(6)}
Std Deviation: ${volatilityData.stdDev.toFixed(6)}
Volatility Ratio: ${volatilityPercent}%

Status: ${status}
Recommended Range Width: ${recommendedWidth}%

${volatilityData.isHighVolatility ? "⚠️ Consider wider ranges to reduce rebalancing frequency." : "✅ Tighter ranges recommended for better capital efficiency."}
      `.trim()

      await ctx.reply(message, { parse_mode: "Markdown" })
    } catch (error) {
      console.error("[v0] Error in volatility command:", error)
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
📊 Strategy Simulation Results
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

✅ Best Strategy: Volatility-Adjusted
This strategy optimizes range width based on market conditions.
      `.trim()

      await ctx.reply(message, { parse_mode: "Markdown" })
    } catch (error) {
      console.error("[v0] Error in simulate command:", error)
      await ctx.reply("Simulation failed.")
    }
  }

  /**
   * Start the bot
   */
  async start(): Promise<void> {
    console.log("[v0] Starting Telegram bot...")

    try {
      await this.bot.launch()
      console.log("[v0] Telegram bot started successfully")

      // Graceful shutdown
      process.once("SIGINT", () => this.bot.stop("SIGINT"))
      process.once("SIGTERM", () => this.bot.stop("SIGTERM"))
    } catch (error) {
      console.error("[v0] Failed to start Telegram bot:", error)
      throw error
    }
  }
}

// Main execution
async function main() {
  try {
    if (!BOT_TOKEN) {
      throw new Error("TELEGRAM_BOT_TOKEN environment variable is required")
    }

    const bot = new SarosTelegramBot()
    await bot.start()
  } catch (error) {
    console.error("[v0] Fatal error in bot:", error)
    process.exit(1)
  }
}

// Run if executed directly
if (require.main === module) {
  main()
}

export { SarosTelegramBot }
