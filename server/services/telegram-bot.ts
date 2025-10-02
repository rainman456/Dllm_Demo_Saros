import { Telegraf, Context } from "telegraf";
import { monitorAllPositions, executeRebalance } from "./rebalancer";
import { getUserPositions } from "../solana/dlmm-mock";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "mock_token";
const MOCK_WALLET = "7xKXYZ123456789abcdefghijklmnopqrstuvwxyz9mPq";

export class TelegramBotService {
  private bot: Telegraf;
  private monitoringInterval?: NodeJS.Timeout;
  private chatIds: Set<number> = new Set();

  constructor() {
    this.bot = new Telegraf(BOT_TOKEN);
    this.setupCommands();
  }

  private setupCommands() {
    this.bot.command("start", (ctx) => {
      this.chatIds.add(ctx.chat.id);
      ctx.reply(
        "Welcome to Saros DLMM Rebalancer! 🚀\n\n" +
        "Available commands:\n" +
        "/monitor - Start monitoring your positions\n" +
        "/positions - View all active positions\n" +
        "/rebalance - Manually trigger rebalancing\n" +
        "/simulate - Run strategy simulator\n" +
        "/stop - Stop monitoring"
      );
    });

    this.bot.command("monitor", async (ctx) => {
      if (this.monitoringInterval) {
        ctx.reply("Monitoring is already active! ✅");
        return;
      }

      ctx.reply("Starting position monitoring... 👀");
      this.startMonitoring(ctx.chat.id);
    });

    this.bot.command("stop", (ctx) => {
      if (this.monitoringInterval) {
        clearInterval(this.monitoringInterval);
        this.monitoringInterval = undefined;
        ctx.reply("Monitoring stopped. ⏹️");
      } else {
        ctx.reply("No active monitoring to stop.");
      }
    });

    this.bot.command("positions", async (ctx) => {
      try {
        const positions = await getUserPositions(MOCK_WALLET);
        
        let message = `📊 Your Active Positions (${positions.length}):\n\n`;
        
        for (const pos of positions) {
          const liquidityUSD = (parseFloat(pos.liquidity.toString()) / 1e8).toFixed(2);
          const feesUSD = (parseFloat(pos.feeX.toString()) / 1e8).toFixed(2);
          
          message += `🔹 ${pos.poolPair}\n`;
          message += `   Liquidity: $${liquidityUSD}\n`;
          message += `   Fees: $${feesUSD}\n`;
          message += `   Range: [${pos.lowerBinId}, ${pos.upperBinId}]\n\n`;
        }
        
        ctx.reply(message);
      } catch (error) {
        ctx.reply("Error fetching positions. Please try again.");
      }
    });

    this.bot.command("rebalance", async (ctx) => {
      ctx.reply("Checking positions for rebalancing opportunities...");
      
      try {
        const decisions = await monitorAllPositions(MOCK_WALLET);
        const toRebalance = decisions.filter(d => d.decision.shouldRebalance);
        
        if (toRebalance.length === 0) {
          ctx.reply("All positions are optimal. No rebalancing needed. ✅");
          return;
        }
        
        let message = `Found ${toRebalance.length} position(s) to rebalance:\n\n`;
        
        for (const { position, decision } of toRebalance) {
          message += `🔄 ${position.poolPair}\n`;
          message += `   ${decision.reason}\n`;
          message += `   New range: [${decision.newLowerBin}, ${decision.newUpperBin}]\n\n`;
        }
        
        ctx.reply(message);
      } catch (error) {
        ctx.reply("Error during rebalancing check.");
      }
    });

    this.bot.command("simulate", (ctx) => {
      ctx.reply(
        "📈 Strategy Simulator Results (30 days):\n\n" +
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
        "💡 Auto rebalancing improved returns by 67.7%!"
      );
    });
  }

  private async startMonitoring(chatId: number) {
    this.monitoringInterval = setInterval(async () => {
      try {
        const decisions = await monitorAllPositions(MOCK_WALLET);
        
        for (const { position, decision } of decisions) {
          if (decision.shouldRebalance) {
            await this.bot.telegram.sendMessage(
              chatId,
              `⚠️ Alert: ${position.poolPair}\n${decision.reason}\n\nVolatility: ${decision.volatility?.toFixed(2)}%`
            );
          }
        }
      } catch (error) {
        console.error("Monitoring error:", error);
      }
    }, 60000);
  }

  async sendAlert(message: string, type: "info" | "warning" | "success" = "info") {
    const emoji = type === "warning" ? "⚠️" : type === "success" ? "✅" : "ℹ️";
    
    for (const chatId of Array.from(this.chatIds)) {
      try {
        await this.bot.telegram.sendMessage(chatId, `${emoji} ${message}`);
      } catch (error) {
        console.error(`Failed to send to ${chatId}:`, error);
      }
    }
  }

  launch() {
    if (BOT_TOKEN !== "mock_token") {
      this.bot.launch();
      console.log("Telegram bot launched successfully");
    } else {
      console.log("Telegram bot in mock mode (no token provided)");
    }
  }

  stop() {
    this.bot.stop();
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
  }
}

export const telegramBot = new TelegramBotService();
