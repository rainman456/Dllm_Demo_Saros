import { Logger } from "../utils/logger"
import { config } from "../config"
import type { Position, RebalanceAction } from "../types"

export class TelegramService {
  private botToken: string
  private chatId: string

  constructor() {
    this.botToken = config.telegram.botToken
    this.chatId = config.telegram.chatId
  }

  /**
   * Send message to Telegram
   */
  async sendMessage(message: string): Promise<boolean> {
    if (!this.botToken || !this.chatId) {
      Logger.warn("Telegram not configured, skipping notification")
      return false
    }

    try {
      const response = await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: this.chatId,
          text: message,
          parse_mode: "Markdown",
        }),
      })

      if (!response.ok) {
        throw new Error(`Telegram API error: ${response.statusText}`)
      }

      Logger.info("Telegram message sent")
      return true
    } catch (error) {
      Logger.error("Failed to send Telegram message", error)
      return false
    }
  }

  /**
   * Send position out of range alert
   */
  async sendOutOfRangeAlert(position: Position): Promise<void> {
    const message = `
🚨 *Position Out of Range Alert*

Position ID: \`${position.positionId}\`
Pool: \`${position.poolAddress.slice(0, 8)}...\`
Current Bin: ${position.currentBin}
Range: ${position.lowerBin} - ${position.upperBin}

⚠️ Position is out of optimal range and may need rebalancing.
    `.trim()

    await this.sendMessage(message)
  }

  /**
   * Send rebalance notification
   */
  async sendRebalanceNotification(action: RebalanceAction): Promise<void> {
    const message = `
✅ *Position Rebalanced*

Position ID: \`${action.positionId}\`
Pool: \`${action.poolAddress.slice(0, 8)}...\`
Action: ${action.action}
Reason: ${action.reason}

Old Range: ${action.oldRange.lower} - ${action.oldRange.upper}
${action.newRange ? `New Range: ${action.newRange.lower} - ${action.newRange.upper}` : ""}

${action.txSignature ? `Transaction: \`${action.txSignature}\`` : ""}
Timestamp: ${new Date(action.timestamp).toLocaleString()}
    `.trim()

    await this.sendMessage(message)
  }

  /**
   * Send stop-loss alert
   */
  async sendStopLossAlert(position: Position, currentBin: number): Promise<void> {
    const message = `
🛑 *Stop-Loss Triggered*

Position ID: \`${position.positionId}\`
Pool: \`${position.poolAddress.slice(0, 8)}...\`
Current Bin: ${currentBin}
Threshold Breached: ${position.lowerBin}

Position has been closed to prevent further losses.
    `.trim()

    await this.sendMessage(message)
  }

  /**
   * Send daily summary
   */
  async sendDailySummary(totalPositions: number, rebalancedToday: number, totalFees: number): Promise<void> {
    const message = `
📊 *Daily Summary*

Total Positions: ${totalPositions}
Rebalanced Today: ${rebalancedToday}
Fees Earned: $${totalFees.toFixed(2)}

Keep optimizing your liquidity!
    `.trim()

    await this.sendMessage(message)
  }

  /**
   * Send error alert
   */
  async sendErrorAlert(error: string, context?: string): Promise<void> {
    const message = `
❌ *Error Alert*

${context ? `Context: ${context}\n` : ""}Error: \`${error}\`

Please check the logs for more details.
    `.trim()

    await this.sendMessage(message)
  }
}
