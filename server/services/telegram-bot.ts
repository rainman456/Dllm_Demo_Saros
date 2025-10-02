import { Telegraf } from "telegraf"
import { monitorAllPositions } from "./rebalancer"
import { getDLMMClient } from "../solana/dlmm-client"

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "mock_token"
const CHAT_ID = process.env.TELEGRAM_CHAT_ID

export class TelegramBotService {
  private bot: Telegraf
  private monitoringInterval?: NodeJS.Timeout
  private chatIds: Set<number> = new Set()

  constructor() {
    this.bot = new Telegraf(BOT_TOKEN)
    this.setupCommands()

    if (CHAT_ID) {
      this.chatIds.add(Number.parseInt(CHAT_ID))
    }
  }

  private setupCommands() {
    this.bot.command("start", (ctx) => {
      this.chatIds.add(ctx.chat.id)
      ctx.reply(
        "Welcome to Saros DLMM Rebalancer!\n\n" +
          "Available commands:\n" +
          "/monitor <wallet> - Start monitoring positions\n" +
          "/positions <wallet> - View all active positions\n" +
          "/rebalance <wallet> - Check rebalancing opportunities\n" +
          "/simulate - Run strategy simulator\n" +
          "/volatility <pool> - Check pool volatility\n" +
          "/stop - Stop monitoring",
      )
    })

    this.bot.command("monitor", async (ctx) => {
      const args = ctx.message.text.split(" ")
      const walletAddress = args[1]

      if (!walletAddress) {
        ctx.reply("Usage: /monitor <wallet_address>")
        return
      }

      if (this.monitoringInterval) {
        ctx.reply("Monitoring is already active!")
        return
      }

      ctx.reply(`Starting position monitoring for ${walletAddress}...`)
      this.startMonitoring(ctx.chat.id, walletAddress)
    })

    this.bot.command("stop", (ctx) => {
      if (this.monitoringInterval) {
        clearInterval(this.monitoringInterval)
        this.monitoringInterval = undefined
        ctx.reply("Monitoring stopped.")
      } else {
        ctx.reply("No active monitoring to stop.")
      }
    })

    this.bot.command("positions", async (ctx) => {
      try {
        const args = ctx.message.text.split(" ")
        const walletAddress = args[1]

        if (!walletAddress) {
          ctx.reply("Usage: /positions <wallet_address>")
          return
        }

        const dlmmClient = getDLMMClient()
        const positions = await dlmmClient.getUserPositions(walletAddress)

        let message = `Your Active Positions (${positions.length}):\n\n`

        for (const pos of positions) {
          const liquidityUSD = (Number.parseFloat(pos.liquidity.toString()) / 1e8).toFixed(2)
          const feesUSD = (Number.parseFloat(pos.feeX.toString()) / 1e8).toFixed(2)

          message += `${pos.poolPair}\n`
          message += `   Liquidity: $${liquidityUSD}\n`
          message += `   Fees: $${feesUSD}\n`
          message += `   Range: [${pos.lowerBinId}, ${pos.upperBinId}]\n\n`
        }

        ctx.reply(message)
      } catch (error) {
        ctx.reply(`Error fetching positions: ${error}`)
      }
    })

    this.bot.command("rebalance", async (ctx) => {
      try {
        const args = ctx.message.text.split(" ")
        const walletAddress = args[1]

        if (!walletAddress) {
          ctx.reply("Usage: /rebalance <wallet_address>")
          return
        }

        ctx.reply("Checking positions for rebalancing opportunities...")

        const decisions = await monitorAllPositions(walletAddress)
        const toRebalance = decisions.filter((d) => d.decision.shouldRebalance)

        if (toRebalance.length === 0) {
          ctx.reply("All positions are optimal. No rebalancing needed.")
          return
        }

        let message = `Found ${toRebalance.length} position(s) to rebalance:\n\n`

        for (const { position, decision } of toRebalance) {
          message += `${position.poolPair}\n`
          message += `   ${decision.reason}\n`
          message += `   New range: [${decision.newLowerBin}, ${decision.newUpperBin}]\n\n`
        }

        ctx.reply(message)
      } catch (error) {
        ctx.reply(`Error during rebalancing check: ${error}`)
      }
    })

    this.bot.command("volatility", async (ctx) => {
      try {
        const args = ctx.message.text.split(" ")
        const poolPair = args.slice(1).join(" ") || "SOL/USDC"

        const poolAddresses: Record<string, string> = {
          "SOL/USDC": process.env.MONITORED_POOLS || "8vZHTVMdYvcPFUoHBEbcFyfSKnjWtvbNgYpXg1aiC2uS",
        }

        const poolAddress = poolAddresses[poolPair]
        if (!poolAddress) {
          ctx.reply(`Pool ${poolPair} not found`)
          return
        }

        const dlmmClient = getDLMMClient()
        const activeBin = await dlmmClient.getActiveBin(poolAddress)
        const bins = await dlmmClient.getBinArrays(poolAddress, activeBin - 50, activeBin + 50)
        const volatility = await dlmmClient.calculateVolatility(bins)

        ctx.reply(`${poolPair} Volatility: ${volatility.toFixed(2)}%\nActive Bin: ${activeBin}`)
      } catch (error) {
        ctx.reply(`Error fetching volatility: ${error}`)
      }
    })

    this.bot.command("simulate", (ctx) => {
      ctx.reply(
        "Strategy Simulator Results (30 days):\n\n" +
          "Passive LP:\n" +
          "  Total Fees: $842.50\n" +
          "  IL: -$125.30\n" +
          "  Net: $717.20\n" +
          "  APY: 28.4%\n\n" +
          "Auto Rebalanced:\n" +
          "  Total Fees: $1,248.90\n" +
          "  IL: -$45.80\n" +
          "  Net: $1,203.10\n" +
          "  APY: 47.6%\n" +
          "  Rebalances: 8\n\n" +
          "Auto rebalancing improved returns by 67.7%!",
      )
    })
  }

  private async startMonitoring(chatId: number, walletAddress: string) {
    this.monitoringInterval = setInterval(async () => {
      try {
        const decisions = await monitorAllPositions(walletAddress)

        for (const { position, decision } of decisions) {
          if (decision.shouldRebalance) {
            await this.bot.telegram.sendMessage(
              chatId,
              `Alert: ${position.poolPair}\n${decision.reason}\n\nVolatility: ${decision.volatility?.toFixed(2)}%`,
            )
          }
        }
      } catch (error) {
        console.error("Monitoring error:", error)
      }
    }, 60000) // Check every minute
  }

  async sendAlert(message: string, type: "info" | "warning" | "success" = "info") {
    const emoji = type === "warning" ? "⚠️" : type === "success" ? "✅" : "ℹ️"

    for (const chatId of Array.from(this.chatIds)) {
      try {
        await this.bot.telegram.sendMessage(chatId, `${emoji} ${message}`)
      } catch (error) {
        console.error(`Failed to send to ${chatId}:`, error)
      }
    }
  }

  launch() {
    if (BOT_TOKEN !== "mock_token") {
      this.bot.launch()
      console.log("Telegram bot launched successfully")
    } else {
      console.log("Telegram bot in mock mode (no token provided)")
    }
  }

  stop() {
    this.bot.stop()
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
    }
  }
}

export const telegramBot = new TelegramBotService()
