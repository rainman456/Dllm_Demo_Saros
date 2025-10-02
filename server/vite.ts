import { createServer as createViteServer, type ViteDevServer } from "vite"
import express from "express"
import path from "path"
import { fileURLToPath } from "url"
import { dirname } from "path"
import fs from "fs"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

let vite: ViteDevServer | undefined

export async function setupVite(app: express.Application) {
  const isDev = process.env.NODE_ENV !== "production"

  if (isDev) {
    // Development mode: use Vite dev server
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
      root: path.resolve(__dirname, "../client"),
    })

    app.use(vite.middlewares)
  } else {
    // Production mode: serve built files
    const distPath = path.resolve(__dirname, "../client/dist")
    app.use(express.static(distPath))

    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"))
    })
  }

  return vite
}

export function serveStatic(app: express.Application) {
  const distPath = path.resolve(__dirname, "../client/dist")

  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath))

    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api")) {
        return next()
      }
      res.sendFile(path.join(distPath, "index.html"))
    })
  }
}

export function log(message: string, level: "info" | "error" | "warn" = "info") {
  const timestamp = new Date().toISOString()
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`

  switch (level) {
    case "error":
      console.error(`${prefix} ${message}`)
      break
    case "warn":
      console.warn(`${prefix} ${message}`)
      break
    default:
      console.log(`${prefix} ${message}`)
  }
}
