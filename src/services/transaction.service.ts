import { type Connection, PublicKey } from "@solana/web3.js"
import { LiquidityBookServices, MODE } from "@saros-finance/dlmm-sdk"
import type { WalletContextState } from "@solana/wallet-adapter-react"
import BN from "bn.js"
import type { SDKTokenInfo, PoolMetadata as LocalPoolMetadata } from "@/src/types"

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
   * Map raw SDK pool metadata into a stable local shape
   */
  private async getPoolMetadata(poolAddress: string): Promise<LocalPoolMetadata | null> {
    try {
      const raw: any = await this.liquidityBookServices.fetchPoolMetadata(poolAddress)
      if (!raw) return null

      const mapToken = (t: any): SDKTokenInfo => {
        return {
          mint: t?.mint ?? t?.address ?? t?.tokenMint ?? "",
          decimals: Number(t?.decimals ?? t?.decimalsToken ?? 0),
          symbol: t?.symbol ?? t?.ticker ?? undefined,
        }
      }

      const activeId = raw.activeId ?? raw.active_id ?? raw.active ?? 0
      const binStep = raw.binStep ?? raw.bin_step ?? raw.bin_step_value ?? raw.bin_step_bps ?? 0
      const protocolFeeRate = raw.protocolFeeRate ?? raw.protocol_fee_rate ?? raw.protocolFee ?? 0

      const tokenXRaw = raw.tokenX ?? raw.token_x ?? raw.baseToken ?? raw.tokenBase ?? {}
      const tokenYRaw = raw.tokenY ?? raw.token_y ?? raw.quoteToken ?? raw.tokenQuote ?? {}

      const mapped: LocalPoolMetadata = {
        activeId,
        binStep,
        tokenX: mapToken(tokenXRaw),
        tokenY: mapToken(tokenYRaw),
        protocolFeeRate,
      }

      return mapped
    } catch (error) {
      console.error("[v0] Error mapping pool metadata:", error)
      return null
    }
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
      const metadata = await this.getPoolMetadata(poolAddress)

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
      const signedTx = await wallet.signTransaction(transaction as any)
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
    
    const raw: any = await this.liquidityBookServices.fetchPoolMetadata(poolAddress)
    if (!raw) throw new Error("Pool not found")

  
    const mapToken = (t: any) => ({
      mint: t?.mint ?? t?.address ?? t?.tokenMint ?? "",
      decimals: Number(t?.decimals ?? t?.decimalsToken ?? 0),
      symbol: t?.symbol ?? t?.ticker ?? undefined,
    })

    
    const metadata = {
      tokenX: mapToken(raw.tokenX ?? raw.token_x ?? raw.baseToken ?? raw.tokenBase ?? {}),
      tokenY: mapToken(raw.tokenY ?? raw.token_y ?? raw.quoteToken ?? raw.tokenQuote ?? {}),
    }

    const amountXBigInt = BigInt(Math.floor(amountX * Math.pow(10, metadata.tokenX.decimals)))
    const amountYBigInt = BigInt(Math.floor(amountY * Math.pow(10, metadata.tokenY.decimals)))

    const transaction = await this.liquidityBookServices.addLiquidity({
      pair: new PublicKey(poolAddress),
      position: new PublicKey(positionAddress),
      user: wallet.publicKey,
      totalXAmount: amountXBigInt,
      totalYAmount: amountYBigInt,
      slippage,
    })

    const signedTx = await wallet.signTransaction(transaction)
    const signature = await this.connection.sendRawTransaction(signedTx.serialize())
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
      const signedTx = await wallet.signTransaction(transaction as any)
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
      const signedTx = await wallet.signTransaction(transaction as any)
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
      const metadata = await this.getPoolMetadata(poolAddress)

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
      const signedTx = await wallet.signTransaction(transaction as any)
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
