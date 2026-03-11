# Township — Difficulty Curve

> Part of [Township Reproduction Spec](../index.md)
> Video duration: 1361s | Frames analyzed: 22 @ 0.5fps

## Difficulty Progression

| Phase | Production Complexity | Order Difficulty | Match-3 Complexity | Cognitive Load | New Mechanics | Visual Density | Evidence Frames |
|-------|---------------------|-----------------|-------------------|----------------|--------------|---------------|-----------------|
| Early (Lv 1-20) | Low: 1-2 ingredients | 1-2 items | 4 colors, square board | 1-2 systems | Farming, basic factory | Low | Not captured |
| Mid (Lv 20-80) | Medium: 3-4 step chains | 3-4 items, timers | Special pieces, irregular boards | 3-4 systems | Airport, mining, events | Medium | Not captured |
| Late (Lv 80-160+) | High: 6+ product types | 6 items, complex quotas | 12 moves, 4 goals, rainbow balls | 8-9 systems | Knight Pass, regattas, cards | Very High | 9, 13-22 |

## Difficulty Dimensions

### Spatial Complexity
At level 160+, the town spans a massive multi-zone area: mainland city, harbor, coastal buildings, islands. The map requires scrolling and zooming to manage. Match-3 boards use irregular T/L shapes instead of simple rectangles.

| Stage | Play Area | Obstacle Count | Evidence |
|-------|----------|---------------|----------|
| Late-game town | Multi-screen scrollable | 50+ buildings to manage | 14, 20-22 |
| Late-game match-3 | Irregular T/L board shape | Multiple locked/special tiles | 17 |

### Temporal Pressure
Multiple concurrent timers force prioritization: factory queues, airport deadlines, event countdowns. At late game, 4+ event timers visible simultaneously.

| Stage | Timer | Action Window | Evidence |
|-------|-------|--------------|----------|
| Airport order | 14H 58M countdown | Must gather goods before deadline | 13 |
| Knight Pass | 17D 6H remaining | Complete 20 tiers for max rewards | 7, 15 |
| Mayor's Week | Implicit (weekly reset) | 1200/3000 progress needed | 12 |
| Event timers (stacked) | 6D 2H, 3D 6H, 6H 25M | Multiple concurrent deadlines | 9, 21 |

### Cognitive Load
| Stage | Simultaneous Tracks | Evidence |
|-------|-------------------|----------|
| Early | 2 (farm + build) | Not captured |
| Mid | 4 (farm + factory + orders + match-3) | Not captured |
| Late | 8-9 (farm, factories, helicopter, airport, match-3, mining, events, team, cards) | 9, 12-22 |

### Motor Skill Demand
| Stage | Precision Required | Speed Required | Evidence |
|-------|-------------------|---------------|----------|
| Town management | Low (tap targets are large) | None (no time pressure) | 14, 20-22 |
| Match-3 | Medium (strategic, not reflex) | None (move-limited, not timed) | 17 |
| Overall | Low-Medium | Low | All frames |

## Spikes & Valleys

| Moment | Type | Frame | Description | Purpose |
|--------|------|-------|-------------|---------|
| Match-3 level | spike | 17 | 12 moves, 4 distinct goals, irregular board | Gate progression (star farming) |
| Card pack open | valley | 4, 10 | Gacha moment, zero skill | Reward dopamine, rest |
| "Well Done!" screen | valley | 6 | Celebration with trophies/progress | Satisfaction, session cap |
| Airport complex order | spike | 13 | 14H+ timer, multi-resource | Time management test |
| Helicopter 6-product order | spike | 18 | 6 different goods at set quantities | Production planning challenge |
| Knight Pass claim spree | valley | 7, 15 | Claiming stacked rewards | Dopamine cascade |
| Story scene (Rachel) | valley | 11 | Narrative cutscene | Emotional engagement, pace break |

## Progression Signals

- **Player Level**: 160→161 (frames 21→22) — continuous XP accumulation
- **Star Counter**: 49 stars earned (frame 2), 14/100 in current zone (frame 9)
- **Knight Pass Tier**: 13/20 progress (frames 7, 15)
- **Mayor's Week**: 1200/3000 points (frame 12)
- **Barn Capacity**: 12973/14020 — near-max signals need to expand or sell
- **Green Checkmarks**: Completed tasks/goals (frame 12)
- **"Claim" buttons**: Accumulated rewards ready (frames 7, 15)
- **"Knight Pass Activated!"**: Premium tier badge (frame 15)

## Design Assessment

| Aspect | Assessment |
|--------|-----------|
| Curve Shape | Stepped with exponential undertone — new systems introduce step jumps, within each system complexity grows gradually |
| Rest Points | Yes: card opens, reward claims, celebrations, production timers as natural breaks |
| Fail Safety | Moderate: match-3 has retry + boosters, town has no fail state, events can be missed (FOMO only) |
| Skill Ceiling | Medium-High: optimal production management + competitive regattas require planning; T-cash can bypass |
| Estimated Mastery Time | 100+ hours to reach mid-game; 500+ hours for late-game (level 160+) |
