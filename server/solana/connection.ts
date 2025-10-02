import { Connection, Keypair, PublicKey, clusterApiUrl } from "@solana/web3.js";
import BN from "bn.js";

export const SOLANA_NETWORK = process.env.SOLANA_NETWORK || "devnet";
export const RPC_ENDPOINT = process.env.SOLANA_RPC_URL || clusterApiUrl(SOLANA_NETWORK as any);

export const connection = new Connection(RPC_ENDPOINT, "confirmed");

export function generateWallet(): Keypair {
  return Keypair.generate();
}

export async function getBalance(publicKey: PublicKey): Promise<number> {
  const balance = await connection.getBalance(publicKey);
  return balance / 1e9;
}

export async function airdropSol(publicKey: PublicKey, amount: number = 2): Promise<string> {
  const signature = await connection.requestAirdrop(
    publicKey,
    amount * 1e9
  );
  
  await connection.confirmTransaction(signature);
  return signature;
}

export function parsePrice(price: BN | number | string): string {
  if (typeof price === "string") return price;
  if (typeof price === "number") return price.toString();
  return price.toString();
}

export function truncateAddress(address: string, chars: number = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}
