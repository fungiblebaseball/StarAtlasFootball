import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { config } from "./config";
import { z } from "zod";

// Default player profile ID from config
const DEFAULT_PROFILE_ID = config.playerProfileId;

// Star Atlas API response schema
const StarAtlasCrewResponse = z.object({
  total: z.number(),
  crew: z.array(z.object({
    _id: z.string(),
    dasID: z.string(),
    mintOffset: z.number().optional(),
    faction: z.string(),
    species: z.string(),
    sex: z.string(),
    name: z.string(),
    university: z.string().optional(),
    age: z.number(),
    openness: z.number(),
    conscientiousness: z.number(),
    extraversion: z.number(),
    agreeableness: z.number(),
    neuroticism: z.number(),
    rarity: z.string(),
    aptitudes: z.record(z.string()).optional(),
    appearance: z.record(z.any()).optional(),
    imageUrl: z.string().optional(),
    updatedAt: z.string().optional(),
    createdAt: z.string().optional(),
  }))
});

// Calculate game stats from personality traits
function calculateStats(crew: any) {
  // Defense: High conscientiousness and low neuroticism
  const defense = Math.round(
    (crew.conscientiousness * 50 + (1 - crew.neuroticism) * 50) * 0.9 + 
    Math.random() * 20
  );

  // Attack: High extraversion and openness
  const attack = Math.round(
    (crew.extraversion * 50 + crew.openness * 50) * 0.9 + 
    Math.random() * 20
  );

  // Stamina: High conscientiousness and low neuroticism
  const stamina = Math.round(
    (crew.conscientiousness * 40 + (1 - crew.neuroticism) * 40 + crew.agreeableness * 20) * 0.9 + 
    Math.random() * 20
  );

  return { defense, attack, stamina };
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Fetch crew from Star Atlas API
  app.get("/api/crew", async (req, res) => {
    try {
      const profileId = req.query.profileId as string || DEFAULT_PROFILE_ID;
      const url = `https://galaxy.staratlas.com/crew/inventory/${profileId}`;
      
      console.log(`Fetching crew from Star Atlas API: ${url}`);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Star Atlas API returned ${response.status}`);
      }
      
      const data = await response.json();
      const validatedData = StarAtlasCrewResponse.parse(data);
      
      // Transform and enrich crew data with game stats
      const enrichedCrew = validatedData.crew.map(member => {
        const stats = calculateStats(member);
        return {
          ...member,
          ...stats,
        };
      });
      
      // Cache crew in database
      for (const member of enrichedCrew) {
        await storage.upsertCrew({
          dasID: member.dasID,
          mintOffset: member.mintOffset,
          faction: member.faction,
          species: member.species,
          sex: member.sex,
          name: member.name,
          university: member.university,
          age: member.age,
          openness: member.openness,
          conscientiousness: member.conscientiousness,
          extraversion: member.extraversion,
          agreeableness: member.agreeableness,
          neuroticism: member.neuroticism,
          rarity: member.rarity,
          aptitudes: member.aptitudes,
          appearance: member.appearance,
          imageUrl: member.imageUrl,
          defense: member.defense,
          attack: member.attack,
          stamina: member.stamina,
          updatedAt: member.updatedAt,
          createdAt: member.createdAt,
        });
      }
      
      res.json({
        total: enrichedCrew.length,
        crew: enrichedCrew,
        profileId,
      });
    } catch (error) {
      console.error("Error fetching crew:", error);
      res.status(500).json({ 
        error: "Failed to fetch crew data",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get cached crew from database
  app.get("/api/crew/cached", async (req, res) => {
    try {
      const allCrew = await storage.getAllCrew();
      res.json({
        total: allCrew.length,
        crew: allCrew,
      });
    } catch (error) {
      console.error("Error fetching cached crew:", error);
      res.status(500).json({ error: "Failed to fetch cached crew data" });
    }
  });

  // Get or create player profile
  app.get("/api/profile", async (req, res) => {
    try {
      const profileId = req.query.profileId as string || DEFAULT_PROFILE_ID;
      let profile = await storage.getPlayerProfile(profileId);
      
      if (!profile) {
        // Create default profile
        profile = await storage.createPlayerProfile({
          profileId,
          teamName: "My Team",
          formation: "442",
          selectedCrewIds: [],
          atlasBalance: 1250,
          ownedPerks: ["iron-defense"],
        });
      }
      
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ error: "Failed to fetch player profile" });
    }
  });

  // Update player profile
  app.patch("/api/profile", async (req, res) => {
    try {
      const profileId = req.body.profileId as string || DEFAULT_PROFILE_ID;
      const updates = req.body;
      
      const profile = await storage.updatePlayerProfile(profileId, updates);
      res.json(profile);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ error: "Failed to update player profile" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
