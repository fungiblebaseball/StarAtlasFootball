/**
 * Client configuration for Galia Football
 * 
 * Player Profile ID: The Star Atlas wallet address used to fetch crew inventory
 * Default: B9JCkYPmqCeBzVGNq6jXqXnFqazrCTUSvD4Kd4HTTH3m
 * 
 * You can override this by setting the VITE_PLAYER_PROFILE_ID environment variable
 */

export const config = {
  // Star Atlas player profile ID (wallet address)
  playerProfileId: import.meta.env.VITE_PLAYER_PROFILE_ID || "B9JCkYPmqCeBzVGNq6jXqXnFqazrCTUSvD4Kd4HTTH3m",
} as const;
