# Township — SIDC Retention Loop

> Part of [Township Reproduction Spec](../index.md)

## Retention Loop Summary

| Phase | Strength | Key Element |
|-------|---------|-------------|
| Start | Strong | Immediate farm→harvest→sell loop + visual town building |
| Immersion | Strong | Multi-layered engagement: production chains + match-3 + orders |
| Desire | Strong | Knight Pass, card collection, regattas, story quests, FOMO timers |
| Conversion | Strong | T-Cash gates (factory expansion, speed-ups), battle pass premium |

## Phase Details

### Start (첫 30초 훅)

| Element | Description | Evidence Frames |
|---------|-------------|-----------------|
| Visual Hook | Colorful isometric town with immediate visual appeal, warm art style | 1, 21 |
| First Action | Plant crops → harvest (simple tap interaction, instant gratification) | 14 |
| Guided Tutorial | Story-driven onboarding with character Rachel guiding player | 11 |
| Zero Friction Entry | Tap to plant, tap to harvest — 2-tap core loop | 14, 20 |

Township hooks players with an immediately appealing colorful town and a dead-simple first loop: plant a crop, wait briefly, harvest. The tutorial is character-driven (Rachel narrative) rather than dry instructions, creating emotional engagement from the start. The isometric town provides a sense of ownership — "this is MY town" — within the first minute.

### Immersion (몰입 유지)

| Element | Description | Evidence Frames |
|---------|-------------|-----------------|
| Production Chain Flow | Farm→Factory→Order creates satisfying multi-step completion loop | 13, 16, 18 |
| Match-3 Active Gameplay | Strategic puzzle provides active engagement between passive timers | 17 |
| Visual Feedback | Stars, confetti, "Well Done!", product bubbles — constant positive reinforcement | 2, 5, 6, 14 |
| Progression Velocity | Frequent level-ups, star earnings, building unlocks maintain momentum | 2, 9, 21-22 |

Immersion is sustained through layered engagement. When waiting for factory production, players can do match-3 puzzles. When match-3 lives are depleted, they manage orders. When orders are pending, they plan town layout. There's always something to do. The match-3 minigame (frame 17) provides genuine strategic challenge (irregular boards, limited moves, multiple goals) that creates flow state engagement.

### Desire (재방문 욕구)

| Element | Description | Evidence Frames |
|---------|-------------|-----------------|
| Knight Pass (Battle Pass) | 20-tier reward track with 17-day deadline — daily login motivation | 7, 15 |
| Card Collection | Town Cards gacha system — incomplete collection drives return | 4, 8, 10, 12 |
| Concurrent Event Timers | 4+ simultaneous event deadlines create persistent FOMO | 9, 21-22 |
| Regattas (Team Competition) | Team-based competition with rankings — social obligation | 5 |
| Story Quests | Narrative cliffhangers (Rachel's story) pull players back | 11 |
| Mayor's Week Goals | Multi-goal challenge with progress tracking (1200/3000) | 12 |

Desire is Township's strongest phase. Multiple overlapping systems create persistent reasons to return:
- **Knight Pass** creates a 17-day daily login incentive with escalating rewards
- **Card collection** exploits incompleteness bias — unrevealed cards (frame 10) drive curiosity
- **Stacked event timers** (4+ visible in frames 9, 21) create constant FOMO pressure
- **Team regattas** add social obligation — teammates expect contribution
- **Storage near-full** (12973/14020 barn, frame 14) forces frequent resource management

### Conversion (과금 전환)

| Element | Description | Evidence Frames |
|---------|-------------|-----------------|
| Factory Slot Expansion | 12 T-Cash to add production slot — recurring need | 16 |
| Knight Pass Premium | "Knight Pass Activated!" — premium tier with x2/x3 rewards | 7, 15 |
| Speed-up Temptation | Long production/shipping timers (14H 58M) make speed-ups attractive | 13 |
| Storage Crunch | Barn at 92.5% capacity (12973/14020) — expansion needs T-Cash | 14 |
| Card Pack Purchases | Additional gacha packs for card collection | 4, 10, 12 |
| Coupon System | "Spend Coupon" option in airport — secondary premium currency | 13 |

Conversion is well-designed with natural friction points:
- **Factory expansion** (frame 16): As production chains grow complex, players naturally need more slots
- **Battle pass premium** (frame 15): Free track shows what premium offers, creating visible value gap
- **Timer frustration**: Airport's 14H 58M (frame 13) is designed to make speed-ups tempting
- **Storage pressure**: Barn at 92.5% creates urgency to either expand (T-Cash) or make difficult sell decisions
- **CONVERSION → IMMERSION return**: After purchasing (e.g., factory slot), player immediately uses it in production chain — instant value realization

## Retention Risk Assessment

**Low Risk Areas:**
- Core loop is simple and satisfying (plant→harvest→sell)
- Multi-layered engagement prevents boredom
- Social features (teams, regattas) create switching costs

**Medium Risk Areas:**
- Late-game cognitive overload (8-9 concurrent systems) may overwhelm casual players
- Timer stacking (4+ events) may feel oppressive rather than exciting
- Storage management becomes tedious at high levels

**High Risk Areas:**
- Match-3 difficulty spikes (12 moves, 4 goals) may frustrate if boosters aren't available
- F2P progression may feel too slow at high levels (level 160+ with complex production chains)
- Event FOMO fatigue after extended play

## Cross-Reference

- 이펙트 → 몰입: [Effects Catalog](../effects/effects-catalog.md) 참조 — Star/confetti effects reinforce positive feedback loops
- 난이도 → 몰입: [Difficulty Curve](../difficulty/difficulty-curve.md) 참조 — Stepped difficulty maintains challenge-skill balance
- 에셋 → 전환: [Asset Catalog](../assets/asset-catalog.md)의 P0 항목 — Factory/production visuals make conversion feel valuable
