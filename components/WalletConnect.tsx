"use client"

import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Wallet, Copy, ExternalLink, LogOut, CheckCircle2 } from "lucide-react"
import { useState } from "react"
import { truncateAddress } from "@/lib/utils"

interface WalletConnectProps {
  network?: string
}

export default function WalletConnect({ network = "Devnet" }: WalletConnectProps) {
  const { publicKey, disconnect, connected, wallet } = useWallet()
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toBase58())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleViewExplorer = () => {
    if (publicKey) {
      const explorerUrl = `https://explorer.solana.com/address/${publicKey.toBase58()}?cluster=${network.toLowerCase()}`
      window.open(explorerUrl, "_blank")
    }
  }

  if (!connected || !publicKey) {
    return (
      <WalletMultiButton
        style={{
          backgroundColor: "hsl(var(--primary))",
          color: "hsl(var(--primary-foreground))",
          borderRadius: "var(--radius)",
          height: "40px",
          fontSize: "14px",
          fontWeight: "500",
        }}
      />
    )
  }

  const address = truncateAddress(publicKey.toBase58(), 4)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" data-testid="button-wallet-menu" className="gap-2 bg-transparent">
          <Wallet className="w-4 h-4" />
          <span className="font-mono">{address}</span>
          <Badge variant="secondary" className="ml-1">
            {network}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">{wallet?.adapter.name}</span>
            <span className="text-xs text-muted-foreground font-mono">{address}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleCopy} data-testid="menu-copy-address">
          {copied ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
          {copied ? "Copied!" : "Copy Address"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleViewExplorer} data-testid="menu-view-explorer">
          <ExternalLink className="w-4 h-4 mr-2" />
          View on Explorer
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={disconnect} className="text-destructive" data-testid="menu-disconnect">
          <LogOut className="w-4 h-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
