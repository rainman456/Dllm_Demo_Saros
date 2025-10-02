"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMutation } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"

export default function Simulator() {
  const [initialCapital, setInitialCapital] = useState("10000")
  const [duration, setDuration] = useState("30")
  const [volatility, setVolatility] = useState("medium")

  const simulateMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initialCapital, duration, volatility }),
      })
      return response.json()
    },
  })

  const handleSimulate = () => {
    simulateMutation.mutate()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h2 className="text-3xl font-bold mb-2">Strategy Simulator</h2>
          <p className="text-muted-foreground">Compare passive LP vs automated rebalancing strategies</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Simulation Parameters</CardTitle>
            <CardDescription>Configure your simulation settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capital">Initial Capital ($)</Label>
                <Input
                  id="capital"
                  type="number"
                  value={initialCapital}
                  onChange={(e) => setInitialCapital(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (days)</Label>
                <Input id="duration" type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="volatility">Market Volatility</Label>
                <Select value={volatility} onValueChange={setVolatility}>
                  <SelectTrigger id="volatility">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleSimulate} disabled={simulateMutation.isPending} className="w-full">
              {simulateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Run Simulation
            </Button>
          </CardContent>
        </Card>

        {simulateMutation.data && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>{simulateMutation.data.passive.strategy}</CardTitle>
                <CardDescription>Traditional liquidity provision</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Fees:</span>
                  <span className="font-semibold">{simulateMutation.data.passive.totalFees}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Impermanent Loss:</span>
                  <span className="font-semibold text-red-500">{simulateMutation.data.passive.impermanentLoss}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Net Return:</span>
                  <span className="font-semibold text-green-500">{simulateMutation.data.passive.netReturn}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-semibold">APY:</span>
                  <span className="text-xl font-bold">{simulateMutation.data.passive.apy}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary">
              <CardHeader>
                <CardTitle>{simulateMutation.data.rebalanced.strategy}</CardTitle>
                <CardDescription>With automated rebalancing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Fees:</span>
                  <span className="font-semibold">{simulateMutation.data.rebalanced.totalFees}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Impermanent Loss:</span>
                  <span className="font-semibold text-red-500">{simulateMutation.data.rebalanced.impermanentLoss}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Net Return:</span>
                  <span className="font-semibold text-green-500">{simulateMutation.data.rebalanced.netReturn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rebalances:</span>
                  <span className="font-semibold">{simulateMutation.data.rebalanced.rebalanceCount}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-semibold">APY:</span>
                  <span className="text-xl font-bold text-primary">{simulateMutation.data.rebalanced.apy}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
