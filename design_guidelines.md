# Galia Football - Design Guidelines

## Design Approach

**Reference-Based Approach**: Gaming + Web3 Dashboard Hybrid

Primary inspiration from modern sports gaming interfaces (FIFA Ultimate Team, Sorare) combined with clean Web3 dashboard aesthetics (Uniswap, Magic Eden). The design prioritizes visual excitement for the gaming experience while maintaining data clarity for management features.

**Core Principle**: Create an immersive football manager experience that feels premium and futuristic, balancing the thrill of match simulation with the precision of team management.

---

## Typography System

### Font Selection
- **Primary Font**: "Inter" (via Google Fonts) - Clean, modern, excellent for UI and data
- **Accent Font**: "Space Grotesk" (via Google Fonts) - Used for headers, match events, dramatic moments
- **Monospace**: "JetBrains Mono" - Stats, numbers, wallet addresses

### Typography Hierarchy
- **Hero Headlines**: Space Grotesk, text-5xl to text-7xl, font-bold
- **Page Titles**: Space Grotesk, text-3xl to text-4xl, font-bold
- **Section Headers**: Space Grotesk, text-2xl, font-semibold
- **Card Titles**: Inter, text-lg to text-xl, font-semibold
- **Body Text**: Inter, text-base, font-normal
- **Small Text/Labels**: Inter, text-sm, font-medium
- **Micro Text**: Inter, text-xs, font-normal
- **Numbers/Stats**: JetBrains Mono, text-base to text-2xl, font-bold

---

## Layout System

### Spacing Primitives
Consistent use of Tailwind spacing units: **2, 4, 6, 8, 12, 16, 20, 24**

- Component padding: p-4, p-6, p-8
- Section spacing: py-12, py-16, py-20
- Card gaps: gap-4, gap-6
- Grid gaps: gap-4, gap-6, gap-8
- Margins between sections: mb-8, mb-12, mb-16

### Grid System
- **Dashboard Grid**: 12-column grid with responsive breakpoints
- **Crew Cards**: grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5
- **Match Cards**: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- **Stats Tables**: Full-width with responsive horizontal scroll on mobile
- **Max Width Container**: max-w-7xl mx-auto for main content areas

### Layout Patterns
- **Dashboard Layout**: Sidebar (280px fixed) + Main content area (fluid)
- **Full-Width Sections**: Match simulator, rankings table
- **Card Grid Sections**: Roster, match history, marketplace
- **Split Layouts**: Match preview (50/50 team comparison on desktop)

---

## Component Library

### Navigation
**Main Sidebar** (Desktop)
- Fixed left sidebar, 280px wide
- Logo at top (h-16 with p-4)
- Navigation items with icon + text (h-12 each)
- Active state: subtle background, border-l-4 accent
- User profile card at bottom with wallet info
- Collapse to icon-only on tablet (<1024px)

**Mobile Navigation**
- Top app bar with hamburger menu
- Slide-out drawer from left
- Bottom tab bar for primary actions (Dashboard, Roster, Matches, Profile)

### Cards

**Crew Card** (Primary asset display)
- Aspect ratio: 3:4 portrait orientation
- Image at top (60% height), gradient overlay at bottom
- Crew name (Space Grotesk, text-lg, font-semibold)
- Rarity indicator (top-right badge)
- Stats row at bottom (small icons + numbers)
- Numbered badge (top-left) for starting XI
- Hover: subtle lift (transform scale-105), shadow-xl
- Drag state: opacity-60, scale-95

**Match Card** (Result display)
- Horizontal layout: Team A | Score | Team B
- Team sections: Logo/image + name
- Score in center (JetBrains Mono, text-4xl, font-bold)
- Date/time below (text-sm)
- Match status badge (Completed/Scheduled/Live)
- Click to view detailed match log

**Stat Card** (Dashboard widgets)
- Compact size (min-h-32)
- Icon at top (h-8 w-8)
- Large number (JetBrains Mono, text-3xl)
- Label below (text-sm, uppercase tracking-wide)
- Grid layout: grid-cols-2 md:grid-cols-4

**Perk Card** (Marketplace item)
- Square aspect ratio
- Icon/illustration at center
- Perk name and description
- Price in $ATLAS (JetBrains Mono)
- "Purchase" button at bottom
- Owned state: checkmark badge, muted appearance

### Data Tables

**Rankings Table**
- Sticky header on scroll
- Alternating row treatment for readability
- Column headers: Position, Team, Played, Won, Drawn, Lost, GF, GA, GD, Points
- Highlight user's team row
- Trophy icons for top 3 positions
- Promotion/relegation zone indicators (border-l-4)
- Responsive: Horizontal scroll on mobile with fixed left column

**Match Calendar**
- Week-by-week accordion structure
- Each matchday expandable
- Match rows: Team A vs Team B format
- Date/time on left
- Score/status on right
- Click to expand for match details

### Forms & Inputs

**Wallet Connect Button** (Hero CTA)
- Large size (h-14, px-8)
- Space Grotesk font
- Icon + "Connect Phantom Wallet" text
- Prominent placement on landing page
- Connected state: Show truncated wallet address

**Formation Selector**
- Visual radio buttons showing formation diagrams
- Options: 4-4-2, 4-3-3, 3-4-3
- Each shows pitch layout with player dots
- Selected: border-2, shadow-md
- Size: 120px x 160px per option

**Drag-and-Drop Zone**
- Football pitch visual background (subtle)
- 11 drop zones marked with position labels (GK, DEF, MID, FWD)
- Numbered slots (1-11)
- Empty state: dashed border, "Drag player here"
- Occupied: Show crew card (smaller size)
- Bench area below for remaining players

### Interactive Elements

**Match Simulator Display**
- Full-screen overlay when match is running
- Animated pitch visualization (optional, minimal)
- Real-time event log feed (scrolling list)
- Score ticker at top (large, always visible)
- Events: Goal, Save, Counterattack icons + timestamp + description
- "Skip to Result" button
- Close/minimize option

**Live Update Indicator**
- Subtle pulse animation on data that updates
- Small dot indicator next to section titles
- Toast notifications for critical updates (match completed, new ranking)

### Badges & Labels
- **Rarity**: Small pill shape, uppercase text-xs, positioned top-right on cards
- **Status**: Rounded badges (Scheduled/Live/Completed for matches, Active/Expired for perks)
- **Position Tags**: Small circular badges for GK/DEF/MID/FWD
- **Achievement Badges**: Trophy/star icons for user accomplishments

---

## Page-Specific Layouts

### Landing Page
- Full-viewport hero section (min-h-screen)
- Centered content: Logo + tagline + wallet connect button
- Background: Animated gradient or subtle particle effect
- Below fold: Feature showcase (3-column grid)
  - "Build Your Team" - crew management visual
  - "Compete in Tournaments" - trophy/ranking visual  
  - "Earn Rewards" - $ATLAS token visual
- Footer: Links, social, documentation

### Dashboard
- Top: Stats overview (4-card grid: Wins, Goals, Ranking, Token Balance)
- Middle: Current team formation preview (click to edit)
- Below: Recent matches (3 cards, horizontal layout)
- Sidebar: Quick actions, girone standing widget
- Real-time updates: subtle pulse on changing data

### Roster Page
- Filter bar at top (rarity, position, name search)
- Crew grid (responsive columns)
- First 15 crew: Highlighted with numbered badges
- "Build Team" button (sticky at top-right)
- Modal overlay for team builder (drag-and-drop pitch)

### Match Preview → Review
**Preview Mode** (before match):
- Split-screen: Team A (left) vs Team B (right)
- Formation diagrams showing lineups
- Stat comparison bars (attack, defense, midfield ratings)
- Perks active (badge list)
- "Simulate Match" CTA button

**Review Mode** (after match):
- Score hero section at top (large display)
- Match events timeline (chronological list with icons)
- Goal scorers highlighted
- Key stats summary (possession, shots, saves)
- "View Next Match" CTA

### Rankings Page
- Full-width table with sticky header
- Current girone selector (dropdown if multiple)
- Season/week filter
- Export/share button
- Promotion/relegation zone visual indicators

### Perks & Marketplace
- Grid of perk cards (3-4 columns)
- Filter: Category, price range, owned/not owned
- "Your Perks" section at top showing active perks
- Purchase flow: Modal with Solana transaction details
- Transaction status feedback (pending, success, error)

---

## Spacing & Visual Rhythm

### Page Structure
- Page padding: px-4 md:px-6 lg:px-8
- Section vertical spacing: space-y-12 to space-y-16
- Card spacing within grids: gap-4 to gap-6
- Content max-width: max-w-7xl (except full-width tables)

### Vertical Rhythm
- Hero sections: py-20 to py-32
- Content sections: py-12 to py-16
- Card internal padding: p-4 to p-6
- Button padding: px-6 py-3 (normal), px-8 py-4 (large)

---

## Animations (Minimal)

Use sparingly for feedback and delight:
- **Card hover**: transform scale-105, duration-200
- **Button hover**: scale-105, duration-150
- **Live updates**: Pulse animation (subtle, 2s duration)
- **Match events**: Slide-in from right for new events
- **Modal entry**: Fade in + scale from 0.95 to 1.0
- **Drag feedback**: Smooth transform with spring physics

**Avoid**: Complex animations, auto-playing videos, distracting motion

---

## Images

### Hero Section
- Landing page: Large background image or gradient with geometric patterns
- Suggested: Abstract football/space theme fusion (stadium under stars)
- Overlay: Dark gradient for text readability
- Position: Full-viewport background, background-size: cover

### Crew Cards
- Each crew: Portrait image from Star Atlas API
- Fallback: Gradient placeholder if image fails to load
- Treatment: Slight vignette/gradient overlay at bottom for name/stats

### Match Cards
- Team logos/badges (if available from user data)
- Alternative: Generated avatar/icon based on team name

### Dashboard
- No large background images
- Focus on data clarity and card-based layouts

---

## Accessibility

- All interactive elements: min-h-11 (touch target)
- Focus states: ring-2 offset-2 for keyboard navigation
- Semantic HTML: nav, main, article, section tags
- ARIA labels for icon-only buttons
- Skip to content link for keyboard users
- Form inputs: Associated labels, error messages with aria-live
- Tables: Proper th/td structure, scope attributes

---

**Design Philosophy**: Premium gaming experience meets efficient data management. Every screen should feel responsive, purposeful, and exciting while maintaining clarity for complex football management decisions.