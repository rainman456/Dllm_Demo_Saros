import { type NextRequest, NextResponse } from "next/server"
import { Connection } from "@solana/web3.js"
import { RebalancerService } from "@/src/services/rebalancer.service"
import { config } from "@/src/config"

export async function POST(request: NextRequest) {
  try {
    const { userAddress } = await request.json()

    if (!userAddress) {
      return NextResponse.json({ error: "User address is required" }, { status: 400 })
    }

    const connection = new Connection(config.solana.rpcUrl)
    const rebalancer = new RebalancerService(connection)

    await rebalancer.sendDailySummary(userAddress)

    return NextResponse.json({
      success: true,
      message: "Daily summary sent",
    })
  } catch (error) {
    console.error("Error sending summary:", error)
    return NextResponse.json(
      {
        error: "Failed to send summary",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
