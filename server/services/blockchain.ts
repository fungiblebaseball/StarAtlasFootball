/**
 * Blockchain Service Client
 * 
 * TypeScript client for communicating with the Rust blockchain microservice.
 * Handles fetching player profiles and crew data from Solana blockchain.
 */

const BLOCKCHAIN_SERVICE_URL = process.env.BLOCKCHAIN_SERVICE_URL || "http://localhost:3001";
const DEFAULT_TIMEOUT = 10000; // 10 seconds
const HEALTH_CHECK_CACHE_MS = 30000; // Cache health check for 30 seconds

// Cached health check state
let lastHealthCheck: { available: boolean; timestamp: number } | null = null;

// Response types matching Rust microservice
export interface PlayerProfile {
  pubkey: string;
  authority: string;
  name?: string;
  metadata?: Record<string, any>;
}

export interface CrewMember {
  das_id: string;
  mint_offset?: number;
  faction?: string;
  species?: string;
  sex?: string;
  name: string;
  university?: string;
  age?: number;
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  rarity: string;
  aptitudes?: Record<string, any>;
  appearance?: Record<string, any>;
  image_url?: string;
  updated_at?: string;
  created_at?: string;
}

export interface PlayerProfilesResponse {
  wallet_address: string;
  profiles: PlayerProfile[];
  count: number;
}

export interface CrewListResponse {
  player_profile_pubkey: string;
  crew: CrewMember[];
  total: number;
}

export interface BlockchainError {
  error: string;
  message?: string;
}

/**
 * Fetch player profiles for a given wallet address
 */
export async function fetchPlayerProfiles(
  walletAddress: string,
  timeout: number = DEFAULT_TIMEOUT
): Promise<PlayerProfilesResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const url = `${BLOCKCHAIN_SERVICE_URL}/api/player-profiles?wallet_address=${encodeURIComponent(walletAddress)}`;
    console.log(`[Blockchain Service] Fetching player profiles: ${url}`);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as BlockchainError;
      throw new Error(
        errorData.message || `Blockchain service returned ${response.status}`
      );
    }

    const data = await response.json() as PlayerProfilesResponse;
    console.log(`[Blockchain Service] Found ${data.count} player profiles`);
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error(`Blockchain service request timeout after ${timeout}ms`);
      }
      throw error;
    }
    throw new Error('Unknown error fetching player profiles');
  }
}

/**
 * Fetch crew list for a given player profile pubkey
 */
export async function fetchCrewList(
  playerProfilePubkey: string,
  timeout: number = DEFAULT_TIMEOUT
): Promise<CrewListResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const url = `${BLOCKCHAIN_SERVICE_URL}/api/crew?player_profile_pubkey=${encodeURIComponent(playerProfilePubkey)}`;
    console.log(`[Blockchain Service] Fetching crew list: ${url}`);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as BlockchainError;
      throw new Error(
        errorData.message || `Blockchain service returned ${response.status}`
      );
    }

    const data = await response.json() as CrewListResponse;
    console.log(`[Blockchain Service] Found ${data.total} crew members`);
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error(`Blockchain service request timeout after ${timeout}ms`);
      }
      throw error;
    }
    throw new Error('Unknown error fetching crew list');
  }
}

/**
 * Check if blockchain service is available (cached for 30 seconds)
 */
export async function checkBlockchainServiceHealth(forceRefresh = false): Promise<boolean> {
  const now = Date.now();
  
  // Return cached result if available and not expired
  if (!forceRefresh && lastHealthCheck && (now - lastHealthCheck.timestamp) < HEALTH_CHECK_CACHE_MS) {
    return lastHealthCheck.available;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${BLOCKCHAIN_SERVICE_URL}/health`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    
    const available = response.ok;
    lastHealthCheck = { available, timestamp: now };
    return available;
  } catch {
    lastHealthCheck = { available: false, timestamp: now };
    return false;
  }
}
