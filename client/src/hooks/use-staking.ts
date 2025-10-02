import { useWallet } from "@solana/wallet-adapter-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export interface StakingPosition {
  positionId: string
  poolAddress: string
  stakedAmount: string
  rewardsClaimed: string
  stakingStartTime: number
  estimatedAPY: number
}

export function useStakingPositions() {
  const { publicKey, connected } = useWallet()

  return useQuery<{ positions: StakingPosition[]; totalRewards: string }>({
    queryKey: ["staking", publicKey?.toBase58()],
    queryFn: async () => {
      if (!publicKey) return { positions: [], totalRewards: "0" }

      const response = await fetch(`/api/staking/${publicKey.toBase58()}`)
      if (!response.ok) {
        throw new Error("Failed to fetch staking positions")
      }

      return response.json()
    },
    enabled: connected && !!publicKey,
    refetchInterval: 30000,
  })
}

export function useStakePosition() {
  const { publicKey } = useWallet()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (positionId: string) => {
      if (!publicKey) throw new Error("Wallet not connected")

      const response = await fetch(`/api/positions/${positionId}/stake`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: publicKey.toBase58() }),
      })

      if (!response.ok) {
        throw new Error("Failed to stake position")
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staking"] })
      queryClient.invalidateQueries({ queryKey: ["positions"] })
      toast.success("Position staked successfully")
    },
    onError: (error) => {
      toast.error(`Staking failed: ${error}`)
    },
  })
}

export function useClaimRewards() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (positionId: string) => {
      const response = await fetch(`/api/positions/${positionId}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) {
        throw new Error("Failed to claim rewards")
      }

      return response.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["staking"] })
      toast.success(`Claimed ${data.amount} rewards`)
    },
    onError: (error) => {
      toast.error(`Claim failed: ${error}`)
    },
  })
}

export function useConfigureStopLoss() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      positionId,
      enabled,
      percentage,
      targetToken,
    }: {
      positionId: string
      enabled: boolean
      percentage: number
      targetToken: "X" | "Y" | "STABLE"
    }) => {
      const response = await fetch(`/api/positions/${positionId}/stop-loss`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled, percentage, targetToken }),
      })

      if (!response.ok) {
        throw new Error("Failed to configure stop-loss")
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions"] })
      toast.success("Stop-loss configured")
    },
    onError: (error) => {
      toast.error(`Configuration failed: ${error}`)
    },
  })
}
