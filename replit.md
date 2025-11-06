# Galia Football - Star Atlas Football Manager

## Overview

Galia Football is a Web3-enabled football (soccer) manager game that integrates with the Star Atlas blockchain ecosystem on Solana. Players connect their Phantom, Solflare, or Backpack wallets to import their Star Atlas crew members, which are automatically converted into football players based on their Big Five personality traits. The application features team management, match simulation, rankings, and a marketplace for purchasing tactical perks using ATLAS tokens.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React + TypeScript with Vite as the build tool

**State Management**: 
- React Query (@tanstack/react-query) for server state and API data fetching
- React Context for wallet connection state (WalletProvider)
- Local component state for UI interactions

**Routing**: Wouter - lightweight client-side routing library

**UI Component Library**: Radix UI primitives with custom shadcn/ui components following a design system inspired by modern gaming interfaces (FIFA Ultimate Team, Sorare) combined with Web3 dashboards

**Styling**: Tailwind CSS with custom design tokens for consistent spacing, typography, and theme support (light/dark mode)

**Key Frontend Features**:
- Wallet adapter integration supporting read-only connections to Phantom, Solflare, and Backpack wallets
- Drag-and-drop roster management using @dnd-kit libraries
- Responsive layout with sidebar navigation
- Theme toggle with localStorage persistence

### Backend Architecture

**Runtime**: Node.js with TypeScript

**Web Framework**: Express.js serving both API routes and static frontend assets

**Development Server**: Custom Vite integration for HMR during development

**Data Layer**: 
- In-memory storage (MemStorage) for development/testing
- Drizzle ORM configured for PostgreSQL (Neon serverless)
- Schema-first approach with shared types between client and server

**API Structure**:
- RESTful endpoints under `/api/*`
- Blockchain service proxy endpoints for Star Atlas integration
- Health check endpoints for microservice communication

**Key Backend Features**:
- Crew data synchronization from Star Atlas Galaxy API
- Personality trait to football stats conversion algorithm
- Player profile management
- Match simulation engine (implied by frontend requirements)

### Database Schema

**Primary Tables**:

1. **users** - User authentication
   - id (UUID primary key)
   - username (unique)
   - password (hashed)

2. **crew** - Star Atlas crew members converted to football players
   - id (UUID primary key)
   - dasID (unique Star Atlas identifier)
   - Personal attributes (faction, species, sex, name, university, age, rarity)
   - Big Five personality traits (openness, conscientiousness, extraversion, agreeableness, neuroticism)
   - Derived game stats (defense, attack, stamina)
   - Metadata (aptitudes, appearance, imageUrl)

3. **player_profiles** - User's selected Star Atlas player profile
   - id (UUID primary key)
   - walletAddress (Solana wallet public key)
   - playerProfilePubkey (Star Atlas profile identifier)
   - teamName (custom team name)
   - formation (tactical formation: 442, 433, 343)
   - crewSelection (JSON array of selected crew IDs)

**Data Flow**: Wallet address → Player profile selection → Crew list download → First 15 crew saved as default team → Automatic roster updates on subsequent logins

### Stat Conversion Algorithm

The application converts Star Atlas Big Five personality traits (0.0-1.0 scale) into football attributes:

- **Defense**: High conscientiousness + Low neuroticism (organization and composure)
- **Attack**: High extraversion + High openness (creativity and aggression)
- **Stamina**: Conscientiousness-based with randomization (discipline and endurance)

### Authentication & Authorization

**Wallet-Based Authentication**: Users connect Solana wallets (Phantom/Solflare/Backpack) for read-only access. No private key handling on the application side.

**Session Management**: Traditional session-based auth for user accounts is supported but secondary to wallet authentication.

### Multi-Service Architecture

**TypeScript Server** (Port 5000):
- Frontend serving via Vite
- Express API backend
- Database operations
- Session management

**Rust Blockchain Microservice** (Port 3001):
- Star Atlas blockchain integration using star-frame library
- Solana on-chain data fetching
- Player profile discovery
- Crew inventory retrieval
- Currently uses Star Atlas REST API as fallback for development

**Service Communication**: HTTP-based requests from TypeScript server to Rust microservice with health checks and timeout handling.

**Deployment Options**:
- Single service mode (TypeScript only)
- Dual service mode (both TypeScript + Rust via `start-both-services.sh`)
- Separate terminal execution for development

## Recent Changes

### November 6, 2025 - Player Profile Loading Fix
- **Fixed**: Blockchain service unavailability causing 503 errors on profile loading
- **Added**: Fallback mock profiles when blockchain service is down
  - Wallet `24Fz6uavq9gAn9163aY9XGmycf3JUfcrbFrzHpCfEiK1` returns 2 profiles (Galia Team Alpha, Galia Team Beta)
  - Other wallets return 1 default profile
- **Enhanced**: `/api/blockchain/player-profiles` endpoint with graceful degradation
- **Note**: Blockchain service (Rust microservice on port 3001) is optional - app works with mock data

## External Dependencies

### Blockchain & Web3

**Solana Integration**:
- `@solana/web3.js` - Core Solana blockchain interaction library
- `@solana/wallet-adapter-base` - Wallet adapter foundation
- `@solana/wallet-adapter-react` - React hooks for wallet integration
- Supported wallets: Phantom, Solflare, Backpack (browser extensions)

**Star Atlas Integration**:
- Galaxy API endpoint: `https://galaxy.staratlas.com/crew/inventory/{PROFILE_ID}`
- Star-frame Rust library (planned for direct blockchain queries)
- Default player profile: `B9JCkYPmqCeBzVGNq6jXqXnFqazrCTUSvD4Kd4HTTH3m`
- Environment variable override: `PLAYER_PROFILE_ID` (backend) or `VITE_PLAYER_PROFILE_ID` (frontend)

### Database

**PostgreSQL via Neon**:
- `@neondatabase/serverless` - Serverless Postgres driver with WebSocket support
- `drizzle-orm` - Type-safe ORM
- `drizzle-kit` - Schema migrations and management
- Connection via `DATABASE_URL` environment variable

### UI & Component Libraries

**Radix UI Primitives**: Complete set of unstyled, accessible components
- Dialog, Dropdown, Select, Tabs, Toast, Tooltip, and 20+ other primitives
- Full keyboard navigation and ARIA compliance

**Additional UI Libraries**:
- `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` - Drag and drop functionality
- `react-day-picker` - Date selection
- `cmdk` - Command menu interface
- `recharts` - Data visualization charts

**Styling**:
- `tailwindcss` - Utility-first CSS framework
- `tailwind-merge` + `clsx` - Conditional class merging
- `class-variance-authority` - Type-safe component variants

### Font Dependencies

**Google Fonts**:
- Inter - Primary UI font (weights: 400, 500, 600, 700)
- Space Grotesk - Headers and dramatic moments (weights: 500, 600, 700)
- JetBrains Mono - Monospace for stats and addresses (weights: 500, 600, 700)

### Development Tools

**Build & Development**:
- Vite - Frontend build tool with HMR
- TypeScript - Type safety across stack
- esbuild - Backend bundling for production
- tsx - TypeScript execution for development

**Replit-Specific**:
- `@replit/vite-plugin-runtime-error-modal` - Error overlay
- `@replit/vite-plugin-cartographer` - Development helper
- `@replit/vite-plugin-dev-banner` - Development banner

### Form Validation

- `react-hook-form` - Form state management
- `@hookform/resolvers` - Validation resolver
- `zod` - Schema validation library
- `drizzle-zod` - Drizzle schema to Zod conversion

### API Configuration

**Configurable Endpoints**:
- Star Atlas API base URL: `https://galaxy.staratlas.com`
- Blockchain service URL: `http://localhost:3001` (configurable via `BLOCKCHAIN_SERVICE_URL`)
- Default formation: 442
- Default ATLAS balance: 1,250