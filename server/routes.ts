import type { Express } from "express"
import { createServer, type Server } from "http"
import { storage } from "./storage"
import { getDLMMClient } from "./solana/dlmm-client"
import { monitorAllPositions, executeRebalance } from "./services/rebalancer"
import { telegramBot } from "./services/telegram-bot"
import { initializeWebSocketServer } from "./services/websocket-server"
import { volatilityTracker } from "./services/volatility-tracker"
import { stopLossManager } from "./services/stop-loss-manager"
import { stakingManager } from "./services/staking-manager"
import { volatilityAnalyzer } from "./services/volatility-analyzer"

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/positions/:walletAddress", async (req, res) => {
    try {
      const { walletAddress } = req.params

      const dlmmClient = getDLMMClient()
      const dlmmPositions = await dlmmClient.getUserPositions(walletAddress)

      const positions = await Promise.all(
        dlmmPositions.map(async (dlmmPos) => {
          try {
            const activeBin = await dlmmClient.getActiveBin(dlmmPos.poolAddress)
            const isInRange = activeBin >= dlmmPos.lowerBinId && activeBin <= dlmmPos.upperBinId

            const status: "in-range" | "out-of-range" | "rebalancing" = isInRange ? "in-range" : "out-of-range"

            const bins = await dlmmClient.getBinArrays(
              dlmmPos.poolAddress,
              dlmmPos.lowerBinId - 10,
              dlmmPos.upperBinId + 10,
            )
            const currentBin = bins.find((b) => b.binId === activeBin)
            const currentPrice = currentBin ? (Number.parseFloat(currentBin.price.toString()) / 1e8).toFixed(2) : "0"

            return {
              id: dlmmPos.publicKey,
              walletAddress,
              poolPair: dlmmPos.poolPair,
              poolAddress: dlmmPos.poolAddress,
              rangeMin: dlmmPos.lowerBinId.toString(),
              rangeMax: dlmmPos.upperBinId.toString(),
              liquidity: (Number.parseFloat(dlmmPos.liquidity.toString()) / 1e8).toFixed(2),
              feesEarned: (Number.parseFloat(dlmmPos.feeX.toString()) / 1e8).toFixed(2),
              status,
              currentPrice,
              binDistribution: dlmmPos.positionBinData,
            }
          } catch (err) {
            console.error(`Error processing position ${dlmmPos.publicKey}:`, err)
            return null
          }
        }),
      )

      res.json(positions.filter((p) => p !== null))
    } catch (error) {
      console.error("Error fetching positions:", error)
      res.status(500).json({ error: "Failed to fetch positions", details: String(error) })
    }
  })

  app.post("/api/positions/:positionId/rebalance", async (req, res) => {
    try {
      const { positionId } = req.params
      const { newLowerBin, newUpperBin, walletAddress } = req.body

      if (!walletAddress) {
        return res.status(400).json({ error: "walletAddress is required" })
      }

      const dlmmClient = getDLMMClient()
      const positions = await dlmmClient.getUserPositions(walletAddress)
      const position = positions.find((p) => p.publicKey === positionId)

      if (!position) {
        return res.status(404).json({ error: "Position not found" })
      }

      const result = await executeRebalance(position, newLowerBin, newUpperBin)

      if (result.success) {
        await storage.createRebalancingEvent({
          positionId,
          type: "rebalance",
          poolPair: position.poolPair,
          message: `Rebalanced to range [${newLowerBin}, ${newUpperBin}]`,
        })

        await telegramBot.sendAlert(
          `Successfully rebalanced ${position.poolPair} to range [${newLowerBin}, ${newUpperBin}]`,
          "success",
        )
      }

      res.json(result)
    } catch (error) {
      console.error("Rebalance error:", error)
      res.status(500).json({ error: "Rebalancing failed", details: String(error) })
    }
  })

  app.get("/api/monitor/:walletAddress", async (req, res) => {
    try {
      const { walletAddress } = req.params
      const decisions = await monitorAllPositions(walletAddress)

      const results = decisions.map(({ position, decision }) => ({
        positionId: position.publicKey,
        poolPair: position.poolPair,
        shouldRebalance: decision.shouldRebalance,
        reason: decision.reason,
        newLowerBin: decision.newLowerBin,
        newUpperBin: decision.newUpperBin,
        volatility: decision.volatility,
      }))

      res.json(results)
    } catch (error) {
      console.error("Monitor error:", error)
      res.status(500).json({ error: "Monitoring failed", details: String(error) })
    }
  })

  app.get("/api/events", async (req, res) => {
    try {
      const limit = Number.parseInt(req.query.limit as string) || 50
      const events = await storage.getRebalancingEvents(limit)
      res.json(events)
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch events" })
    }
  })

  app.get("/api/alerts", async (req, res) => {
    try {
      const limit = Number.parseInt(req.query.limit as string) || 20
      const alerts = await storage.getTelegramAlerts(limit)
      res.json(alerts)
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch alerts" })
    }
  })

  app.get("/api/volatility/:poolPair", async (req, res) => {
    try {
      const { poolPair } = req.params

      // Map pool pairs to devnet addresses
      const poolAddresses: Record<string, string> = {
        "SOL/USDC": process.env.MONITORED_POOLS || "8vZHTVMdYvcPFUoHBEbcFyfSKnjWtvbNgYpXg1aiC2uS",
      }

      const poolAddress = poolAddresses[poolPair]
      if (!poolAddress) {
        return res.status(404).json({ error: "Pool not found" })
      }

      const dlmmClient = getDLMMClient()
      const activeBin = await dlmmClient.getActiveBin(poolAddress)
      const bins = await dlmmClient.getBinArrays(poolAddress, activeBin - 50, activeBin + 50)

      const volatilityData = []
      const labels = []

      // Calculate volatility for 12 time segments
      for (let i = 0; i < 12; i++) {
        const startIdx = i * 8
        const endIdx = startIdx + 8
        const segment = bins.slice(startIdx, endIdx)

        if (segment.length > 0) {
          const vol = await dlmmClient.calculateVolatility(segment)
          volatilityData.push(Number.parseFloat(vol.toFixed(2)))
          labels.push(`${12 - i}h`)
        }
      }

      res.json({
        poolPair,
        volatilityData: volatilityData.reverse(),
        labels: labels.reverse(),
      })
    } catch (error) {
      console.error("Volatility error:", error)
      res.status(500).json({ error: "Failed to calculate volatility", details: String(error) })
    }
  })

  app.get("/api/volatility/:poolPair/history", async (req, res) => {
    try {
      const { poolPair } = req.params
      const hours = Number.parseInt(req.query.hours as string) || 24

      const poolAddresses: Record<string, string> = {
        "SOL/USDC": process.env.MONITORED_POOLS || "8vZHTVMdYvcPFUoHBEbcFyfSKnjWtvbNgYpXg1aiC2uS",
      }

      const poolAddress = poolAddresses[poolPair]
      if (!poolAddress) {
        return res.status(404).json({ error: "Pool not found" })
      }

      const history = await volatilityTracker.getVolatilityHistory(poolAddress, hours)
      const trend = volatilityTracker.getVolatilityTrend(poolAddress)

      res.json({
        poolPair,
        history,
        trend,
        dataPoints: history.length,
      })
    } catch (error) {
      console.error("Volatility history error:", error)
      res.status(500).json({ error: "Failed to fetch volatility history" })
    }
  })

  app.get("/api/monitoring/status", async (req, res) => {
    try {
      const { walletAddress } = req.query

      if (!walletAddress) {
        return res.status(400).json({ error: "walletAddress required" })
      }

      const decisions = await monitorAllPositions(walletAddress as string)
      const alerts = decisions.filter((d) => d.decision.shouldRebalance)

      res.json({
        monitoring: true,
        walletAddress,
        totalPositions: decisions.length,
        alertCount: alerts.length,
        alerts: alerts.map((a) => ({
          poolPair: a.position.poolPair,
          reason: a.decision.reason,
          volatility: a.decision.volatility,
        })),
        timestamp: Date.now(),
      })
    } catch (error) {
      console.error("Monitoring status error:", error)
      res.status(500).json({ error: "Failed to fetch monitoring status" })
    }
  })

  app.post("/api/simulate", async (req, res) => {
    try {
      const { initialCapital, duration, volatility } = req.body

      const capital = Number.parseFloat(initialCapital) || 10000
      const days = Number.parseInt(duration) || 30
      const vol = volatility || "medium"

      const baseAPY = vol === "low" ? 0.25 : vol === "medium" ? 0.35 : 0.45
      const rebalanceBoost = 1.6

      const passiveFees = capital * baseAPY * (days / 365)
      const passiveIL = capital * 0.015
      const passiveNet = passiveFees - passiveIL
      const passiveAPY = (passiveNet / capital) * (365 / days) * 100

      const rebalancedFees = capital * baseAPY * rebalanceBoost * (days / 365)
      const rebalancedIL = capital * 0.005
      const rebalancedNet = rebalancedFees - rebalancedIL
      const rebalancedAPY = (rebalancedNet / capital) * (365 / days) * 100
      const rebalanceCount = Math.floor(days / 4)

      res.json({
        passive: {
          strategy: "Passive LP",
          totalFees: `$${passiveFees.toFixed(2)}`,
          impermanentLoss: `-$${passiveIL.toFixed(2)}`,
          netReturn: `$${passiveNet.toFixed(2)}`,
          apy: `${passiveAPY.toFixed(1)}%`,
          rebalanceCount: 0,
        },
        rebalanced: {
          strategy: "Auto Rebalanced",
          totalFees: `$${rebalancedFees.toFixed(2)}`,
          impermanentLoss: `-$${rebalancedIL.toFixed(2)}`,
          netReturn: `$${rebalancedNet.toFixed(2)}`,
          apy: `${rebalancedAPY.toFixed(1)}%`,
          rebalanceCount,
        },
      })
    } catch (error) {
      console.error("Simulation error:", error)
      res.status(500).json({ error: "Simulation failed" })
    }
  })

  app.get("/api/stats/:walletAddress", async (req, res) => {
    try {
      const { walletAddress } = req.params
      const dlmmClient = getDLMMClient()
      const positions = await dlmmClient.getUserPositions(walletAddress)

      let totalLiquidity = 0
      let totalFees = 0

      for (const pos of positions) {
        totalLiquidity += Number.parseFloat(pos.liquidity.toString()) / 1e8
        totalFees += Number.parseFloat(pos.feeX.toString()) / 1e8
      }

      const avgAPY = positions.length > 0 ? 34.8 : 0

      res.json({
        totalLiquidity: `$${totalLiquidity.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        totalFees: `$${totalFees.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        activePositions: positions.length,
        avgAPY: `${avgAPY}%`,
      })
    } catch (error) {
      console.error("Stats error:", error)
      res.status(500).json({ error: "Failed to fetch stats", details: String(error) })
    }
  })

  app.post("/api/positions/:positionId/stop-loss", async (req, res) => {
    try {
      const { positionId } = req.params
      const { enabled, percentage, targetToken } = req.body

      stopLossManager.setStopLoss(positionId, {
        enabled,
        percentage,
        targetToken,
      })

      res.json({ success: true, message: "Stop-loss configured" })
    } catch (error) {
      console.error("Stop-loss config error:", error)
      res.status(500).json({ error: "Failed to configure stop-loss" })
    }
  })

  app.post("/api/positions/:positionId/staking", async (req, res) => {
    try {
      const { positionId } = req.params
      const { enabled, autoStake, minLiquidityThreshold } = req.body

      stakingManager.setStakingConfig(positionId, {
        enabled,
        autoStake,
        minLiquidityThreshold,
      })

      res.json({ success: true, message: "Staking configured" })
    } catch (error) {
      console.error("Staking config error:", error)
      res.status(500).json({ error: "Failed to configure staking" })
    }
  })

  app.post("/api/positions/:positionId/stake", async (req, res) => {
    try {
      const { positionId } = req.params
      const { walletAddress } = req.body

      const dlmmClient = getDLMMClient()
      const positions = await dlmmClient.getUserPositions(walletAddress)
      const position = positions.find((p) => p.publicKey === positionId)

      if (!position) {
        return res.status(404).json({ error: "Position not found" })
      }

      const result = await stakingManager.stakePosition(position)

      res.json(result)
    } catch (error) {
      console.error("Stake error:", error)
      res.status(500).json({ error: "Failed to stake position" })
    }
  })

  app.post("/api/positions/:positionId/claim", async (req, res) => {
    try {
      const { positionId } = req.params

      const result = await stakingManager.claimRewards(positionId)

      res.json(result)
    } catch (error) {
      console.error("Claim error:", error)
      res.status(500).json({ error: "Failed to claim rewards" })
    }
  })

  app.get("/api/staking/:walletAddress", async (req, res) => {
    try {
      const { walletAddress } = req.params

      const stakingPositions = await stakingManager.getStakingPositions(walletAddress)
      const totalRewards = await stakingManager.calculateTotalRewards(walletAddress)

      res.json({
        positions: stakingPositions,
        totalRewards: totalRewards.toString(),
      })
    } catch (error) {
      console.error("Staking positions error:", error)
      res.status(500).json({ error: "Failed to fetch staking positions" })
    }
  })

  app.get("/api/volatility-metrics/:poolAddress", async (req, res) => {
    try {
      const { poolAddress } = req.params

      const metrics = await volatilityAnalyzer.analyzeVolatility(poolAddress)

      res.json(metrics)
    } catch (error) {
      console.error("Volatility metrics error:", error)
      res.status(500).json({ error: "Failed to fetch volatility metrics" })
    }
  })

  telegramBot.launch()

  const httpServer = createServer(app)

  initializeWebSocketServer(httpServer)

  const monitoredPools = (process.env.MONITORED_POOLS || "").split(",").filter((p) => p.trim())
  if (monitoredPools.length > 0) {
    volatilityTracker.startTracking(monitoredPools)
  }

  return httpServer
}
