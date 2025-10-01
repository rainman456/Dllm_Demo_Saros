"use client"

import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { Wallet } from "lucide-react"

export function WalletButton() {
  const { connected, publicKey } = useWallet()

  return (
    <div className="flex items-center gap-2">
      {connected && publicKey && (
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted text-sm">
          <Wallet className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono text-xs">
            {publicKey.toBase58().slice(0, 4)}...
            {publicKey.toBase58().slice(-4)}
          </span>
        </div>
      )}
      <WalletMultiButton className="!bg-primary !text-primary-foreground hover:!bg-primary/90 !rounded-lg !h-10 !px-4 !text-sm !font-medium" />
    </div>
  )
}
