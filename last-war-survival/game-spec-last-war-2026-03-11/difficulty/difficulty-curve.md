# Last War: Survival — Difficulty Curve Analysis

> Frames analyzed: 33 @ 0.5fps | Video duration: ~4376s (~73 min)

## 1. Difficulty Progression Table

| Time / Stage | Speed | Army Size | Complexity | New Mechanics | Visual Density | Score Target | Evidence Frames |
|-------------|-------|-----------|-----------|---------------|---------------|-------------|-----------------|
| Tutorial / Early (Stage 1-10) | slow | Small squad (~10 units) | 1 (auto-battle) | Basic movement, auto-attack, first building | Low | N/A | frame-005, frame-011 |
| Mid-Early (Stage 11-20) | medium | Medium (~30 units) | 2 (hero abilities) | Hero cooldowns, ability timing, Spec Ops mode | Medium | Stage 18-20 clear | frame-014, frame-020, frame-021, frame-027 |
| Mid (Stage 21-33) | medium-fast | Large (~50+ units) | 3 (multi-hero + positioning) | Frontline Breakthrough, boss mechanics, bridge battles | High | Stage 33 clear | frame-015, frame-026, frame-029 |
| Late (Spec Ops 3-7+) | fast | Full army (~80+) | 3-4 (timed + multi-mode) | Timed missions, kill count targets | High | 86 kills in 32s | frame-018, frame-020 |
| Endgame (Lv 120+) | very-fast | Massive (100+ units) | 4+ (all systems) | Arena PvP, Alliance Wars, VIP optimization | Very High | Resource management | frame-030, frame-031, frame-032, frame-033 |

## 2. Difficulty Dimensions

### a. Spatial Complexity

Early battles on simple divided highways with a single lane (frame-011). Later, wider bridge environments with red railings (frame-026, frame-030), and isometric stages with environmental obstacles like trees, terrain elevation, buildings (frame-027, frame-029).

| Stage | Safe Zone % | Obstacle Count | Evidence |
|-------|------------|---------------|----------|
| Early highway | ~70% | 0-1 (median strip) | frame-011 |
| Mid stages | ~50% | 3-5 (trees, terrain) | frame-027, frame-029 |
| Bridge battles | ~40% | Bridge railings, boss AOE | frame-026, frame-032 |
| Isometric stages | ~30% | Multiple terrain features | frame-027, frame-028 |

### b. Temporal Pressure

No visible timer in early stages. By Stage 19, a 00:28 countdown timer appears (frame-029). Spec Ops missions track completion time (32 seconds for Spec Ops 3, frame-018). Hero cooldowns (7.0s-8.0s) create timing pressure (frame-029).

| Stage | Timer | Action Window | Evidence |
|-------|-------|--------------|----------|
| Early | None | Unlimited | frame-011 |
| Stage 19+ | 00:28 countdown | ~28s total | frame-029 |
| Spec Ops | Tracked (not enforced) | 32s recorded | frame-018 |
| Frontline | Distance-based (83m to 63m) | Proximity pressure | frame-026, frame-030 |

### c. Cognitive Load

| Stage | Simultaneous Tracks | Evidence |
|-------|-------------------|----------|
| Early | 1 (watch auto-battle) | frame-011 |
| Mid | 2-3 (hero abilities + army + stage goals) | frame-029 |
| Late | 4+ (hero timing + resource mgmt + alliance + arena) | frame-031 |
| Endgame | 5+ (all systems + meta optimization) | frame-031 |

### d. Motor Skill Demand

| Stage | Precision Required | Speed Required | Evidence |
|-------|-------------------|---------------|----------|
| Early | Low (auto-battle) | Low | frame-011, frame-014 |
| Mid | Medium (tap hero cards) | Medium | frame-029 |
| Late | Medium-High (timing + positioning) | High | frame-032 |

## 3. Spikes & Valleys

| Moment | Type | Frame | Description | Purpose |
|--------|------|-------|-------------|---------|
| First highway battle | tutorial | frame-011 | Simple auto-battle introduction | Onboarding |
| Spec Ops introduction | spike | frame-018, frame-020 | Timed mission with kill targets | New challenge mode |
| First boss encounter | spike | frame-027 | 8,158 x2 damage from red boss | Challenge gate |
| Frontline Breakthrough | spike | frame-026 | New bridge battle format with distance metric | Mode variety |
| Mission Complete screens | valley | frame-014, frame-015, frame-018, frame-021 | Reward display, stats review | Rest/reward moment |
| Base building phases | valley | frame-024, frame-025, frame-031 | Strategic planning, resource management | Pacing break |
| Massive bridge battles | spike | frame-032, frame-033 | Huge armies, boss + fire rain + ice beams | Spectacle peak |

## 4. Progression Signals

- **Stage numbers**: Clearly displayed at top ("Stage 18", "Stage 19", "Stage 20", "Stage 33") — frame-014, frame-027, frame-029
- **Player level**: Lv.5 (frame-005) to Lv.120 (frame-031)
- **Hero levels**: LV 7 Gump (frame-022) to LV 22 Monica (frame-023)
- **Army size growth**: ~10 soldiers (frame-014) to 100+ filling screen (frame-032, frame-033)
- **Resource scaling**: 1,907 (frame-024) to 122.4K (frame-031)
- **VIP system**: VIP 1 visible (frame-031)
- **Kill counts**: Spec Ops 3 = 86 kills (frame-018)
- **Damage stats**: Per-hero breakdown after battles (frame-021)

## 5. Design Assessment

| Aspect | Assessment |
|--------|-----------|
| Curve Shape | **Stepped** — new modes unlock at progression gates, each introducing difficulty plateau then ramp |
| Rest Points | Yes — base building between battles, Mission Completed screens, resource collection phases |
| Fail Safety | Likely present — auto-battle suggests power-gating rather than skill-gating |
| Skill Ceiling | Moderate — hero ability timing matters but auto-battle handles basics |
| Estimated Mastery Time | Weeks to months (Lv.5 to Lv.120 progression observed) |
