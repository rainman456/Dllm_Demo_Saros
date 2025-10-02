import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const positions = pgTable("positions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  walletAddress: text("wallet_address").notNull(),
  poolPair: text("pool_pair").notNull(),
  poolAddress: text("pool_address").notNull(),
  rangeMin: decimal("range_min", { precision: 20, scale: 8 }).notNull(),
  rangeMax: decimal("range_max", { precision: 20, scale: 8 }).notNull(),
  liquidity: decimal("liquidity", { precision: 20, scale: 8 }).notNull(),
  feesEarned: decimal("fees_earned", { precision: 20, scale: 8 }).default("0"),
  status: text("status").notNull().default("in-range"),
  currentPrice: decimal("current_price", { precision: 20, scale: 8 }),
  binDistribution: jsonb("bin_distribution").$type<number[]>(),
  lastRebalanced: timestamp("last_rebalanced"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPositionSchema = createInsertSchema(positions).omit({
  id: true,
  createdAt: true,
});

export type InsertPosition = z.infer<typeof insertPositionSchema>;
export type Position = typeof positions.$inferSelect;

export const rebalancingEvents = pgTable("rebalancing_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  positionId: text("position_id").notNull(),
  type: text("type").notNull(),
  poolPair: text("pool_pair").notNull(),
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertRebalancingEventSchema = createInsertSchema(rebalancingEvents).omit({
  id: true,
  timestamp: true,
});

export type InsertRebalancingEvent = z.infer<typeof insertRebalancingEventSchema>;
export type RebalancingEvent = typeof rebalancingEvents.$inferSelect;

export const telegramAlerts = pgTable("telegram_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  message: text("message").notNull(),
  type: text("type").notNull(),
  time: timestamp("time").defaultNow(),
  sent: text("sent").default("false"),
});

export const insertTelegramAlertSchema = createInsertSchema(telegramAlerts).omit({
  id: true,
  time: true,
});

export type InsertTelegramAlert = z.infer<typeof insertTelegramAlertSchema>;
export type TelegramAlert = typeof telegramAlerts.$inferSelect;
