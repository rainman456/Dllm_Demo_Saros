import DashboardStats from '../DashboardStats';

export default function DashboardStatsExample() {
  return (
    <DashboardStats
      totalLiquidity="$124,580.50"
      totalFees="$8,942.30"
      activePositions={6}
      avgAPY="34.8%"
    />
  );
}
