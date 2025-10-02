import { Connection, Keypair, type PublicKey, clusterApiUrl } from "@solana/web3.js"
import type BN from "bn.js"
import bs58 from "bs58"

export const SOLANA_NETWORK = (process.env.SOLANA_NETWORK || "devnet") as "devnet" | "mainnet-beta"
export const RPC_ENDPOINT = process.env.SOLANA_RPC_URL || clusterApiUrl(SOLANA_NETWORK)

export const connection = new Connection(RPC_ENDPOINT, {
  commitment: "confirmed",
  confirmTransactionInitialTimeout: 60000,
})

export function loadWalletFromEnv(): Keypair {
  const privateKeyString = process.env.WALLET_PRIVATE_KEY

  if (!privateKeyString) {
    console.warn("WALLET_PRIVATE_KEY not set, generating temporary wallet")
    return Keypair.generate()
  }

  try {
    // First, check if it looks like a JSON array (starts with '[')
    if (privateKeyString.trim().startsWith("[")) {
      try {
        const privateKeyArray = JSON.parse(privateKeyString)
        if (Array.isArray(privateKeyArray)) {
          return Keypair.fromSecretKey(Uint8Array.from(privateKeyArray))
        }
      } catch (jsonErr) {
        console.error("Failed to parse WALLET_PRIVATE_KEY as JSON array:", jsonErr)
      }
    }

    // Try base58 format (most common)
    const privateKeyBytes = bs58.decode(privateKeyString.trim())
    return Keypair.fromSecretKey(privateKeyBytes)
  } catch (err) {
    console.error("Failed to parse WALLET_PRIVATE_KEY in any supported format")
    console.error("Supported formats:")
    console.error("  1. Base58 string (recommended): 5Kd3NBUAdUnhyzenEwVLy9pBKxSwXvE9FMPyR4UKZvpe6E6VUuq")
    console.error("  2. JSON array: [123,45,67,89,...]")
    console.error("Generating temporary wallet for this session...")
    return Keypair.generate()
  }
}

export function generateWallet(): Keypair {
  return Keypair.generate()
}

export async function getBalance(publicKey: PublicKey): Promise<number> {
  try {
    const balance = await connection.getBalance(publicKey)
    return balance / 1e9 // Convert lamports to SOL
  } catch (error) {
    console.error("Error fetching balance:", error)
    return 0
  }
}

export async function airdropSol(publicKey: PublicKey, amount = 2): Promise<string> {
  try {
    const signature = await connection.requestAirdrop(publicKey, amount * 1e9)

    await connection.confirmTransaction(signature, "confirmed")
    return signature
  } catch (error) {
    console.error("Airdrop failed:", error)
    throw new Error(`Airdrop failed: ${error}`)
  }
}

export function parsePrice(price: BN | number | string): string {
  if (typeof price === "string") return price
  if (typeof price === "number") return price.toString()
  return price.toString()
}

export function truncateAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`
}

export async function checkConnection(): Promise<boolean> {
  try {
    const version = await connection.getVersion()
    console.log(`Connected to Solana ${SOLANA_NETWORK}, version:`, version)
    return true
  } catch (error) {
    console.error("Failed to connect to Solana RPC:", error)
    return false
  }
}
