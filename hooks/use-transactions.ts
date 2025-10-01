"use client"

import { useWallet } from "@solana/wallet-adapter-react"
import { Connection } from "@solana/web3.js"
import { TransactionService } from "../src/services"
import { useState } from "react"

export function useTransactions() {
  const wallet = useWallet()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const connection = new Connection(
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com",
    "confirmed",
  )

  const transactionService = new TransactionService(connection)

  const addLiquidity = async (
    poolAddress: string,
    positionAddress: string,
    amountX: number,
    amountY: number,
    slippageBps?: number,
  ) => {
    setIsLoading(true)
    setError(null)
    try {
      const txId = await transactionService.addLiquidity(
        wallet,
        poolAddress,
        positionAddress,
        amountX,
        amountY,
        slippageBps,
      )
      return txId
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Transaction failed"
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const removeLiquidity = async (poolAddress: string, positionAddress: string, bpsToRemove?: number) => {
    setIsLoading(true)
    setError(null)
    try {
      const txId = await transactionService.removeLiquidity(wallet, poolAddress, positionAddress, bpsToRemove)
      return txId
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Transaction failed"
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const claimFees = async (poolAddress: string, positionAddress: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const txId = await transactionService.claimFees(wallet, poolAddress, positionAddress)
      return txId
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Transaction failed"
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const createPosition = async (
    poolAddress: string,
    lowerBinId: number,
    upperBinId: number,
    amountX: number,
    amountY: number,
    slippageBps?: number,
  ) => {
    setIsLoading(true)
    setError(null)
    try {
      const txId = await transactionService.createPosition(
        wallet,
        poolAddress,
        lowerBinId,
        upperBinId,
        amountX,
        amountY,
        slippageBps,
      )
      return txId
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Transaction failed"
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    addLiquidity,
    removeLiquidity,
    claimFees,
    createPosition,
    isLoading,
    error,
  }
}
