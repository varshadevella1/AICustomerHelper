import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Chat schema
export const chats = pgTable("chats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  lastMessage: text("last_message").notNull(),
  lastMessageTime: timestamp("last_message_time").notNull(),
  icon: text("icon").notNull(),
  active: boolean("active").notNull().default(false),
});

export const insertChatSchema = createInsertSchema(chats).pick({
  userId: true,
  title: true,
  lastMessage: true,
  lastMessageTime: true,
  icon: true,
  active: true,
});

export type InsertChat = z.infer<typeof insertChatSchema>;
export type Chat = typeof chats.$inferSelect;

// Message schema
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  chatId: integer("chat_id").notNull(),
  content: text("content").notNull(),
  sender: text("sender").notNull(), // "user" or "bot"
  timestamp: timestamp("timestamp").notNull(),
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  chatId: true,
  content: true,
  sender: true,
  timestamp: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
