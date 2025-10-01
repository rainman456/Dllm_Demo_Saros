import { NextResponse } from "next/server"
import { Connection } from "@solana/web3.js"
import { VolatilityService } from "@/src/services"

const connection = new Connection(
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com",
  "confirmed",
)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const poolAddress = searchParams.get("pool")

    if (!poolAddress) {
      return NextResponse.json({ error: "Pool address is required" }, { status: 400 })
    }

    const volatilityService = new VolatilityService(connection)
    const volatilityData = await volatilityService.calculateVolatility(poolAddress)

    return NextResponse.json(volatilityData)
  } catch (error) {
    console.error("[v0] Error calculating volatility:", error)
    return NextResponse.json(
      {
        error: "Failed to calculate volatility",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
