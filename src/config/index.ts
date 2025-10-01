import { Connection } from "@solana/web3.js"

export const config = {
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || "",
    chatId: process.env.TELEGRAM_CHAT_ID || "",
  },
  solana: {
    network: process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet",
    rpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com",
  },
  rebalancer: {
    intervalMinutes: Number.parseInt(process.env.REBALANCE_CHECK_INTERVAL || "5"), // Check every 5 minutes
    volatilityThreshold: Number.parseFloat(process.env.VOLATILITY_THRESHOLD || "0.05"), // 5%
    outOfRangeThreshold: Number.parseFloat(process.env.OUT_OF_RANGE_THRESHOLD || "0.2"), // 20%
    minFeeThreshold: Number.parseFloat(process.env.MIN_FEE_THRESHOLD || "0.01"), // $0.01
    stopLossEnabled: process.env.STOP_LOSS_ENABLED === "true",
    stopLossThreshold: Number.parseFloat(process.env.STOP_LOSS_THRESHOLD || "0.1"), // 10%
  },
  pools: {
    monitored: process.env.MONITORED_POOLS?.split(",") || [],
  },
}

let connectionInstance: Connection | null = null

export function getConnection(): Connection {
  if (!connectionInstance) {
    connectionInstance = new Connection(config.solana.rpcUrl, "confirmed")
  }
  return connectionInstance
}

export function validateConfig(): void {
  if (!config.telegram.botToken) {
    throw new Error("TELEGRAM_BOT_TOKEN environment variable is required")
  }

  if (!config.solana.rpcUrl) {
    throw new Error("NEXT_PUBLIC_SOLANA_RPC_URL environment variable is required")
  }
}
