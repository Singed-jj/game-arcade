# Claude Game Design Analysis — Township

## 1. Genre Classification

- **Primary Genre**: Simulation / City Builder
- **Sub-genres**: Farm Management, Production Chain, Match-3 Puzzle (minigame)
- **Similar Games**: Hay Day (Supercell), SimCity BuildIt, Gardenscapes (Playrix)
- This is the actual **Township** by Playrix — a hybrid town-building + farming + match-3 game

## 2. Core Game Mechanics

### Primary Mechanic: Town Building & Production Chain
- **Isometric town building**: Place buildings, factories, roads, decorations on a grid (frames 14, 20-22)
- **Production chain**: Farm crops → Process in factories → Fulfill orders
  - Pastry Factory visible in frame 16: slots for production, queue system, expand with T-cash
  - Multiple product types visible as floating icons over buildings (frames 20-22)

### Secondary Mechanics
1. **Match-3 Puzzle Minigame** (frame 17): Color-matching block puzzle
   - Move counter ("Moves 12"), goal items on right panel (ice cream, cup, horse icons)
   - Special pieces: rainbow balls, combo items visible
   - Irregular board shapes (T-shaped, L-shaped sections)

2. **Order Fulfillment**:
   - Helicopter Pad (frame 18): Character NPCs request specific products, reward coins + XP
   - Airport (frame 13): Timed shipments with goods, coupons, leaderboard integration

3. **Mining System**: "Dig 30 Mine Levels" quest visible in frame 12, mine area in frame 9

### Win/Lose Conditions
- Match-3: Complete goals within move limit
- Town: No explicit lose state — progression-driven
- Events: Timed completion (timers visible: 14H 58M, 1D 6H, 17D 6H)

### Game Rules
- Products require raw materials from farms
- Buildings have production slots (expandable with premium currency)
- Star system for level completion (frame 2: stars earned, frame 9: 14/100 progress)

## 3. Control Scheme

- **Input Method**: Touch-based (tap, drag, pinch-to-zoom)
- **Town View**: Tap buildings to interact, pinch to zoom, swipe to pan (isometric view)
- **Match-3**: Tap/swipe to match blocks
- **UI**: Bottom bar navigation (trophy, star, cards, helicopter, construction icons — frames 21-22)
- **"Tap to Open"** prompt for card packs (frame 4, 12)

## 4. Game Loop

### Core Loop
```
Farm Crops → Process in Factory → Fulfill Orders → Earn Coins/XP → Level Up → Unlock Buildings → Expand Town
```

### Secondary Loops
- **Match-3 Loop**: Play puzzle → Earn stars → Unlock town areas (fog clearing in frame 9)
- **Event Loop**: Complete challenges → Earn event currency → Claim rewards (Knight Pass, frame 7/15)
- **Social Loop**: Join team → Compete in regattas → Chat → Earn co-op rewards (frames 5, 19)

### Session Length
- **Medium-long sessions** (10-30 min): Multiple production timers, order fulfillment
- **Short burst** possible: Quick match-3 levels, claim factory outputs
- **Timer-gated**: Factory production times, airport timers create natural session breaks

### Progression Triggers
- Level counter: 160-161 visible (frames 21-22) — very deep progression
- Star system: 14/100, 49 stars (frames 2, 9) — stars gate town expansion
- XP bar visible at top (frame 21)

## 5. Difficulty & Progression

### Progression Systems
- **Player Level**: 160+ visible (extremely deep progression system)
- **Star Gating**: Stars from match-3 unlock town areas
- **Building Unlocks**: New factories, buildings at level milestones
- **Town Expansion**: Clear fog/clouds to reveal new areas (frame 9)
- **Barn Capacity**: 12973/14020 storage (frame 14) — storage management

### Difficulty Curve
- Match-3 levels: Increasing board complexity, special mechanics
- Production chains get longer at higher levels (more ingredients needed)
- Order complexity increases (helicopter: 6 different products, frame 18)
- Mayor's Week goals scale: "Make 60 Rainbow Balls", "Dig 30 Mine Levels" (frame 12)

## 6. Monetization Model

### Virtual Currencies
- **Coins** (gold): 61,445 visible (frame 21) — soft currency for purchases
- **T-Cash** (green bill icon): 15-21 visible (frames 21-22) — premium currency
- **Event Currency**: Knight Pass progress tokens

### IAP Indicators
- **Knight Pass** (frames 3, 7, 8, 15): Battle pass with free + premium track
  - "Knight Pass Activated!" badge — paid upgrade
  - Premium track has multiplied rewards (x2, x3 quantities)
  - 17D 6H duration timer
- **T-Cash purchases**: Expand factory slots for 12 T-cash (frame 16)
- **"Spend Coupon"** option in Airport (frame 13)

### Monetization Touchpoints
- Factory slot expansion (T-cash)
- Speed-up timers
- Battle pass premium track
- Card pack opening (gacha element)
- Storage expansion (barn at near-max 12973/14020)

## 7. Meta Systems

### Social Features
- **Teams/Co-op** (frame 19): "General" chat, online members (6/46), team info
- **Regattas** (frame 5): Competitive boat racing leaderboard with ranking
- **Helicopter Orders**: NPC characters with personality dialogue (frame 18)
- **Ask for Help** button (frame 13)

### Events & Challenges
- **Knight Pass**: 20-tier reward track, 17-day duration (frames 7, 15)
- **Mayor's Week**: Multi-goal challenge (complete stages, make items, dig mines — frame 12)
- **Regatta Races**: Team-based competitive events (frame 5)

### Collection Systems
- **Town Cards** (frames 4, 8, 10, 12): Collectible card packs
  - Cards have star ratings (1-3 stars)
  - Named cards: "Candy Apples", "Snowboard"
  - Cards from Knight Pass rewards and event completion
- **Story/Quest**: Character "Rachel" narrative quest line (frame 11)

### Energy/Lives System
- **No explicit energy** for town management
- **Move-limited** match-3 (12 moves, frame 17)
- **Timer-based**: Production cooldowns act as soft energy gates
