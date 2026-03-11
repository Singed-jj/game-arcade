# Game Design Analysis: Last War: Survival

## 1. Genre Classification

- **Primary Genre**: Strategy / Base Building with Action Battle sequences
- **Sub-genres**: Army management, Hero collection (gacha), Tower defense elements
- **Comparable Titles**: Top War: Battle Game, Whiteout Survival, Art of War: Legions, Puzzles & Survival
- **Market Position**: Mid-core mobile strategy with casual battle mechanics, targeting broad audience through simplified merge/army gameplay layered onto a traditional 4X base-building shell

The game blends two distinct gameplay layers: a traditional isometric base-building strategy layer (frames 6-8, 12-13, 24-25, 31) and an action-oriented auto-battle layer with hero ability management (frames 11, 14-15, 20, 26-33). This dual-layer approach lowers the barrier to entry while preserving strategic depth for retention.

---

## 2. Core Game Mechanics

### 2.1 Base Building
- **View**: Isometric 3D perspective with green terrain, cross-shaped road networks, and fenced perimeters (frames 6-8, 12-13, 24-25)
- **Buildings**: Multiple structure types visible including radar tower (frame 5), resource generators, and a central command building with decorative creature element (frame 25 - elephant/rhino on main building)
- **Resources**: At minimum 4 tracked resource types visible in the top bar (frame 16: 51.1K, 51.7K, 14.4K, 61,505; frame 31: 122.4K, 110.9K, 38.0K, 399,329)
- **Progression Indicator**: Base level clearly displayed (Lv.5 in frame 5, Lv.120 in frame 31), suggesting a long progression curve

### 2.2 Hero Collection & Upgrade
- **Rarity System**: SSR tier confirmed (frame 23: "SSR Staff Officer Monica"), implying standard gacha rarity tiers (N/R/SR/SSR/UR or similar)
- **Hero Stats**: Attack, HP, Defense, March Size, Power (composite score) - frames 22-23
  - Early hero example: Nova Gump - Power 85, LV 7, Attack 67, HP 2.3K, Defense 14, March Size 62 (frame 22)
  - Mid-game hero example: Monica - Power 38,009, LV 22, Attack 242, HP 5.7K, Defense 42, March Size 92 (frame 23)
- **Upgrade System**: Level-based with "Upgrade" button (frame 22), hero shards required (frame 9: "Kimberly Shard, Owned: 0")
- **Hero Detail Tabs**: Attributes, Skills, and additional tabs visible (frame 9), indicating multi-dimensional hero customization
- **Visual Identity**: Each hero has distinct visual design - motorcycle for Monica (frame 23), battlefield scene for Gump (frame 22)

### 2.3 Stage-Based Combat
- **Battle Types Observed**:
  - **Story Stages**: Numbered sequentially - Stage 18 (frame 21, 27), Stage 19 (frame 29), Stage 20 (frame 14), Stage 33 (frame 15)
  - **Spec Ops**: Separate mission track - Spec Ops 3 (frame 18: 86 kills, 32 seconds), Spec Ops 7 (frame 20: highway with explosions)
  - **Frontline Breakthrough**: Numbered difficulty tiers - Frontline Breakthrough 5 (frames 26, 30), featuring distance-based progression (83m, 63m) and stat thresholds (60/100/50 and 450/220/180)
  - **Arena**: PvP-oriented "Rookie Bootcamp" with challenge lineups (frames 2, 17)
- **Battle Environments**: Highway/divided road (frames 11, 20), isometric terrain with trees (frame 27), bridge encounters (frames 32-33)
- **Combat Style**: Auto-battle with hero ability intervention, projectile and AoE effects visible (frame 29)

### 2.4 Army Management
- **Troop Visual**: Blue-helmeted chibi soldiers that form squads of varying size
- **Growth Progression**: Army size visibly scales with progression:
  - Early game: Small squad with a few vehicles (frame 14 - Stage 20)
  - Mid game: Larger formation (frame 15 - Stage 33)
  - Late game: Massive blue army filling the screen (frames 30, 32-33)
- **March Size Stat**: Hero stat "March Size" directly controls army composition (62 for LV 7 hero, 92 for LV 22 hero)

### 2.5 Battle Mechanics Detail
- **Hero Card Slots**: 3 hero ability cards visible during battle with individual cooldown timers (frame 29: 7.9s, 7.0s, 8.0s)
- **Damage Display**: Floating damage numbers with color coding (frame 27: 8,158 x2 on red boss; frame 32: 2,000 x8)
- **Elemental Effects**: Ice/lightning effects (frame 26), fire rain (frame 33), golden effects (frame 30)
- **Post-Battle Stats**: Per-hero damage breakdown (frame 21: Elsa 13.5K, Violet 5.0K, Mason 11.7K, Farhad 15.0K, Ambolt 2.4K)

---

## 3. Control Scheme

- **Platform**: Mobile (portrait orientation, touch controls)
- **Base Building**: Tap to select and place buildings on isometric grid
- **Battle Controls**:
  - Hero ability activation via tapping card slots at bottom of battle screen (frame 29)
  - Cooldown management: each hero card has visible countdown timer, requiring timing decisions
  - Likely auto-march with manual ability intervention (troops advance automatically on highway/bridge)
- **Navigation**: Bottom navigation bar for main screens (HEROES, Inventory, WORLD - frame 31), back arrow and home buttons for sub-screens (frames 5-8)
- **Input Complexity**: Low - primarily single-tap interactions, no drag-and-drop or complex gestures observed

---

## 4. Game Loop

### 4.1 Core Loop (Per Session)
```
Build/Upgrade Base → Recruit Heroes → Battle Stages → Earn Resources → Upgrade Heroes/Buildings → Repeat
```

### 4.2 Session Design
- **Battle Duration**: Extremely short - Spec Ops 3 completed in 32 seconds (frame 18), Stage 19 shows timer at 00:28 (frame 29)
- **Session Target**: Designed for frequent, brief sessions (2-5 minutes per session), consuming stamina/attempts then waiting for restoration
- **Engagement Cadence**: Radar Tasks restore on timer (frame 5: "6 Radar Task(s) will be restored in 05:43:19"), creating 4-6 hour return windows

### 4.3 Meta Loop (Long-term)
- **Alliance Participation**: Social layer with chat and alliance events (frame 31: alliance chat visible, "Alliance War" in news)
- **Arena Competition**: PvP ranking through Rookie Bootcamp → higher tiers (frames 2, 17)
- **Hero Collection**: Completing hero roster through gacha pulls and shard farming (frames 4, 9, 10)
- **Stage Progression**: Linear advancement through story, spec ops, and frontline breakthrough modes
- **VIP Advancement**: Long-term spending/loyalty progression (frame 31: VIP 1)

### 4.4 Progression Milestones (Observed)
| Metric | Early Game | Mid Game | Late Game |
|--------|-----------|----------|-----------|
| Base Level | Lv.5 (frame 5) | - | Lv.120 (frame 31) |
| Hero Level | LV 7 (frame 22) | LV 22 (frame 23) | - |
| Hero Power | 85 (frame 22) | 38,009 (frame 23) | - |
| Resources | ~2K each (frame 24) | ~50K each (frame 16) | ~100K+ (frame 31) |
| Army Size | Small squad | Medium formation | Screen-filling army |

---

## 5. Difficulty & Progression

### 5.1 Stage Structure
- **Story Stages**: Sequential numbering (18, 19, 20, 33 observed), "Mission Completed" confirmation on clear (frames 14, 15, 21)
- **Spec Ops**: Separate difficulty track (3, 7 observed), highway-themed combat with kill count tracking (frame 18: 86 kills)
- **Frontline Breakthrough**: Distance-based challenge (83m → 63m progression in frames 26, 30), with visible stat requirements (60/100/50 early, 450/220/180 later)
- **Arena**: Competitive mode with purchasable attempts, implying rank-based matchmaking (frames 2, 17)

### 5.2 Power Scaling
- Hero Power shows exponential growth: 85 (LV 7) to 38,009 (LV 22) - a 447x increase over 15 levels (frames 22-23)
- Resource economy scales proportionally: early ~2K per resource (frame 24) to 100K+ late game (frame 31)
- Army visual density increases dramatically, providing strong visual feedback for progression

### 5.3 Difficulty Gating
- Hero shard system gates hero advancement (frame 9: "Missing Items" with "Owned: 0")
- Timer-based stamina system limits session length (frame 5: radar task restoration timer)
- Arena attempts limited and purchasable (frame 17: 100 diamonds per attempt)
- Multiple battle modes provide parallel progression paths when one is gated

---

## 6. Monetization

### 6.1 Currency Ecosystem
| Currency | Visual | Observed Values | Primary Use |
|----------|--------|----------------|-------------|
| Gold Tickets | Gold ticket icon | 0 (frame 4) | Gacha/Recruit pulls |
| Gems | Red hexagonal | 57 (frame 4) | Premium purchases |
| Diamonds | Crystal icon | 100 per arena attempt (frame 17) | Arena, shop |
| Resources (3+ types) | Various icons | 51K-122K range (frames 16, 31) | Building/upgrading |

### 6.2 Monetization Vectors
- **Gacha/Recruit System**: Card pack opening with golden glow animation (frames 4, 10), "LASTWAR" branded pack suggests premium pulls
- **Arena Attempts**: Directly purchasable (frame 17: "BUY CHALLENGE ATTEMPTS" - 100 Diamonds for 1 challenge, with Refresh costing 20)
- **Hero Shard Gating**: "Missing Items" popup with "Obtain" button creates purchase pathway (frame 9)
- **Mall/Shop**: Dedicated shop screen with tabbed navigation for various offers (frame 3)
- **VIP System**: VIP 1 visible in late-game base view (frame 31), implying tiered benefits for cumulative spending

### 6.3 Monetization Assessment
- **Depth**: Multiple overlapping monetization systems (gacha + stamina + VIP + shop) suggest aggressive but standard mobile F2P model
- **Friction Points**: Shard shortages, stamina depletion, arena attempt limits all create purchase motivation
- **Estimated ARPU Driver**: Gacha system likely primary revenue driver, with arena and stamina refills as secondary

---

## 7. Meta Systems

### 7.1 Arena
- **Entry Point**: "ARENA" screen with "Rookie Bootcamp" tab (frame 2)
- **Features**: Challenge lineups (frame 17), purchasable attempts (100 diamonds each)
- **Structure**: Likely tiered leagues (Rookie → higher ranks), PvP-oriented matchmaking

### 7.2 Alliance System
- **Evidence**: Alliance chat visible in main base view (frame 31)
- **Events**: "Alliance War" mentioned in breaking news ticker
- **Social Layer**: Chat integration suggests guild-based cooperative and competitive features

### 7.3 Mall/Shop
- **Dedicated Screen**: Tabbed navigation with dark navy background (frame 3)
- **Content**: Likely includes hero packs, resource bundles, premium currency offers

### 7.4 Radar Tasks
- **Mechanic**: Timed task restoration system (frame 5: 6 tasks, 05:43:19 timer)
- **Purpose**: Session pacing mechanism, creating natural return windows every ~6 hours
- **Building**: Radar tower visible as dedicated structure (frame 5: Lv.5, 8/10 progress)

### 7.5 World Map
- **Evidence**: "WORLD" button in bottom navigation bar (frame 31)
- **Likely Features**: PvE encounters, resource nodes, alliance territory (standard for genre)

### 7.6 Hero Collection
- **Depth**: Multiple tabs per hero (Attributes, Skills, Tier - frame 9)
- **Heroes Observed**: Kimberly (frame 9), Nova Gump (frame 22), Monica SSR (frame 23), Elsa, Violet, Mason, Farhad, Ambolt (frame 21 damage stats)
- **Progression**: Shard collection, level upgrades, potential skill trees

---

## 8. Narrative & Theme

- **Setting**: Post-apocalyptic zombie survival (frame 28: "Please help me get rid of these zombies!")
- **Narrative Delivery**: Minimal - primarily through battle context and NPC speech bubbles
- **Tone**: Light/casual despite zombie theme - cartoon art style softens the survival horror framing
- **World Building**: Military base rebuilding after zombie apocalypse, with highway and bridge battles suggesting territory reclamation

---

## 9. Technical Observations

- **Rendering**: 3D isometric for base, mixed 2D/3D for battles
- **Performance Indicators**: Particle effects, large army rendering (frames 30, 32-33 show hundreds of units), suggesting moderate device requirements
- **Loading**: Black screen observed (frame 1), standard mobile loading pattern
- **Name System**: Custom player names with keyboard input (frames 16, 19)
