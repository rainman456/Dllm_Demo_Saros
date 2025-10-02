import fs from "fs/promises"
import path from "path"
import { fileURLToPath } from "url"
import { dirname } from "path"
import type { Position, RebalancingEvent, TelegramAlert } from "../shared/schema"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const DATA_DIR = path.resolve(__dirname, "../data")
const POSITIONS_FILE = path.join(DATA_DIR, "positions.json")
const EVENTS_FILE = path.join(DATA_DIR, "events.json")
const ALERTS_FILE = path.join(DATA_DIR, "alerts.json")

class Storage {
  private positions: Map<string, Position> = new Map()
  private events: RebalancingEvent[] = []
  private alerts: TelegramAlert[] = []
  private initialized = false

  async initialize() {
    if (this.initialized) return

    try {
      await fs.mkdir(DATA_DIR, { recursive: true })
      await this.loadData()
      this.initialized = true
      console.log("[Storage] Initialized successfully")
    } catch (error) {
      console.error("[Storage] Initialization error:", error)
      throw error
    }
  }

  private async loadData() {
    try {
      const positionsData = await fs.readFile(POSITIONS_FILE, "utf-8")
      const positions: Position[] = JSON.parse(positionsData)
      positions.forEach((p) => this.positions.set(p.id, p))
    } catch (error) {
      console.log("[Storage] No existing positions file, starting fresh")
    }

    try {
      const eventsData = await fs.readFile(EVENTS_FILE, "utf-8")
      this.events = JSON.parse(eventsData)
    } catch (error) {
      console.log("[Storage] No existing events file, starting fresh")
    }

    try {
      const alertsData = await fs.readFile(ALERTS_FILE, "utf-8")
      this.alerts = JSON.parse(alertsData)
    } catch (error) {
      console.log("[Storage] No existing alerts file, starting fresh")
    }
  }

  private async savePositions() {
    const positions = Array.from(this.positions.values())
    await fs.writeFile(POSITIONS_FILE, JSON.stringify(positions, null, 2))
  }

  private async saveEvents() {
    await fs.writeFile(EVENTS_FILE, JSON.stringify(this.events, null, 2))
  }

  private async saveAlerts() {
    await fs.writeFile(ALERTS_FILE, JSON.stringify(this.alerts, null, 2))
  }

  // Position methods
  async getPositions(): Promise<Position[]> {
    return Array.from(this.positions.values())
  }

  async getPosition(id: string): Promise<Position | undefined> {
    return this.positions.get(id)
  }

  async savePosition(position: Position): Promise<void> {
    this.positions.set(position.id, position)
    await this.savePositions()
  }

  async updatePosition(id: string, updates: Partial<Position>): Promise<Position | undefined> {
    const position = this.positions.get(id)
    if (!position) return undefined

    const updated = { ...position, ...updates, updatedAt: new Date().toISOString() }
    this.positions.set(id, updated)
    await this.savePositions()
    return updated
  }

  async deletePosition(id: string): Promise<boolean> {
    const deleted = this.positions.delete(id)
    if (deleted) {
      await this.savePositions()
    }
    return deleted
  }

  // Event methods
  async getEvents(limit?: number): Promise<RebalancingEvent[]> {
    const sorted = [...this.events].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    return limit ? sorted.slice(0, limit) : sorted
  }

  async addEvent(event: RebalancingEvent): Promise<void> {
    this.events.push(event)
    // Keep only last 1000 events
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000)
    }
    await this.saveEvents()
  }

  async createRebalancingEvent(event: Omit<RebalancingEvent, "id" | "timestamp">): Promise<void> {
    const newEvent: RebalancingEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...event,
    }
    await this.addEvent(newEvent)
  }

  async getRebalancingEvents(limit?: number): Promise<RebalancingEvent[]> {
    return this.getEvents(limit)
  }

  // Alert methods
  async getAlerts(limit?: number): Promise<TelegramAlert[]> {
    const sorted = [...this.alerts].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    return limit ? sorted.slice(0, limit) : sorted
  }

  async addAlert(alert: TelegramAlert): Promise<void> {
    this.alerts.push(alert)
    // Keep only last 500 alerts
    if (this.alerts.length > 500) {
      this.alerts = this.alerts.slice(-500)
    }
    await this.saveAlerts()
  }

  async markAlertSent(id: string): Promise<void> {
    const alert = this.alerts.find((a) => a.id === id)
    if (alert) {
      alert.sent = true
      await this.saveAlerts()
    }
  }

  async getTelegramAlerts(limit?: number): Promise<TelegramAlert[]> {
    return this.getAlerts(limit)
  }
}

export const storage = new Storage()
