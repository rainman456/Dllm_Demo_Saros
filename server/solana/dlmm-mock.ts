import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";

export interface DLMMPosition {
  publicKey: string;
  poolAddress: string;
  poolPair: string;
  lowerBinId: number;
  upperBinId: number;
  liquidity: BN;
  feeX: BN;
  feeY: BN;
  positionBinData: number[];
}

export interface DLMMBinArray {
  binId: number;
  price: BN;
  liquidityX: BN;
  liquidityY: BN;
}

export interface PoolInfo {
  address: string;
  tokenX: string;
  tokenY: string;
  activeId: number;
  binStep: number;
}

const MOCK_POOLS: PoolInfo[] = [
  {
    address: "Pool1111111111111111111111111111111111111111",
    tokenX: "SOL",
    tokenY: "USDC",
    activeId: 8875,
    binStep: 25,
  },
  {
    address: "Pool2222222222222222222222222222222222222222",
    tokenX: "SAROS",
    tokenY: "USDC",
    activeId: 920,
    binStep: 10,
  },
  {
    address: "Pool3333333333333333333333333333333333333333",
    tokenX: "RAY",
    tokenY: "SOL",
    activeId: 920,
    binStep: 15,
  },
];

export async function getUserPositions(walletAddress: string): Promise<DLMMPosition[]> {
  const mockPositions: DLMMPosition[] = [
    {
      publicKey: "Pos1111111111111111111111111111111111111111",
      poolAddress: MOCK_POOLS[0].address,
      poolPair: "SOL/USDC",
      lowerBinId: 8820,
      upperBinId: 8924,
      liquidity: new BN(45280500000),
      feeX: new BN(1245800000),
      feeY: new BN(0),
      positionBinData: [2, 5, 8, 15, 25, 35, 28, 18, 10, 5, 3],
    },
    {
      publicKey: "Pos2222222222222222222222222222222222222222",
      poolAddress: MOCK_POOLS[1].address,
      poolPair: "SAROS/USDC",
      lowerBinId: 820,
      upperBinId: 950,
      liquidity: new BN(28450000000),
      feeX: new BN(892300000),
      feeY: new BN(0),
      positionBinData: [3, 7, 12, 20, 30, 25, 15, 10, 5, 2, 1],
    },
  ];

  return mockPositions;
}

export async function getActiveBin(poolAddress: string): Promise<number> {
  const pool = MOCK_POOLS.find(p => p.address === poolAddress);
  return pool?.activeId || 8875;
}

export async function getBinArrays(poolAddress: string, fromBin: number, toBin: number): Promise<DLMMBinArray[]> {
  const bins: DLMMBinArray[] = [];
  const basePrice = 8875;
  
  for (let i = fromBin; i <= toBin; i++) {
    const priceVariation = (i - basePrice) * 0.01;
    bins.push({
      binId: i,
      price: new BN(Math.floor((88.75 + priceVariation) * 1e8)),
      liquidityX: new BN(Math.random() * 1000000),
      liquidityY: new BN(Math.random() * 1000000),
    });
  }
  
  return bins;
}

export async function calculateVolatility(bins: DLMMBinArray[]): Promise<number> {
  if (bins.length < 2) return 0;
  
  const prices = bins.map(b => parseFloat(b.price.toString()) / 1e8);
  const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
  const variance = prices.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / prices.length;
  const stdDev = Math.sqrt(variance);
  
  return (stdDev / mean) * 100;
}

export async function addLiquidityToPosition(
  positionAddress: string,
  poolAddress: string,
  lowerBinId: number,
  upperBinId: number,
  amountX: BN,
  amountY: BN
): Promise<string> {
  console.log(`Adding liquidity to position ${positionAddress}`, {
    poolAddress,
    lowerBinId,
    upperBinId,
    amountX: amountX.toString(),
    amountY: amountY.toString(),
  });
  
  return "mock_signature_" + Date.now();
}

export async function removeLiquidity(
  positionAddress: string,
  poolAddress: string,
  binIds: number[],
  liquidityShares: BN[]
): Promise<string> {
  console.log(`Removing liquidity from position ${positionAddress}`, {
    poolAddress,
    binIds,
    liquidityShares: liquidityShares.map(s => s.toString()),
  });
  
  return "mock_signature_" + Date.now();
}

export async function getQuote(
  poolAddress: string,
  amount: BN,
  swapForY: boolean
): Promise<{ amountOut: BN; fee: BN }> {
  const feeRate = 0.003;
  const amountNum = parseFloat(amount.toString());
  const fee = Math.floor(amountNum * feeRate);
  const amountOut = amountNum - fee;
  
  return {
    amountOut: new BN(Math.floor(amountOut)),
    fee: new BN(fee),
  };
}
