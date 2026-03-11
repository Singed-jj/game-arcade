# Last War: Survival — Game Overview

> Part of [Last War: Survival Reproduction Spec](./index.md)

## 1. Game Overview

| Item | Detail |
|------|--------|
| Primary Genre | Strategy / Base Building |
| Sub-genre | Army Management, Hero Collection RPG, Action Battle |
| Platform | Mobile (iOS/Android), Portrait orientation |
| Target Audience | Casual-to-midcore mobile gamers, 18-35 |
| Similar Games | Last War: Survival, Top War, Whiteout Survival, Art of War: Legions, Lords Mobile |

## 2. Core Mechanics

### Game Loop
Build base (isometric view) → Recruit/upgrade heroes → Deploy army in stage battles → Earn resources/rewards → Upgrade base & heroes → Repeat. Short battle sessions (~30s) with auto-battle + hero ability management. Multiple battle modes: Story Stages (highway/isometric), Spec Ops (timed kills), Frontline Breakthrough (bridge distance), Arena PvP.

### Controls
Touch-based mobile: tap to place buildings, tap hero card slots to activate abilities in battle (frame-029 shows 3 hero slots with cooldown timers 7.0s/7.9s/8.0s). Drag/pinch to navigate base map. Most battles are auto with optional hero ability timing.

### Win/Lose Conditions
Win: Clear all enemies in stage, reach distance target in Frontline, achieve kill count in Spec Ops. Lose: Army destroyed before objective met, timer expires. Meta-win: Base level progression (Lv.5 → Lv.120), hero collection completion.

### Rules & Systems
- Army size scales with base level and hero power
- Heroes have rarity tiers (SSR visible in frame-023), levels, stats (Attack/HP/Defense/March Size)
- Hero shards required for upgrades (frame-009: "Kimberly Shard")
- Radar Tasks provide timed resource generation (frame-005: 6 tasks, 5:43:19 restoration)
- Multiple resource types: gold, metal, oil/fuel + premium currencies (gems, diamonds, tickets)

## 3. Visual Design

### Art Style
Cartoon/stylized 3D with isometric base view. Chibi-style soldiers (blue helmet troops). Semi-realistic hero portraits (frame-022: Gump, frame-023: Monica). Post-apocalyptic zombie survival theme. Mid-tier mobile production quality — polished casual style with consistent visual identity.

### Color Palette
| Role | Color | Hex |
|------|-------|-----|
| Primary (UI Background) | Dark Navy/Slate | #2D3748 |
| Secondary (Highlights) | Orange/Amber | #F6AD55 |
| Accent (Player Units) | Bright Blue | #4299E1 |
| Danger/Premium | Red | #E53E3E |
| Success/Confirm | Green | #48BB78 |
| Base Terrain | Grass Green | #68D391 |

## 4. UI/UX Structure

### Screen Layout
Portrait 9:16 orientation. Top bar for resources/currencies. Large center area for game content (70-90% of screen). Bottom bar for navigation (HEROES/Inventory/WORLD) and alliance chat. Modal popups for shops, upgrades, missing items. Back arrow bottom-left, Home button bottom-right.

### HUD Elements
- Resource counters: top bar (gold/metal/oil + level indicator)
- Currency display: gems, diamonds, tickets in context screens
- Stage indicator: top-center in battle ("Stage 18", "Stage 19")
- Timer: countdown in timed modes (00:28 in frame-029)
- Hero card slots: bottom of battle screen with cooldown timers
- Damage numbers: floating combat text

### Navigation Flow
Main Base → (bottom nav) → HEROES / Inventory / WORLD
Main Base → ARENA → Rookie Bootcamp → Challenge Lineup
Main Base → MALL → Shop tabs
Main Base → RECRUIT → Gacha/Card pulls
Battle → Mission Completed → Back to Base

## 5. Progression & Monetization

### Progression System
- Player/Base Level: Lv.5 (early) to Lv.120+ (endgame)
- Hero Levels: LV 7 (frame-022) to LV 22+ (frame-023)
- Stage progression: Stage 1 → 33+ with multiple modes unlocking
- Army visual growth: ~10 soldiers → 100+ filling screen
- Resource scaling: ~1,900 → 122,000+

### Monetization Model
F2P with multiple premium currencies. Gacha/Recruit system for heroes (frame-004, 010). Arena attempts cost diamonds (100 per attempt, frame-017). Hero shard gating with "Obtain" IAP path (frame-009). VIP tier system (frame-031). Mall/Shop with multiple tabs (frame-003).

### Meta Systems
- Alliance: chat, Alliance Wars (frame-031)
- Arena: Rookie Bootcamp PvP with challenge lineups (frame-017)
- Radar Tasks: timed daily task system (frame-005)
- Hero Collection: shards, attributes, skills, tier tabs
- VIP: tiered spending rewards
- World Map: exploration/campaign

## 6. Comparable Games

| Game | Genre | Similarity | Key Difference |
|------|-------|-----------|----------------|
| Top War | Strategy/Base Building | Very High — merge mechanics + base building + battles | Top War has merge-based unit upgrading |
| Art of War: Legions | Army Formation + Auto-battle | High — army growth, auto-combat, hero abilities | AoW focuses more on formation strategy |
| Lords Mobile | Strategy/MMO | Medium — base building, hero collection, alliance | Lords Mobile is deeper MMO with real-time PvP |

### Competitive Positioning
Last War occupies the casual-strategy niche: simpler than Lords Mobile, more base-building than Art of War, with the satisfying visual army growth as its differentiator. The "zombie survival" theme and bridge battle spectacles provide unique visual identity.

## 7. Consensus & Disagreements

### Claude-Codex Consensus
Both analysts agree on:
- **Genre**: Mobile base-building/strategy hybrid with hero gacha RPG layer
- **Monetization**: F2P with multi-currency, timer-gating, pay-to-accelerate model
- **Art Style**: Cartoon/stylized, mid-production mobile quality
- **Controls**: Tap-based with drag/pinch for map navigation
- **Session Design**: Short bursts (~3-10 min) driven by energy/timer gating

### Disagreements
- **Battle depth**: Claude (analyzing all 33 frames including battle scenes) identifies deep action-battle mechanics with hero cooldowns, while Codex (seeing only 7 frames) characterizes it primarily as passive management
- **Visual consistency**: Codex notes "inconsistency between screens" and "different rendering pipelines" — this is likely due to early frames (2-7) being menu/loading screens while later frames show richer battle content
- **Social features**: Codex notes "not visible in provided frames" for alliance features; Claude confirms alliance chat and Alliance War in frame-031
