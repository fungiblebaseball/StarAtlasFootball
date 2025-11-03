import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, integer, boolean, jsonb } from "drizzle-orm/pg-core";
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

// Star Atlas Crew Schema
export const crew = pgTable("crew", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dasID: text("das_id").notNull().unique(),
  mintOffset: integer("mint_offset"),
  faction: text("faction"),
  species: text("species"),
  sex: text("sex"),
  name: text("name").notNull(),
  university: text("university"),
  age: real("age"),
  
  // Big Five Personality Traits (0.0 - 1.0)
  openness: real("openness").notNull(),
  conscientiousness: real("conscientiousness").notNull(),
  extraversion: real("extraversion").notNull(),
  agreeableness: real("agreeableness").notNull(),
  neuroticism: real("neuroticism").notNull(),
  
  rarity: text("rarity").notNull(),
  aptitudes: jsonb("aptitudes"),
  appearance: jsonb("appearance"),
  imageUrl: text("image_url"),
  
  // Game stats (derived from personality traits)
  defense: integer("defense"),
  attack: integer("attack"),
  stamina: integer("stamina"),
  
  updatedAt: text("updated_at"),
  createdAt: text("created_at"),
});

export const insertCrewSchema = createInsertSchema(crew).omit({
  id: true,
});

export type InsertCrew = z.infer<typeof insertCrewSchema>;
export type Crew = typeof crew.$inferSelect;

// Player Profile Configuration
export const playerProfile = pgTable("player_profile", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: text("profile_id").notNull().unique(), // Star Atlas wallet address
  teamName: text("team_name"),
  formation: text("formation").default("442"),
  selectedCrewIds: jsonb("selected_crew_ids"), // Array of dasIDs
  wins: integer("wins").default(0),
  losses: integer("losses").default(0),
  draws: integer("draws").default(0),
  goalsFor: integer("goals_for").default(0),
  goalsAgainst: integer("goals_against").default(0),
  atlasBalance: integer("atlas_balance").default(0),
  ownedPerks: jsonb("owned_perks"), // Array of perk IDs
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const insertPlayerProfileSchema = createInsertSchema(playerProfile).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPlayerProfile = z.infer<typeof insertPlayerProfileSchema>;
export type PlayerProfile = typeof playerProfile.$inferSelect;
