"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, AlertTriangle, CheckCircle, Settings } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import type { Position } from "@/hooks/use-wallet-positions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useState } from "react"
import { useConfigureStopLoss, useStakePosition } from "@/hooks/use-staking"

interface PositionCardProps {
  position: Position
}

export default function PositionCard({ position }: PositionCardProps) {
  const [stopLossEnabled, setStopLossEnabled] = useState(false)
  const [stopLossPercentage, setStopLossPercentage] = useState(15)

  const configureStopLoss = useConfigureStopLoss()
  const stakePosition = useStakePosition()

  const statusConfig = {
    "in-range": {
      icon: <CheckCircle className="w-4 h-4" />,
      color: "bg-green-500/10 text-green-500 border-green-500/20",
      label: "In Range",
    },
    "out-of-range": {
      icon: <AlertTriangle className="w-4 h-4" />,
      color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      label: "Out of Range",
    },
    rebalancing: {
      icon: <TrendingUp className="w-4 h-4" />,
      color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      label: "Rebalancing",
    },
  }

  const status = statusConfig[position.status]

  const handleSaveStopLoss = () => {
    configureStopLoss.mutate({
      positionId: position.id,
      enabled: stopLossEnabled,
      percentage: stopLossPercentage,
      targetToken: "STABLE",
    })
  }

  const handleStake = () => {
    stakePosition.mutate(position.id)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl">{position.poolPair}</CardTitle>
            <CardDescription className="font-mono text-xs mt-1">
              {position.poolAddress.slice(0, 8)}...{position.poolAddress.slice(-8)}
            </CardDescription>
          </div>
          <Badge variant="outline" className={status.color}>
            {status.icon}
            <span className="ml-1">{status.label}</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Liquidity</p>
            <p className="text-2xl font-bold">{formatCurrency(position.liquidity)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Fees Earned</p>
            <p className="text-2xl font-bold text-green-500">{formatCurrency(position.feesEarned)}</p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Price Range</p>
            <p className="text-sm font-mono">Current: {formatCurrency(position.currentPrice)}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatCurrency(position.rangeMin)}</span>
              <span>{formatCurrency(position.rangeMax)}</span>
            </div>
            <Progress value={65} className="h-2" />
          </div>
        </div>

        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                <Settings className="w-4 h-4 mr-2" />
                Configure
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Position Settings</DialogTitle>
                <DialogDescription>Configure stop-loss and staking for {position.poolPair}</DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="stop-loss">Enable Stop-Loss</Label>
                    <Switch id="stop-loss" checked={stopLossEnabled} onCheckedChange={setStopLossEnabled} />
                  </div>
                  {stopLossEnabled && (
                    <div className="space-y-2">
                      <Label htmlFor="percentage">Trigger Percentage</Label>
                      <Input
                        id="percentage"
                        type="number"
                        value={stopLossPercentage}
                        onChange={(e) => setStopLossPercentage(Number.parseFloat(e.target.value))}
                        min={1}
                        max={50}
                      />
                      <p className="text-xs text-muted-foreground">
                        Automatically exit position if price drops by {stopLossPercentage}%
                      </p>
                    </div>
                  )}
                </div>
                <Button onClick={handleSaveStopLoss} className="w-full">
                  Save Settings
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button size="sm" className="flex-1" onClick={handleStake}>
            <TrendingUp className="w-4 h-4 mr-2" />
            Stake for Yield
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
