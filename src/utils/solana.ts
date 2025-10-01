import { Connection, Keypair } from "@solana/web3.js"
import { config } from "../config"
import bs58 from "bs58"

export function getConnection(): Connection {
  return new Connection(config.solana.rpcUrl, "confirmed")
}

export function getWallet(): Keypair {
  if (!config.wallet.privateKey) {
    throw new Error("WALLET_PRIVATE_KEY not configured")
  }

  try {
    const privateKeyBytes = bs58.decode(config.wallet.privateKey)
    return Keypair.fromSecretKey(privateKeyBytes)
  } catch (error) {
    throw new Error("Invalid wallet private key format")
  }
}
