import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, TrendingUp, TrendingDown } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface SimulationResult {
  strategy: string;
  totalFees: string;
  impermanentLoss: string;
  netReturn: string;
  apy: string;
  rebalanceCount: number;
}

export default function StrategySimulator() {
  const [initialCapital, setInitialCapital] = useState("10000");
  const [duration, setDuration] = useState("30");
  const [volatility, setVolatility] = useState("medium");
  const [results, setResults] = useState<SimulationResult[]>([]);

  const simulateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          initialCapital,
          duration,
          volatility,
        }),
      });
      return response;
    },
    onSuccess: (data) => {
      setResults([data.passive, data.rebalanced]);
    },
  });

  const runSimulation = () => {
    simulateMutation.mutate();
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Strategy Simulator</h3>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="capital">Initial Capital ($)</Label>
            <Input
              id="capital"
              type="number"
              value={initialCapital}
              onChange={(e) => setInitialCapital(e.target.value)}
              data-testid="input-capital"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (days)</Label>
            <Input
              id="duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              data-testid="input-duration"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="volatility">Volatility</Label>
            <select
              id="volatility"
              value={volatility}
              onChange={(e) => setVolatility(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              data-testid="select-volatility"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <Button
          onClick={runSimulation}
          disabled={simulateMutation.isPending}
          className="w-full"
          data-testid="button-simulate"
        >
          <PlayCircle className="w-4 h-4 mr-2" />
          {simulateMutation.isPending ? "Simulating..." : "Run Simulation"}
        </Button>

        {results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            {results.map((result) => (
              <div
                key={result.strategy}
                className="p-4 rounded-lg border"
                data-testid={`result-${result.strategy.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">{result.strategy}</h4>
                  {result.rebalanceCount > 0 && (
                    <Badge variant="secondary">{result.rebalanceCount} rebalances</Badge>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Fees:</span>
                    <span className="font-semibold text-chart-3">{result.totalFees}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">IL:</span>
                    <span className="font-semibold text-chart-5">{result.impermanentLoss}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Net Return:</span>
                    <span className="font-semibold text-chart-3">{result.netReturn}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-muted-foreground">APY:</span>
                    <div className="flex items-center gap-1">
                      {parseFloat(result.apy) > 30 ? (
                        <TrendingUp className="w-4 h-4 text-chart-3" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-chart-4" />
                      )}
                      <span className="text-lg font-bold">{result.apy}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
