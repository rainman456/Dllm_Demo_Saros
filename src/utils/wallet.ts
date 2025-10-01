import { Keypair } from "@solana/web3.js"
import bs58 from "bs58"

let walletInstance: Keypair | null = null

/**
 * Get or create wallet from private key
 */
export function getWallet(): Keypair {
  if (!walletInstance) {
    const privateKey = process.env.WALLET_PRIVATE_KEY

    if (!privateKey) {
      throw new Error("WALLET_PRIVATE_KEY environment variable is required")
    }

    try {
      // Decode base58 private key
      const secretKey = bs58.decode(privateKey)
      walletInstance = Keypair.fromSecretKey(secretKey)
    } catch (error) {
      throw new Error("Invalid WALLET_PRIVATE_KEY format. Must be base58 encoded.")
    }
  }

  return walletInstance
}

/**
 * Get wallet public key as string
 */
export function getWalletPublicKey(): string {
  return getWallet().publicKey.toBase58()
}
