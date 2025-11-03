# Star Atlas Crew Integration

## Overview

Galia Football integrates with the **Star Atlas Galaxy API** to fetch real crew members and convert their Big Five personality traits into football player attributes.

## Configuration

### Player Profile ID

The player profile ID is a Star Atlas wallet address that identifies which crew inventory to fetch. 

**Default Profile ID:** `B9JCkYPmqCeBzVGNq6jXqXnFqazrCTUSvD4Kd4HTTH3m`

### Changing the Profile ID

You can override the default profile ID in two ways:

1. **Environment Variable (Backend):**
   ```bash
   PLAYER_PROFILE_ID=YourStarAtlasWalletAddress
   ```

2. **Environment Variable (Frontend):**
   ```bash
   VITE_PLAYER_PROFILE_ID=YourStarAtlasWalletAddress
   ```

3. **Code Configuration:**
   - Backend: Edit `server/config.ts`
   - Frontend: Edit `client/src/lib/config.ts`

## API Endpoint

The application fetches crew data from:
```
https://galaxy.staratlas.com/crew/inventory/{PROFILE_ID}
```

## Big Five Personality Traits

Each Star Atlas crew member has five personality traits (values from 0.0 to 1.0):

### 1. **Openness** (0.0 - 1.0)
- Creativity, imagination, and willingness to try new things
- **Football Impact:** Contributes to attack power and tactical flexibility

### 2. **Conscientiousness** (0.0 - 1.0)
- Organization, dependability, and self-discipline
- **Football Impact:** Primary contributor to defense and stamina

### 3. **Extraversion** (0.0 - 1.0)
- Sociability, assertiveness, and energy
- **Football Impact:** Major contributor to attack and counter-attacks

### 4. **Agreeableness** (0.0 - 1.0)
- Cooperation, kindness, and team orientation
- **Football Impact:** Enhances team play, stamina, and defensive coordination

### 5. **Neuroticism** (0.0 - 1.0)
- Emotional instability and anxiety
- **Football Impact:** High neuroticism reduces defense and stamina (inverse relationship)

## Stat Calculation Formulas

The personality traits are converted into three core football attributes:

### Defense (0-100)
```javascript
defense = (conscientiousness × 50 + (1 - neuroticism) × 50) × 0.9 + random(0-20)
```
- **High conscientiousness** = Better defender
- **Low neuroticism** = More stable under pressure
- Random variance adds uniqueness

### Attack (0-100)
```javascript
attack = (extraversion × 50 + openness × 50) × 0.9 + random(0-20)
```
- **High extraversion** = More aggressive and forward-thinking
- **High openness** = Creative playmaking
- Random variance adds unpredictability

### Stamina (0-100)
```javascript
stamina = (conscientiousness × 40 + (1 - neuroticism) × 40 + agreeableness × 20) × 0.9 + random(0-20)
```
- **High conscientiousness** = Disciplined fitness
- **Low neuroticism** = Mental endurance
- **High agreeableness** = Team player energy
- Random variance simulates form fluctuations

## Position Assignment

Positions are automatically assigned based on personality profiles:

### Goalkeeper (GK)
- **Conscientiousness > 0.7** (highly disciplined)
- **Neuroticism < 0.3** (calm under pressure)

### Defender (DEF)
- **Conscientiousness > 0.6** (organized)
- **Agreeableness > 0.5** (team-oriented)

### Forward (FWD)
- **Extraversion > 0.6** (assertive)
- **Openness > 0.5** (creative)

### Midfielder (MID)
- Default position for balanced profiles
- Versatile players who don't fit extremes

## Rarity System

Star Atlas crew members come in five rarity tiers:
- **Common** - Base-level crew
- **Uncommon** - Slightly enhanced
- **Rare** - Notable abilities
- **Epic** - Exceptional talent
- **Legendary** - Elite performers

*Note: Rarity affects visual presentation but stats are purely personality-based*

## Data Caching

The application caches crew data in the database to:
- Reduce API calls to Star Atlas
- Improve performance
- Enable offline functionality
- Maintain consistent stats (random variance is calculated once)

### Refreshing Data

Click the **"Refresh from API"** button on the Roster page to:
1. Fetch latest crew from Star Atlas API
2. Recalculate stats with new random variance
3. Update the local database cache

## Example Crew Analysis

### Example 1: Elite Defender
```json
{
  "name": "Cosmic Guardian",
  "conscientiousness": 0.92,
  "neuroticism": 0.12,
  "agreeableness": 0.88,
  "defense": 92,
  "stamina": 87,
  "position": "DEF"
}
```
**Why this works:** High discipline + low stress + team player = perfect defender

### Example 2: Star Forward
```json
{
  "name": "Nova Striker",
  "extraversion": 0.90,
  "openness": 0.85,
  "agreeableness": 0.94,
  "attack": 95,
  "stamina": 78,
  "position": "FWD"
}
```
**Why this works:** High energy + creativity + team play = goal scorer

### Example 3: Reliable Goalkeeper
```json
{
  "name": "Galaxy Keeper",
  "conscientiousness": 0.88,
  "neuroticism": 0.06,
  "agreeableness": 0.67,
  "defense": 88,
  "stamina": 82,
  "position": "GK"
}
```
**Why this works:** Extremely disciplined + calm under pressure = shot stopper

## Match Simulation (Future Implementation)

When matches are simulated using Poisson distribution, personality traits will affect:

1. **Occasions Created**
   - Influenced by team's average extraversion and openness
   - More creative, assertive teams create more chances

2. **Defensive Saves**
   - Influenced by team's average conscientiousness
   - Lower team neuroticism improves save success rate

3. **Counter-Attack Success**
   - Requires high extraversion and low neuroticism
   - Quick, confident decision-making under transition

4. **Stamina Degradation**
   - Higher team stamina = better late-game performance
   - Low neuroticism players maintain composure when tired

## API Response Structure

The Star Atlas API returns crew data in this format:

```json
{
  "total": 100,
  "crew": [
    {
      "_id": "66bdaf54639245aa7dfb364c",
      "dasID": "8HRZtnnSiRbutAqXFcYoSEXTP9vNUBgfaTAzc3QAuiGn",
      "faction": "ONI",
      "species": "Sogmian",
      "sex": "Female",
      "name": "Irianel 𐎉 Busan",
      "university": "ONI Institute",
      "age": 27.23,
      "openness": 0.85,
      "conscientiousness": 0.16,
      "extraversion": 0.9,
      "agreeableness": 0.94,
      "neuroticism": 0.06,
      "rarity": "Rare",
      "aptitudes": {
        "Operator": "minor",
        "Fitness": "minor",
        "Flight": "major"
      },
      "imageUrl": "https://cdn.staratlas.com/crew/v1/336833_full.jpeg"
    }
  ]
}
```

## Technical Implementation

### Backend Routes

- `GET /api/crew?profileId={id}` - Fetch and cache crew from Star Atlas
- `GET /api/crew/cached` - Get crew from local database
- `GET /api/profile?profileId={id}` - Get player profile and settings
- `PATCH /api/profile` - Update team formation and selections

### Database Schema

Three main tables:
1. **crew** - Cached Star Atlas crew with calculated stats
2. **player_profile** - User settings, formation, selected crew
3. **users** - Authentication (future implementation)

## Future Enhancements

1. **Dynamic Profile Switching**
   - Allow users to connect their own Phantom wallet
   - Fetch their personal Star Atlas crew inventory

2. **Trait-Based Match Events**
   - High openness = creative passes and unexpected plays
   - High neuroticism = occasional mistakes under pressure
   - High agreeableness = better team chemistry bonuses

3. **Personality Synergies**
   - Certain trait combinations unlock special team abilities
   - Example: 3+ high-agreeableness players = +10% stamina boost

4. **Training & Evolution**
   - Use $ATLAS tokens to temporarily boost specific traits
   - Traits return to baseline after matches (true to personality)
