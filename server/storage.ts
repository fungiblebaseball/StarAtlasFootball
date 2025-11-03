import { type User, type InsertUser, type Crew, type InsertCrew, type PlayerProfile, type InsertPlayerProfile } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Crew methods
  getAllCrew(): Promise<Crew[]>;
  getCrewByDasId(dasId: string): Promise<Crew | undefined>;
  upsertCrew(crew: InsertCrew): Promise<Crew>;
  
  // Player Profile methods
  getPlayerProfile(profileId: string): Promise<PlayerProfile | undefined>;
  createPlayerProfile(profile: InsertPlayerProfile): Promise<PlayerProfile>;
  updatePlayerProfile(profileId: string, updates: Partial<PlayerProfile>): Promise<PlayerProfile>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private crew: Map<string, Crew>;
  private profiles: Map<string, PlayerProfile>;

  constructor() {
    this.users = new Map();
    this.crew = new Map();
    this.profiles = new Map();
  }

  // User methods
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

  // Crew methods
  async getAllCrew(): Promise<Crew[]> {
    return Array.from(this.crew.values());
  }

  async getCrewByDasId(dasId: string): Promise<Crew | undefined> {
    return Array.from(this.crew.values()).find(
      (member) => member.dasID === dasId,
    );
  }

  async upsertCrew(insertCrew: InsertCrew): Promise<Crew> {
    const existing = await this.getCrewByDasId(insertCrew.dasID);
    
    if (existing) {
      const updated: Crew = { ...existing, ...insertCrew };
      this.crew.set(existing.id, updated);
      return updated;
    } else {
      const id = randomUUID();
      const newCrew: Crew = { 
        id, 
        ...insertCrew,
        mintOffset: insertCrew.mintOffset ?? null,
        faction: insertCrew.faction ?? null,
        species: insertCrew.species ?? null,
        sex: insertCrew.sex ?? null,
        university: insertCrew.university ?? null,
        age: insertCrew.age ?? null,
        aptitudes: insertCrew.aptitudes ?? null,
        appearance: insertCrew.appearance ?? null,
        imageUrl: insertCrew.imageUrl ?? null,
        defense: insertCrew.defense ?? null,
        attack: insertCrew.attack ?? null,
        stamina: insertCrew.stamina ?? null,
        updatedAt: insertCrew.updatedAt ?? null,
        createdAt: insertCrew.createdAt ?? null,
      };
      this.crew.set(id, newCrew);
      return newCrew;
    }
  }

  // Player Profile methods
  async getPlayerProfile(profileId: string): Promise<PlayerProfile | undefined> {
    return Array.from(this.profiles.values()).find(
      (profile) => profile.profileId === profileId,
    );
  }

  async createPlayerProfile(insertProfile: InsertPlayerProfile): Promise<PlayerProfile> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const profile: PlayerProfile = {
      id,
      teamName: insertProfile.teamName ?? null,
      formation: insertProfile.formation ?? "442",
      selectedCrewIds: insertProfile.selectedCrewIds ?? null,
      wins: insertProfile.wins ?? 0,
      losses: insertProfile.losses ?? 0,
      draws: insertProfile.draws ?? 0,
      goalsFor: insertProfile.goalsFor ?? 0,
      goalsAgainst: insertProfile.goalsAgainst ?? 0,
      atlasBalance: insertProfile.atlasBalance ?? 0,
      ownedPerks: insertProfile.ownedPerks ?? null,
      createdAt: now,
      updatedAt: now,
      ...insertProfile,
    };
    this.profiles.set(id, profile);
    return profile;
  }

  async updatePlayerProfile(profileId: string, updates: Partial<PlayerProfile>): Promise<PlayerProfile> {
    const existing = await this.getPlayerProfile(profileId);
    if (!existing) {
      throw new Error(`Profile ${profileId} not found`);
    }
    
    const updated: PlayerProfile = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    this.profiles.set(existing.id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
