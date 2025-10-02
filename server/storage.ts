import {
  type User,
  type InsertUser,
  type Position,
  type InsertPosition,
  type RebalancingEvent,
  type InsertRebalancingEvent,
  type TelegramAlert,
  type InsertTelegramAlert,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getPositions(walletAddress: string): Promise<Position[]>;
  getPosition(id: string): Promise<Position | undefined>;
  createPosition(position: InsertPosition): Promise<Position>;
  updatePosition(id: string, updates: Partial<Position>): Promise<Position | undefined>;
  deletePosition(id: string): Promise<boolean>;
  
  getRebalancingEvents(limit?: number): Promise<RebalancingEvent[]>;
  createRebalancingEvent(event: InsertRebalancingEvent): Promise<RebalancingEvent>;
  
  getTelegramAlerts(limit?: number): Promise<TelegramAlert[]>;
  createTelegramAlert(alert: InsertTelegramAlert): Promise<TelegramAlert>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private positions: Map<string, Position>;
  private events: Map<string, RebalancingEvent>;
  private alerts: Map<string, TelegramAlert>;

  constructor() {
    this.users = new Map();
    this.positions = new Map();
    this.events = new Map();
    this.alerts = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getPositions(walletAddress: string): Promise<Position[]> {
    return Array.from(this.positions.values()).filter(
      (pos) => pos.walletAddress === walletAddress
    );
  }

  async getPosition(id: string): Promise<Position | undefined> {
    return this.positions.get(id);
  }

  async createPosition(insertPosition: InsertPosition): Promise<Position> {
    const id = randomUUID();
    const position: Position = {
      ...insertPosition,
      id,
      status: insertPosition.status || "in-range",
      binDistribution: insertPosition.binDistribution || null,
      createdAt: new Date(),
    };
    this.positions.set(id, position);
    return position;
  }

  async updatePosition(id: string, updates: Partial<Position>): Promise<Position | undefined> {
    const position = this.positions.get(id);
    if (!position) return undefined;

    const updated = { ...position, ...updates };
    this.positions.set(id, updated);
    return updated;
  }

  async deletePosition(id: string): Promise<boolean> {
    return this.positions.delete(id);
  }

  async getRebalancingEvents(limit: number = 50): Promise<RebalancingEvent[]> {
    const events = Array.from(this.events.values());
    events.sort((a, b) => {
      const timeA = a.timestamp?.getTime() || 0;
      const timeB = b.timestamp?.getTime() || 0;
      return timeB - timeA;
    });
    return events.slice(0, limit);
  }

  async createRebalancingEvent(insertEvent: InsertRebalancingEvent): Promise<RebalancingEvent> {
    const id = randomUUID();
    const event: RebalancingEvent = {
      ...insertEvent,
      id,
      timestamp: new Date(),
    };
    this.events.set(id, event);
    return event;
  }

  async getTelegramAlerts(limit: number = 20): Promise<TelegramAlert[]> {
    const alerts = Array.from(this.alerts.values());
    alerts.sort((a, b) => {
      const timeA = a.time?.getTime() || 0;
      const timeB = b.time?.getTime() || 0;
      return timeB - timeA;
    });
    return alerts.slice(0, limit);
  }

  async createTelegramAlert(insertAlert: InsertTelegramAlert): Promise<TelegramAlert> {
    const id = randomUUID();
    const alert: TelegramAlert = {
      ...insertAlert,
      id,
      sent: insertAlert.sent || "false",
      time: new Date(),
    };
    this.alerts.set(id, alert);
    return alert;
  }
}

export const storage = new MemStorage();
