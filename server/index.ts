import 'dotenv/config';
import express, { type Request, type Response, type NextFunction } from "express"
import { registerRoutes } from "./routes"
import { setupVite, serveStatic, log } from "./vite"
import { connection, loadWalletFromEnv, checkConnection } from "./solana/connection"
import { initializeDLMMClient } from "./solana/dlmm-client"
import { positionMonitor } from "./services/position-monitor"
import { initializeWebSocketServer } from "./services/websocket-server"
import { stopLossManager } from "./services/stop-loss-manager"

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use((req, res, next) => {
  const start = Date.now()
  const path = req.path
  let capturedJsonResponse: Record<string, any> | undefined = undefined

  const originalResJson = res.json
  res.json = (bodyJson, ...args) => {
    capturedJsonResponse = bodyJson
    return originalResJson.apply(res, [bodyJson, ...args])
  }

  res.on("finish", () => {
    const duration = Date.now() - start
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…"
      }

      log(logLine)
    }
  })

  next()
})
;(async () => {
  log("Initializing Solana connection...")
  const connected = await checkConnection()

  if (!connected) {
    log("Failed to connect to Solana RPC. Check your SOLANA_RPC_URL environment variable.")
    process.exit(1)
  }

  log("Loading wallet...")
  const wallet = loadWalletFromEnv()
  log(`Wallet loaded: ${wallet.publicKey.toBase58()}`)

  log("Initializing DLMM client...")
  initializeDLMMClient(connection, wallet)
  log("DLMM client initialized successfully")

  const server = await registerRoutes(app)

  initializeWebSocketServer(server)
  log("WebSocket server initialized")

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500
    const message = err.message || "Internal Server Error"

    res.status(status).json({ message })
    throw err
  })

  if (app.get("env") === "development") {
    await setupVite(app, server)
  } else {
    serveStatic(app)
  }

  const port = Number.parseInt(process.env.PORT || "5000", 10)
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`)

      positionMonitor.startMonitoring()
      log("Automated position monitoring started")

      if (process.env.ENABLE_STOP_LOSS === "true" && process.env.MONITORED_WALLET) {
        setInterval(async () => {
          await stopLossManager.monitorStopLoss(process.env.MONITORED_WALLET!)
        }, 60000) // Check every minute
        log("Stop-loss monitoring started")
      }
    },
  )
})()
