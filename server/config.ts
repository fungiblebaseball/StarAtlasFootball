/**
 * Server configuration for Galia Football
 * 
 * Player Profile ID: The Star Atlas wallet address used to fetch crew inventory
 * Default: B9JCkYPmqCeBzVGNq6jXqXnFqazrCTUSvD4Kd4HTTH3m
 * 
 * You can override this by setting the PLAYER_PROFILE_ID environment variable
 */

export const config = {
  // Star Atlas player profile ID (wallet address)
  playerProfileId: process.env.PLAYER_PROFILE_ID || "B9JCkYPmqCeBzVGNq6jXqXnFqazrCTUSvD4Kd4HTTH3m",
  
  // API endpoints
  starAtlasApiUrl: "https://galaxy.staratlas.com",
  
  // Game constants
  defaultFormation: "442",
  defaultAtlasBalance: 1250,
} as const;
