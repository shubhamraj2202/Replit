import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  relationshipContext: text("relationship_context").notNull(), // family, romantic, workplace, friends, roommates
  argumentCategory: text("argument_category").notNull(), // household, financial, time management, responsibilities
  participants: json("participants").notNull(), // array of {name, role, perspective}
  aiResolution: text("ai_resolution"),
  actionItems: text("action_items").array(),
  fairnessScore: integer("fairness_score"), // 1-10 rating
  status: text("status").notNull().default("active"), // active, resolved, archived
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertSessionSchema = createInsertSchema(sessions).pick({
  relationshipContext: true,
  argumentCategory: true,
  participants: true,
  aiResolution: true,
  actionItems: true,
  fairnessScore: true,
  status: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;
