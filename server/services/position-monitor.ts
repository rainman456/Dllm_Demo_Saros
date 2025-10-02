import cron from "node-cron";
import { monitorAllPositions, executeRebalance } from "./rebalancer";
import { telegramBot } from "./telegram-bot";
import { storage } from "../storage";

const MOCK_WALLET = "7xKXYZ123456789abcdefghijklmnopqrstuvwxyz9mPq";

class PositionMonitorService {
  private cronJob?: cron.ScheduledTask;

  startMonitoring() {
    this.cronJob = cron.schedule("*/15 * * * *", async () => {
      console.log("Running automated position monitoring...");
      await this.checkAndRebalancePositions();
    });

    console.log("Position monitoring service started (runs every 15 minutes)");
  }

  async checkAndRebalancePositions() {
    try {
      const decisions = await monitorAllPositions(MOCK_WALLET);

      for (const { position, decision } of decisions) {
        if (decision.shouldRebalance && decision.newLowerBin && decision.newUpperBin) {
          await storage.createRebalancingEvent({
            positionId: position.publicKey,
            type: "alert",
            poolPair: position.poolPair,
            message: decision.reason,
          });

          await storage.createTelegramAlert({
            message: `${position.poolPair}: ${decision.reason}`,
            type: "warning",
          });

          await telegramBot.sendAlert(
            `${position.poolPair}: ${decision.reason}`,
            "warning"
          );

          const result = await executeRebalance(
            position,
            decision.newLowerBin,
            decision.newUpperBin
          );

          if (result.success) {
            await storage.createRebalancingEvent({
              positionId: position.publicKey,
              type: "success",
              poolPair: position.poolPair,
              message: `Rebalanced to range [${decision.newLowerBin}, ${decision.newUpperBin}]`,
            });

            await storage.createTelegramAlert({
              message: `Successfully rebalanced ${position.poolPair}`,
              type: "success",
            });

            await telegramBot.sendAlert(
              `Successfully rebalanced ${position.poolPair} to range [${decision.newLowerBin}, ${decision.newUpperBin}]`,
              "success"
            );
          }
        } else if (decision.volatility && decision.volatility < 5) {
          await storage.createRebalancingEvent({
            positionId: position.publicKey,
            type: "rebalance",
            poolPair: position.poolPair,
            message: `Position healthy. Volatility: ${decision.volatility.toFixed(2)}%`,
          });
        }
      }
    } catch (error) {
      console.error("Position monitoring error:", error);
    }
  }

  stopMonitoring() {
    if (this.cronJob) {
      this.cronJob.stop();
      console.log("Position monitoring service stopped");
    }
  }
}

export const positionMonitor = new PositionMonitorService();
