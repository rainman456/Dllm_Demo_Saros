import { NextResponse } from "next/server"
import { Connection } from "@solana/web3.js"
import { DLMMService } from "@/src/services"

// Initialize Solana connection to devnet
const connection = new Connection(
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com",
  "confirmed",
)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get("wallet")

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address is required" }, { status: 400 })
    }

    const dlmmService = new DLMMService(connection)
    const positions = await dlmmService.getUserPositions(walletAddress)

    // Calculate portfolio stats
    const stats = dlmmService.calculatePortfolioStats(positions)

    return NextResponse.json({ positions, stats })
  } catch (error) {
    console.error("[v0] Error fetching positions:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch positions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
