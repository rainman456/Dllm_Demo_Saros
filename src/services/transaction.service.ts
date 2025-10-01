import { type Connection, PublicKey } from "@solana/web3.js"
import { LiquidityBookServices, MODE } from "@saros-finance/dlmm-sdk"
import type { WalletContextState } from "@solana/wallet-adapter-react"
import BN from "bn.js"

export class TransactionService {
  private connection: Connection
  private liquidityBookServices: LiquidityBookServices

  constructor(connection: Connection) {
    this.connection = connection

    this.liquidityBookServices = new LiquidityBookServices({
      mode: process.env.NEXT_PUBLIC_SOLANA_NETWORK === "mainnet-beta" ? MODE.MAINNET : MODE.DEVNET,
    })
  }

  /**
   * Swap tokens using Saros DLMM
   */
  async swap(
    wallet: WalletContextState,
    poolAddress: string,
    amountIn: number,
    swapForY: boolean,
    slippage = 0.5,
  ): Promise<string> {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet not connected")
    }

    try {
      const metadata = await this.liquidityBookServices.fetchPoolMetadata(poolAddress)

      if (!metadata) {
        throw new Error("Pool not found")
      }

      // Get quote first
      const decimals = swapForY ? metadata.tokenX.decimals : metadata.tokenY.decimals
      const amountInBigInt = BigInt(Math.floor(amountIn * Math.pow(10, decimals)))

      const quoteData = await this.liquidityBookServices.getQuote({
        amount: amountInBigInt,
        isExactInput: true,
        swapForY,
        pair: new PublicKey(poolAddress),
        tokenBase: new PublicKey(metadata.tokenX.mint),
        tokenQuote: new PublicKey(metadata.tokenY.mint),
        tokenBaseDecimal: metadata.tokenX.decimals,
        tokenQuoteDecimal: metadata.tokenY.decimals,
        slippage,
      })

      // Create swap transaction
      const transaction = await this.liquidityBookServices.swap({
        amount: quoteData.amount,
        tokenMintX: new PublicKey(metadata.tokenX.mint),
        tokenMintY: new PublicKey(metadata.tokenY.mint),
        otherAmountOffset: quoteData.otherAmountOffset,
        hook: new PublicKey(this.liquidityBookServices.hooksConfig),
        isExactInput: true,
        swapForY,
        pair: new PublicKey(poolAddress),
        payer: wallet.publicKey,
      })

      // Sign and send
      const signedTx = await wallet.signTransaction(transaction)
      const signature = await this.connection.sendRawTransaction(signedTx.serialize(), {
        skipPreflight: true,
        preflightCommitment: "confirmed",
      })

      // Confirm
      const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash()
      await this.connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      })

      console.log("[v0] Swap transaction confirmed:", signature)
      return signature
    } catch (error) {
      console.error("[v0] Error executing swap:", error)
      throw new Error("Failed to execute swap")
    }
  }

  /**
   * Add liquidity to a DLMM position
   */
  async addLiquidity(
    wallet: WalletContextState,
    poolAddress: string,
    positionAddress: string,
    amountX: number,
    amountY: number,
    slippage = 0.5,
  ): Promise<string> {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet not connected")
    }

    try {
      const metadata = await this.liquidityBookServices.fetchPoolMetadata(poolAddress)

      if (!metadata) {
        throw new Error("Pool not found")
      }

      // Convert amounts to proper format
      const amountXBigInt = BigInt(Math.floor(amountX * Math.pow(10, metadata.tokenX.decimals)))
      const amountYBigInt = BigInt(Math.floor(amountY * Math.pow(10, metadata.tokenY.decimals)))

      // Create add liquidity transaction using Saros SDK
      const transaction = await this.liquidityBookServices.addLiquidity({
        pair: new PublicKey(poolAddress),
        position: new PublicKey(positionAddress),
        user: wallet.publicKey,
        totalXAmount: amountXBigInt,
        totalYAmount: amountYBigInt,
        slippage,
      })

      // Sign and send
      const signedTx = await wallet.signTransaction(transaction)
      const signature = await this.connection.sendRawTransaction(signedTx.serialize())

      // Confirm
      await this.connection.confirmTransaction(signature, "confirmed")

      console.log("[v0] Add liquidity transaction confirmed:", signature)
      return signature
    } catch (error) {
      console.error("[v0] Error adding liquidity:", error)
      throw new Error("Failed to add liquidity")
    }
  }

  /**
   * Remove liquidity from a DLMM position
   */
  async removeLiquidity(
    wallet: WalletContextState,
    poolAddress: string,
    positionAddress: string,
    percentage = 100,
  ): Promise<string> {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet not connected")
    }

    try {
      const bps = Math.floor((percentage / 100) * 10000)

      // Create remove liquidity transaction
      const transaction = await this.liquidityBookServices.removeLiquidity({
        pair: new PublicKey(poolAddress),
        position: new PublicKey(positionAddress),
        user: wallet.publicKey,
        bps: new BN(bps),
        shouldClaimAndClose: percentage === 100,
      })

      // Sign and send
      const signedTx = await wallet.signTransaction(transaction)
      const signature = await this.connection.sendRawTransaction(signedTx.serialize())

      // Confirm
      await this.connection.confirmTransaction(signature, "confirmed")

      console.log("[v0] Remove liquidity transaction confirmed:", signature)
      return signature
    } catch (error) {
      console.error("[v0] Error removing liquidity:", error)
      throw new Error("Failed to remove liquidity")
    }
  }

  /**
   * Claim fees from a position
   */
  async claimFees(wallet: WalletContextState, poolAddress: string, positionAddress: string): Promise<string> {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet not connected")
    }

    try {
      // Create claim transaction
      const transaction = await this.liquidityBookServices.claimFee({
        pair: new PublicKey(poolAddress),
        position: new PublicKey(positionAddress),
        owner: wallet.publicKey,
      })

      // Sign and send
      const signedTx = await wallet.signTransaction(transaction)
      const signature = await this.connection.sendRawTransaction(signedTx.serialize())

      // Confirm
      await this.connection.confirmTransaction(signature, "confirmed")

      console.log("[v0] Claim fees transaction confirmed:", signature)
      return signature
    } catch (error) {
      console.error("[v0] Error claiming fees:", error)
      throw new Error("Failed to claim fees")
    }
  }

  /**
   * Create a new DLMM position
   */
  async createPosition(
    wallet: WalletContextState,
    poolAddress: string,
    lowerBinId: number,
    upperBinId: number,
    amountX: number,
    amountY: number,
    slippage = 0.5,
  ): Promise<string> {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error("Wallet not connected")
    }

    try {
      const metadata = await this.liquidityBookServices.fetchPoolMetadata(poolAddress)

      if (!metadata) {
        throw new Error("Pool not found")
      }

      // Convert amounts
      const amountXBigInt = BigInt(Math.floor(amountX * Math.pow(10, metadata.tokenX.decimals)))
      const amountYBigInt = BigInt(Math.floor(amountY * Math.pow(10, metadata.tokenY.decimals)))

      // Create position transaction
      const transaction = await this.liquidityBookServices.initializePosition({
        pair: new PublicKey(poolAddress),
        user: wallet.publicKey,
        lowerBinId,
        width: upperBinId - lowerBinId,
        totalXAmount: amountXBigInt,
        totalYAmount: amountYBigInt,
        slippage,
      })

      // Sign and send
      const signedTx = await wallet.signTransaction(transaction)
      const signature = await this.connection.sendRawTransaction(signedTx.serialize())

      // Confirm
      await this.connection.confirmTransaction(signature, "confirmed")

      console.log("[v0] Create position transaction confirmed:", signature)
      return signature
    } catch (error) {
      console.error("[v0] Error creating position:", error)
      throw new Error("Failed to create position")
    }
  }
}
