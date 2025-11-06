import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { config } from "./config";
import { z } from "zod";
import { checkBlockchainServiceHealth, fetchCrewList, fetchPlayerProfiles } from "./services/blockchain";

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

  // Get player profiles from blockchain
  app.get("/api/blockchain/player-profiles", async (req, res) => {
    try {
      const walletAddress = req.query.walletAddress as string;
      
      if (!walletAddress) {
        return res.status(400).json({ error: "Wallet address is required" });
      }

      // Check if blockchain service is available
      const isAvailable = await checkBlockchainServiceHealth();
      
      if (!isAvailable) {
        return res.status(503).json({ 
          error: "Blockchain service unavailable",
          message: "The blockchain service is currently not available. Please try again later or use default profile."
        });
      }

      // Fetch player profiles from blockchain service
      const profilesData = await fetchPlayerProfiles(walletAddress);
      res.json(profilesData);
    } catch (error) {
      console.error("Error fetching player profiles:", error);
      res.status(500).json({ 
        error: "Failed to fetch player profiles",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get or create player profile by wallet address
  app.get("/api/profile", async (req, res) => {
    try {
      const walletAddress = req.query.walletAddress as string || DEFAULT_PROFILE_ID;
      let profile = await storage.getPlayerProfileByWallet(walletAddress);
      
      if (!profile) {
        // Create default profile
        profile = await storage.createPlayerProfile({
          walletAddress,
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
      const id = req.body.id as string;
      if (!id) {
        return res.status(400).json({ error: "Profile ID is required" });
      }
      
      const updates = req.body;
      delete updates.id;
      
      const profile = await storage.updatePlayerProfile(id, updates);
      res.json(profile);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ error: "Failed to update player profile" });
    }
  });

  // Sync crew from blockchain
  app.post("/api/profile/sync-crew", async (req, res) => {
    try {
      let { walletAddress, playerProfilePubkey } = req.body;
      
      if (!walletAddress) {
        return res.status(400).json({ error: "Wallet address is required" });
      }

      let crewData: any;
      let validatedData: z.infer<typeof StarAtlasCrewResponse>;

      // Check blockchain service availability (cached)
      const isBlockchainServiceAvailable = await checkBlockchainServiceHealth();
      
      // If no pubkey provided but blockchain service is available, try to fetch player profiles
      if (isBlockchainServiceAvailable && !playerProfilePubkey) {
        try {
          console.log(`Fetching player profiles from blockchain service for ${walletAddress}`);
          const profilesResponse = await fetchPlayerProfiles(walletAddress);
          
          if (profilesResponse.profiles.length > 0) {
            // Use first profile pubkey
            playerProfilePubkey = profilesResponse.profiles[0].pubkey;
            console.log(`Found player profile pubkey: ${playerProfilePubkey}`);
          }
        } catch (profileError) {
          console.warn(`Failed to fetch player profiles from blockchain service:`, profileError);
        }
      }
      
      if (isBlockchainServiceAvailable && playerProfilePubkey) {
        console.log(`Using blockchain service for crew sync`);
        try {
          const blockchainResponse = await fetchCrewList(playerProfilePubkey);
          
          // Transform blockchain service response to Star Atlas API format with safe defaults
          validatedData = {
            total: blockchainResponse.total,
            crew: blockchainResponse.crew.map(member => ({
              _id: member.das_id,
              dasID: member.das_id,
              mintOffset: member.mint_offset ?? undefined,
              faction: member.faction || "Unknown",
              species: member.species || "Unknown",
              sex: member.sex || "Unknown",
              name: member.name || "Unknown Crew",
              university: member.university ?? undefined,
              age: member.age ?? 25,
              openness: member.openness,
              conscientiousness: member.conscientiousness,
              extraversion: member.extraversion,
              agreeableness: member.agreeableness,
              neuroticism: member.neuroticism,
              rarity: member.rarity || "common",
              aptitudes: member.aptitudes ?? undefined,
              appearance: member.appearance ?? undefined,
              imageUrl: member.image_url ?? undefined,
              updatedAt: member.updated_at ?? undefined,
              createdAt: member.created_at ?? undefined,
            })),
          };
        } catch (blockchainError) {
          console.warn(`Blockchain service failed, falling back to Star Atlas API:`, blockchainError);
          const crewUrl = `https://galaxy.staratlas.com/crew/inventory/${playerProfilePubkey}`;
          const response = await fetch(crewUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch crew: ${response.status}`);
          }
          crewData = await response.json();
          validatedData = StarAtlasCrewResponse.parse(crewData);
        }
      } else {
        // Fallback to Star Atlas API
        const crewUrl = playerProfilePubkey 
          ? `https://galaxy.staratlas.com/crew/inventory/${playerProfilePubkey}`
          : `https://galaxy.staratlas.com/crew/inventory/${walletAddress}`;
        
        console.log(`Using Star Atlas API fallback: ${crewUrl}`);
        
        const response = await fetch(crewUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch crew: ${response.status}`);
        }
        
        crewData = await response.json();
        validatedData = StarAtlasCrewResponse.parse(crewData);
      }
      
      // Enrich and cache all crew
      const enrichedCrew = validatedData.crew.map(member => {
        const stats = calculateStats(member);
        return {
          ...member,
          ...stats,
        };
      });
      
      // Cache all crew in database
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

      // Get or create player profile
      let profile = await storage.getPlayerProfileByWallet(walletAddress);
      
      const crewDasIds = enrichedCrew.map(c => c.dasID);
      let selectedCrewIds: string[] = [];
      let replacedCount = 0;
      
      if (!profile) {
        // First sync: select first 15 crew as default team
        selectedCrewIds = crewDasIds.slice(0, Math.min(15, crewDasIds.length));
        
        profile = await storage.createPlayerProfile({
          walletAddress,
          playerProfilePubkey: playerProfilePubkey || null,
          teamName: "My Team",
          formation: "442",
          selectedCrewIds: selectedCrewIds,
          atlasBalance: 1250,
          ownedPerks: ["iron-defense"],
          lastCrewSync: new Date().toISOString(),
        });
        
        console.log(`Created new profile with ${selectedCrewIds.length} crew members`);
      } else {
        // Subsequent sync: verify existing crew and replace missing ones
        const existingSelectedIds = (profile.selectedCrewIds as string[]) || [];
        const stillAvailable = existingSelectedIds.filter(id => crewDasIds.includes(id));
        
        // Get reserve pool: all crew not in stillAvailable
        const reservePool = crewDasIds.filter(id => !stillAvailable.includes(id));
        
        // Randomize reserve pool using Fisher-Yates shuffle
        const shuffledReserves = [...reservePool];
        for (let i = shuffledReserves.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledReserves[i], shuffledReserves[j]] = [shuffledReserves[j], shuffledReserves[i]];
        }
        
        // Calculate how many slots need filling
        const slotsToFill = Math.min(
          15 - stillAvailable.length,
          shuffledReserves.length
        );
        
        // Take random replacements from shuffled reserve pool
        const replacements = shuffledReserves.slice(0, slotsToFill);
        replacedCount = replacements.length;
        
        selectedCrewIds = [...stillAvailable, ...replacements];
        
        if (replacedCount > 0) {
          console.log(`Replaced ${replacedCount} missing crew members with random reserves`);
        }
        
        // Update profile
        profile = await storage.updatePlayerProfile(profile.id, {
          playerProfilePubkey: playerProfilePubkey || profile.playerProfilePubkey,
          selectedCrewIds: selectedCrewIds,
          lastCrewSync: new Date().toISOString(),
        });
      }
      
      res.json({
        profile,
        totalCrew: enrichedCrew.length,
        selectedCrew: selectedCrewIds.length,
        replacedCount,
        message: replacedCount > 0 
          ? `Your formation has changed: ${replacedCount} player${replacedCount > 1 ? 's' : ''} replaced`
          : "Crew synced successfully",
      });
    } catch (error) {
      console.error("Error syncing crew:", error);
      res.status(500).json({ 
        error: "Failed to sync crew",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
