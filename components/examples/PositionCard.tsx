import PositionCard from '../PositionCard';

export default function PositionCardExample() {
  return (
    <div className="space-y-4">
      <PositionCard
        poolPair="SOL/USDC"
        rangeMin="$85.20"
        rangeMax="$92.40"
        liquidity="$45,280.50"
        feesEarned="$1,245.80"
        status="in-range"
        currentPrice="$88.75"
      />
      <PositionCard
        poolPair="SAROS/USDC"
        rangeMin="$0.082"
        rangeMax="$0.095"
        liquidity="$28,450.00"
        feesEarned="$892.30"
        status="out-of-range"
        currentPrice="$0.098"
      />
    </div>
  );
}
