import RebalancingActivity from '../RebalancingActivity';

export default function RebalancingActivityExample() {
  return (
    <RebalancingActivity
      events={[
        {
          id: "1",
          type: "success",
          poolPair: "SOL/USDC",
          message: "Successfully rebalanced position to new range $85.20 - $92.40",
          timestamp: "5 min ago",
        },
        {
          id: "2",
          type: "alert",
          poolPair: "SAROS/USDC",
          message: "Position is out of range. Current price $0.098 exceeds max $0.095",
          timestamp: "12 min ago",
        },
        {
          id: "3",
          type: "rebalance",
          poolPair: "RAY/SOL",
          message: "Initiated rebalancing based on volatility spike (+15.2%)",
          timestamp: "1 hour ago",
        },
        {
          id: "4",
          type: "success",
          poolPair: "USDT/USDC",
          message: "Collected fees: $48.50. APY increased to 28.4%",
          timestamp: "3 hours ago",
        },
      ]}
    />
  );
}
