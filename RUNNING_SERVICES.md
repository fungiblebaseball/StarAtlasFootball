# Running Services - Galia Football

## Development Mode

### Option 1: TypeScript Server Only (Default)
The Replit workflow automatically starts only the TypeScript/Express server:
```bash
npm run dev
```
This runs on port 5000 and includes frontend + backend.

### Option 2: Both Services (TypeScript + Rust Blockchain)
To start both the TypeScript server AND the Rust blockchain service:

```bash
bash start-both-services.sh
```

This will start:
- **TypeScript Server**: `http://localhost:5000` (frontend + backend)
- **Rust Blockchain Service**: `http://localhost:3001` (blockchain API)

### Option 3: Start Services Separately

**Terminal 1 - TypeScript Server:**
```bash
npm run dev
```

**Terminal 2 - Rust Blockchain Service:**
```bash
cd blockchain-service
RUST_LOG=info cargo run
```

## Service Overview

### TypeScript Server (Port 5000)
- Frontend (Vite + React)
- Backend API (Express)
- Database (PostgreSQL)
- Authentication & Routes

### Rust Blockchain Service (Port 3001)
- Star Atlas blockchain integration
- Solana wallet operations
- Crew list fetching
- Player profile management

## Endpoints

### Rust Blockchain Service
- `GET /health` - Health check
- `GET /api/player-profiles?wallet_address=<address>` - Get player profiles for wallet
- `GET /api/crew?player_profile_pubkey=<pubkey>` - Get crew list for profile

### TypeScript Backend
- `GET /api/crew` - Get cached crew from database
- `POST /api/profile/sync-crew` - Sync crew from blockchain
- All other game routes (matches, perks, etc.)

## Notes

- The Rust service is **optional** for development
- Crew data can be cached in PostgreSQL database
- Frontend works fine with only TypeScript server running
- Rust service is needed for real-time blockchain data
