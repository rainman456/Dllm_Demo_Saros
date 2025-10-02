import { useWallet } from "@solana/wallet-adapter-react"
import { useQuery } from "@tanstack/react-query"

export interface Position {
  id: string
  walletAddress: string
  poolPair: string
  poolAddress: string
  rangeMin: string
  rangeMax: string
  liquidity: string
  feesEarned: string
  status: "in-range" | "out-of-range" | "rebalancing"
  currentPrice: string
  binDistribution: number[]
}

export function useWalletPositions() {
  const { publicKey, connected } = useWallet()

  return useQuery<Position[]>({
    queryKey: ["positions", publicKey?.toBase58()],
    queryFn: async () => {
      if (!publicKey) return []

      const response = await fetch(`/api/positions/${publicKey.toBase58()}`)
      if (!response.ok) {
        throw new Error("Failed to fetch positions")
      }

      return response.json()
    },
    enabled: connected && !!publicKey,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 15000,
  })
}

export function usePositionStats() {
  const { publicKey, connected } = useWallet()

  return useQuery({
    queryKey: ["stats", publicKey?.toBase58()],
    queryFn: async () => {
      if (!publicKey) return null

      const response = await fetch(`/api/stats/${publicKey.toBase58()}`)
      if (!response.ok) {
        throw new Error("Failed to fetch stats")
      }

      return response.json()
    },
    enabled: connected && !!publicKey,
    refetchInterval: 30000,
    staleTime: 15000,
  })
}
