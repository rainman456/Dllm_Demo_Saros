import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Wallet, Copy, ExternalLink, LogOut, CheckCircle2 } from "lucide-react";

interface WalletConnectProps {
  isConnected?: boolean;
  address?: string;
  network?: string;
}

export default function WalletConnect({
  isConnected = false,
  address = "7xKX...9mPq",
  network = "Devnet",
}: WalletConnectProps) {
  const [connected, setConnected] = useState(isConnected);
  const [copied, setCopied] = useState(false);

  const handleConnect = () => {
    console.log("Connecting wallet...");
    setConnected(true);
  };

  const handleDisconnect = () => {
    console.log("Disconnecting wallet...");
    setConnected(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!connected) {
    return (
      <Button onClick={handleConnect} data-testid="button-connect-wallet">
        <Wallet className="w-4 h-4 mr-2" />
        Connect Wallet
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" data-testid="button-wallet-menu">
          <Wallet className="w-4 h-4 mr-2" />
          <span className="font-mono">{address}</span>
          <Badge variant="secondary" className="ml-2">
            {network}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Wallet</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleCopy} data-testid="menu-copy-address">
          {copied ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
          {copied ? "Copied!" : "Copy Address"}
        </DropdownMenuItem>
        <DropdownMenuItem data-testid="menu-view-explorer">
          <ExternalLink className="w-4 h-4 mr-2" />
          View on Explorer
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDisconnect} className="text-destructive" data-testid="menu-disconnect">
          <LogOut className="w-4 h-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
