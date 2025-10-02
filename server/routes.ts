import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getUserPositions, getActiveBin, getBinArrays, calculateVolatility } from "./solana/dlmm-mock";
import { monitorAllPositions, executeRebalance } from "./services/rebalancer";
import { telegramBot } from "./services/telegram-bot";
import { insertPositionSchema, insertRebalancingEventSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  app.get("/api/positions/:walletAddress", async (req, res) => {
    try {
      const { walletAddress } = req.params;
      
      const dlmmPositions = await getUserPositions(walletAddress);
      
      const positions = await Promise.all(
        dlmmPositions.map(async (dlmmPos) => {
          const activeBin = await getActiveBin(dlmmPos.poolAddress);
          const isInRange = activeBin >= dlmmPos.lowerBinId && activeBin <= dlmmPos.upperBinId;
          
          let status: "in-range" | "out-of-range" | "rebalancing" = isInRange ? "in-range" : "out-of-range";
          
          const bins = await getBinArrays(dlmmPos.poolAddress, dlmmPos.lowerBinId - 10, dlmmPos.upperBinId + 10);
          const currentPrice = bins.find(b => b.binId === activeBin)?.price.toString() || "0";
          
          return {
            id: dlmmPos.publicKey,
            walletAddress,
            poolPair: dlmmPos.poolPair,
            poolAddress: dlmmPos.poolAddress,
            rangeMin: dlmmPos.lowerBinId.toString(),
            rangeMax: dlmmPos.upperBinId.toString(),
            liquidity: (parseFloat(dlmmPos.liquidity.toString()) / 1e8).toFixed(2),
            feesEarned: (parseFloat(dlmmPos.feeX.toString()) / 1e8).toFixed(2),
            status,
            currentPrice: (parseFloat(currentPrice) / 1e8).toFixed(2),
            binDistribution: dlmmPos.positionBinData,
          };
        })
      );
      
      res.json(positions);
    } catch (error) {
      console.error("Error fetching positions:", error);
      res.status(500).json({ error: "Failed to fetch positions" });
    }
  });

  app.post("/api/positions/:positionId/rebalance", async (req, res) => {
    try {
      const { positionId } = req.params;
      const { newLowerBin, newUpperBin } = req.body;
      
      const positions = await getUserPositions("mock_wallet");
      const position = positions.find(p => p.publicKey === positionId);
      
      if (!position) {
        return res.status(404).json({ error: "Position not found" });
      }
      
      const result = await executeRebalance(position, newLowerBin, newUpperBin);
      
      if (result.success) {
        await storage.createRebalancingEvent({
          positionId,
          type: "rebalance",
          poolPair: position.poolPair,
          message: `Rebalanced to range [${newLowerBin}, ${newUpperBin}]`,
        });
        
        await telegramBot.sendAlert(
          `Successfully rebalanced ${position.poolPair} to range [${newLowerBin}, ${newUpperBin}]`,
          "success"
        );
      }
      
      res.json(result);
    } catch (error) {
      console.error("Rebalance error:", error);
      res.status(500).json({ error: "Rebalancing failed" });
    }
  });

  app.get("/api/monitor/:walletAddress", async (req, res) => {
    try {
      const { walletAddress } = req.params;
      const decisions = await monitorAllPositions(walletAddress);
      
      const results = decisions.map(({ position, decision }) => ({
        positionId: position.publicKey,
        poolPair: position.poolPair,
        shouldRebalance: decision.shouldRebalance,
        reason: decision.reason,
        newLowerBin: decision.newLowerBin,
        newUpperBin: decision.newUpperBin,
        volatility: decision.volatility,
      }));
      
      res.json(results);
    } catch (error) {
      console.error("Monitor error:", error);
      res.status(500).json({ error: "Monitoring failed" });
    }
  });

  app.get("/api/events", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const events = await storage.getRebalancingEvents(limit);
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  app.get("/api/alerts", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const alerts = await storage.getTelegramAlerts(limit);
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch alerts" });
    }
  });

  app.get("/api/volatility/:poolPair", async (req, res) => {
    try {
      const { poolPair } = req.params;
      
      const poolAddresses: Record<string, string> = {
        "SOL/USDC": "Pool1111111111111111111111111111111111111111",
        "SAROS/USDC": "Pool2222222222222222222222222222222222222222",
        "RAY/SOL": "Pool3333333333333333333333333333333333333333",
      };
      
      const poolAddress = poolAddresses[poolPair];
      if (!poolAddress) {
        return res.status(404).json({ error: "Pool not found" });
      }
      
      const activeBin = await getActiveBin(poolAddress);
      const bins = await getBinArrays(poolAddress, activeBin - 50, activeBin + 50);
      
      const volatilityData = [];
      const labels = [];
      
      for (let i = 0; i < 12; i++) {
        const startIdx = i * 8;
        const endIdx = startIdx + 8;
        const segment = bins.slice(startIdx, endIdx);
        
        if (segment.length > 0) {
          const vol = await calculateVolatility(segment);
          volatilityData.push(parseFloat(vol.toFixed(2)));
          labels.push(`${12 - i}h`);
        }
      }
      
      res.json({
        poolPair,
        volatilityData: volatilityData.reverse(),
        labels: labels.reverse(),
      });
    } catch (error) {
      console.error("Volatility error:", error);
      res.status(500).json({ error: "Failed to calculate volatility" });
    }
  });

  app.post("/api/simulate", async (req, res) => {
    try {
      const { initialCapital, duration, volatility } = req.body;
      
      const capital = parseFloat(initialCapital) || 10000;
      const days = parseInt(duration) || 30;
      const vol = volatility || "medium";
      
      const baseAPY = vol === "low" ? 0.25 : vol === "medium" ? 0.35 : 0.45;
      const rebalanceBoost = 1.6;
      
      const passiveFees = capital * baseAPY * (days / 365);
      const passiveIL = capital * 0.015;
      const passiveNet = passiveFees - passiveIL;
      const passiveAPY = (passiveNet / capital) * (365 / days) * 100;
      
      const rebalancedFees = capital * baseAPY * rebalanceBoost * (days / 365);
      const rebalancedIL = capital * 0.005;
      const rebalancedNet = rebalancedFees - rebalancedIL;
      const rebalancedAPY = (rebalancedNet / capital) * (365 / days) * 100;
      const rebalanceCount = Math.floor(days / 4);
      
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
      });
    } catch (error) {
      console.error("Simulation error:", error);
      res.status(500).json({ error: "Simulation failed" });
    }
  });

  app.get("/api/stats/:walletAddress", async (req, res) => {
    try {
      const { walletAddress } = req.params;
      const positions = await getUserPositions(walletAddress);
      
      let totalLiquidity = 0;
      let totalFees = 0;
      
      for (const pos of positions) {
        totalLiquidity += parseFloat(pos.liquidity.toString()) / 1e8;
        totalFees += parseFloat(pos.feeX.toString()) / 1e8;
      }
      
      const avgAPY = positions.length > 0 ? 34.8 : 0;
      
      res.json({
        totalLiquidity: `$${totalLiquidity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        totalFees: `$${totalFees.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        activePositions: positions.length,
        avgAPY: `${avgAPY}%`,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  telegramBot.launch();

  const httpServer = createServer(app);

  return httpServer;
}
