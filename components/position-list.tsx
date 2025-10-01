"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, ExternalLink, RefreshCw } from "lucide-react"
import { useState } from "react"

interface Position {
  positionId: string
  poolAddress: string
  tokenX: string
  tokenY: string
  lowerBin: number
  upperBin: number
  currentBin: number
  liquidityX: number
  liquidityY: number
  feesEarnedX: number
  feesEarnedY: number
  isInRange: boolean
  valueUSD: number
  apy: number
}

interface PositionListProps {
  positions: Position[]
  onSelectPosition: (poolAddress: string) => void
  isLoading?: boolean
}

export function PositionList({ positions, onSelectPosition, isLoading }: PositionListProps) {
  const [sortBy, setSortBy] = useState<"value" | "apy">("value")

  const sortedPositions = [...positions].sort((a, b) => {
    if (sortBy === "value") return b.valueUSD - a.valueUSD
    return b.apy - a.apy
  })

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (positions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground text-center">
            No active positions found. Add liquidity to a DLMM pool to get started.
          </p>
          <Button className="mt-4" asChild>
            <a href="/pools">Browse Pools</a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Your Positions</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setSortBy(sortBy === "value" ? "apy" : "value")}>
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Sort by {sortBy === "value" ? "APY" : "Value"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedPositions.map((position) => (
            <div
              key={position.positionId}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={() => onSelectPosition(position.poolAddress)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold">
                    {position.tokenX}/{position.tokenY}
                  </h3>
                  <Badge variant={position.isInRange ? "default" : "destructive"}>
                    {position.isInRange ? "In Range" : "Out of Range"}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <div>Value: ${position.valueUSD.toFixed(2)}</div>
                  <div>APY: {position.apy.toFixed(2)}%</div>
                  <div>
                    Fees: {position.feesEarnedX.toFixed(4)} {position.tokenX}
                  </div>
                  <div>
                    Range: {position.lowerBin} - {position.upperBin}
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="mt-2 sm:mt-0">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
