import cron from "node-cron"
import { monitorAllPositions, executeRebalance } from "./rebalancer"
import { telegramBot } from "./telegram-bot"
import { storage } from "../storage"

const MONITORED_WALLET = process.env.MONITORED_WALLET || ""

class PositionMonitorService {
  private cronJob?: cron.ScheduledTask

  startMonitoring() {
    if (!MONITORED_WALLET) {
      console.warn("MONITORED_WALLET not set, automated monitoring disabled")
      return
    }

    const interval = process.env.REBALANCE_INTERVAL_MINUTES || "15"

    this.cronJob = cron.schedule(`*/${interval} * * * *`, async () => {
      console.log(`Running automated position monitoring for ${MONITORED_WALLET}...`)
      await this.checkAndRebalancePositions()
    })

    console.log(`Position monitoring service started (runs every ${interval} minutes)`)
  }

  async checkAndRebalancePositions() {
    try {
      const decisions = await monitorAllPositions(MONITORED_WALLET)

      for (const { position, decision } of decisions) {
        if (decision.shouldRebalance && decision.newLowerBin && decision.newUpperBin) {
          await storage.createRebalancingEvent({
            positionId: position.publicKey,
            type: "alert",
            poolPair: position.poolPair,
            message: decision.reason,
          })

          await storage.createTelegramAlert({
            message: `${position.poolPair}: ${decision.reason}`,
            type: "warning",
          })

          await telegramBot.sendAlert(`${position.poolPair}: ${decision.reason}`, "warning")

          const autoRebalance = process.env.AUTO_REBALANCE_ENABLED === "true"

          if (autoRebalance) {
            const result = await executeRebalance(position, decision.newLowerBin, decision.newUpperBin)

            if (result.success) {
              await storage.createRebalancingEvent({
                positionId: position.publicKey,
                type: "success",
                poolPair: position.poolPair,
                message: `Rebalanced to range [${decision.newLowerBin}, ${decision.newUpperBin}]`,
              })

              await storage.createTelegramAlert({
                message: `Successfully rebalanced ${position.poolPair}`,
                type: "success",
              })

              await telegramBot.sendAlert(
                `Successfully rebalanced ${position.poolPair} to range [${decision.newLowerBin}, ${decision.newUpperBin}]`,
                "success",
              )
            }
          }
        } else if (decision.volatility && decision.volatility < 5) {
          await storage.createRebalancingEvent({
            positionId: position.publicKey,
            type: "rebalance",
            poolPair: position.poolPair,
            message: `Position healthy. Volatility: ${decision.volatility.toFixed(2)}%`,
          })
        }
      }
    } catch (error) {
      console.error("Position monitoring error:", error)
    }
  }

  stopMonitoring() {
    if (this.cronJob) {
      this.cronJob.stop()
      console.log("Position monitoring service stopped")
    }
  }
}

export const positionMonitor = new PositionMonitorService()
