import { type NextRequest, NextResponse } from "next/server"
import { Connection, PublicKey } from "@solana/web3.js"
import { RebalancerService } from "@/src/services/rebalancer.service"
import { config } from "@/src/config"

export async function POST(request: NextRequest) {
  try {
    const { userAddress } = await request.json()

    if (!userAddress) {
      return NextResponse.json({ error: "User address is required" }, { status: 400 })
    }

    // Validate address
    try {
      new PublicKey(userAddress)
    } catch {
      return NextResponse.json({ error: "Invalid Solana address" }, { status: 400 })
    }

    const connection = new Connection(config.solana.rpcUrl)
    const rebalancer = new RebalancerService(connection)

    const actions = await rebalancer.monitorPositions(userAddress)

    return NextResponse.json({
      success: true,
      actions,
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error("Error checking rebalance:", error)
    return NextResponse.json(
      {
        error: "Failed to check rebalance",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
