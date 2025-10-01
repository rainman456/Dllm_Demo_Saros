import { type NextRequest, NextResponse } from "next/server"
import { TelegramService } from "@/src/services/telegram.service"

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const telegram = new TelegramService()
    const success = await telegram.sendMessage(message)

    if (!success) {
      return NextResponse.json({ error: "Telegram not configured or message failed to send" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Notification sent successfully",
    })
  } catch (error) {
    console.error("Error sending notification:", error)
    return NextResponse.json(
      {
        error: "Failed to send notification",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
