import type { Server } from "http"
import { WebSocketServer, WebSocket } from "ws"
import { getDLMMClient } from "../solana/dlmm-client"
import { monitorAllPositions } from "./rebalancer"

interface WSMessage {
  type: "subscribe" | "unsubscribe" | "ping"
  walletAddress?: string
  poolAddress?: string
}

export class WebSocketService {
  private wss: WebSocketServer
  private clients: Map<WebSocket, Set<string>> = new Map()
  private monitoringIntervals: Map<string, NodeJS.Timeout> = new Map()

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server, path: "/ws" })
    this.setupWebSocket()
  }

  private setupWebSocket() {
    this.wss.on("connection", (ws: WebSocket) => {
      console.log("WebSocket client connected")
      this.clients.set(ws, new Set())

      ws.on("message", async (data: Buffer) => {
        try {
          const message: WSMessage = JSON.parse(data.toString())
          await this.handleMessage(ws, message)
        } catch (error) {
          console.error("WebSocket message error:", error)
          ws.send(JSON.stringify({ error: "Invalid message format" }))
        }
      })

      ws.on("close", () => {
        console.log("WebSocket client disconnected")
        const subscriptions = this.clients.get(ws)
        if (subscriptions) {
          for (const key of subscriptions) {
            this.stopMonitoring(key)
          }
        }
        this.clients.delete(ws)
      })

      ws.on("error", (error) => {
        console.error("WebSocket error:", error)
      })

      // Send initial connection success
      ws.send(JSON.stringify({ type: "connected", timestamp: Date.now() }))
    })
  }

  private async handleMessage(ws: WebSocket, message: WSMessage) {
    switch (message.type) {
      case "subscribe":
        if (message.walletAddress) {
          await this.subscribeToWallet(ws, message.walletAddress)
        }
        break

      case "unsubscribe":
        if (message.walletAddress) {
          this.unsubscribeFromWallet(ws, message.walletAddress)
        }
        break

      case "ping":
        ws.send(JSON.stringify({ type: "pong", timestamp: Date.now() }))
        break
    }
  }

  private async subscribeToWallet(ws: WebSocket, walletAddress: string) {
    const subscriptions = this.clients.get(ws)
    if (!subscriptions) return

    subscriptions.add(walletAddress)

    // Start monitoring if not already running
    if (!this.monitoringIntervals.has(walletAddress)) {
      this.startMonitoring(walletAddress)
    }

    ws.send(
      JSON.stringify({
        type: "subscribed",
        walletAddress,
        timestamp: Date.now(),
      }),
    )
  }

  private unsubscribeFromWallet(ws: WebSocket, walletAddress: string) {
    const subscriptions = this.clients.get(ws)
    if (!subscriptions) return

    subscriptions.delete(walletAddress)

    // Check if any other clients are subscribed
    let hasOtherSubscribers = false
    for (const [client, subs] of this.clients) {
      if (client !== ws && subs.has(walletAddress)) {
        hasOtherSubscribers = true
        break
      }
    }

    // Stop monitoring if no subscribers
    if (!hasOtherSubscribers) {
      this.stopMonitoring(walletAddress)
    }

    ws.send(
      JSON.stringify({
        type: "unsubscribed",
        walletAddress,
        timestamp: Date.now(),
      }),
    )
  }

  private startMonitoring(walletAddress: string) {
    const interval = setInterval(async () => {
      try {
        const dlmmClient = getDLMMClient()
        const positions = await dlmmClient.getUserPositions(walletAddress)
        const decisions = await monitorAllPositions(walletAddress)

        // Broadcast to all subscribed clients
        for (const [client, subscriptions] of this.clients) {
          if (subscriptions.has(walletAddress) && client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                type: "position_update",
                walletAddress,
                positions: positions.length,
                decisions: decisions.map((d) => ({
                  poolPair: d.position.poolPair,
                  shouldRebalance: d.decision.shouldRebalance,
                  volatility: d.decision.volatility,
                })),
                timestamp: Date.now(),
              }),
            )
          }
        }
      } catch (error) {
        console.error(`Monitoring error for ${walletAddress}:`, error)
      }
    }, 15000) // Update every 15 seconds

    this.monitoringIntervals.set(walletAddress, interval)
    console.log(`Started monitoring for ${walletAddress}`)
  }

  private stopMonitoring(walletAddress: string) {
    const interval = this.monitoringIntervals.get(walletAddress)
    if (interval) {
      clearInterval(interval)
      this.monitoringIntervals.delete(walletAddress)
      console.log(`Stopped monitoring for ${walletAddress}`)
    }
  }

  broadcast(message: any) {
    const data = JSON.stringify(message)
    for (const [client] of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data)
      }
    }
  }
}

let wsService: WebSocketService | null = null

export function initializeWebSocketServer(server: Server): WebSocketService {
  wsService = new WebSocketService(server)
  return wsService
}

export function getWebSocketService(): WebSocketService {
  if (!wsService) {
    throw new Error("WebSocket service not initialized")
  }
  return wsService
}
