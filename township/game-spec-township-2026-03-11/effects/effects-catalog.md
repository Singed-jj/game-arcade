# Township — Effects Catalog

> Part of [Township Reproduction Spec](../index.md)
> Frame timing: 0.5fps (1 frame = 2s) — precise timing cannot be determined

## Effect Summary

| # | Effect Name | Type | Duration | Trigger |
|---|------------|------|----------|---------|
| 1 | Star Reward Float | animation | ~1.5s | Level completion |
| 2 | Confetti Burst | particle | ~2-3s | Event/race completion |
| 3 | Card Pack Glow | screen-effect | looping | Card pack ready |
| 4 | Cloud Fog Drift | animation | continuous | Unexplored area |
| 5 | Factory Steam | particle | continuous | Production active |
| 6 | Product Bubble Bob | UI-feedback | continuous | Product ready |

## Detailed Effects

### E1: Star Reward Float

| Field | Value |
|-------|-------|
| Type | animation |
| Frames | frame-002 |
| Duration | ~1.5s (estimated) |
| Trigger | Match-3 level completion |
| Layer | overlay |
| Intensity | moderate |

**Visual Description:** Two golden 3D stars float from top-center, with subtle bounce on landing. Gold glow aura around each star. Star counter in top-left updates.

**Reference Frames:**
- `frame-002`: Two stars visible in center with star counter showing 49

**Godot Implementation Hint:**
- Node: `Tween` on `TextureRect` (star sprite)
- Key params: Start position: off-screen top → center, Scale: 0→1.2→1.0 (overshoot), Duration: 0.8s per star with 0.3s stagger
- Easing: TRANS_BACK, EASE_OUT

---

### E2: Confetti Burst

| Field | Value |
|-------|-------|
| Type | particle |
| Frames | frame-005 |
| Duration | ~2-3s |
| Trigger | Regatta/event completion |
| Layer | overlay |
| Intensity | dramatic |

**Visual Description:** Multi-colored rectangular confetti pieces (green, yellow, blue, pink, red) scattered across full screen. Slight gravity pull downward. Random rotation per piece.

**Reference Frames:**
- `frame-005`: Confetti particles visible over regatta leaderboard

**Godot Implementation Hint:**
- Node: `GPUParticles2D`
- Key params: Amount: 150-200, Emission shape: Rectangle (full viewport), Gravity: (0, 80), Initial velocity: random 50-150, Spread: 360°, Lifetime: 2.5s
- Color: Randomize RGB, Shape: small rectangles (2x6px)
- One-shot: true

---

### E3: Card Pack Glow

| Field | Value |
|-------|-------|
| Type | screen-effect |
| Frames | frame-012 |
| Duration | looping |
| Trigger | Card pack available to open |
| Layer | overlay |
| Intensity | moderate |

**Visual Description:** Green luminous glow emanating outward from card pack. Pulsing intensity.

**Reference Frames:**
- `frame-012`: Green glow visible around Town Cards pack

**Godot Implementation Hint:**
- Node: `PointLight2D` or `Sprite2D` with additive blend
- Key params: Color: #00FF44, Energy pulsing 0.5→1.0 via Tween (loop), Texture: soft radial gradient

---

### E4: Cloud Fog Drift

| Field | Value |
|-------|-------|
| Type | animation |
| Frames | frame-009 |
| Duration | continuous |
| Trigger | Unexplored map area |
| Layer | midground |
| Intensity | subtle |

**Visual Description:** White/grey semi-transparent cloud patches slowly drifting horizontally. Multiple layers for depth. Obscures undiscovered town areas.

**Reference Frames:**
- `frame-009`: Large cloud/fog area covering upper portion of town map

**Godot Implementation Hint:**
- Node: Multiple `Sprite2D` with `Tween` or `AnimationPlayer`
- Key params: Alpha: 0.7-0.9, scroll speed: 10-20 px/s horizontal, parallax for depth
- Reveal: Tween alpha to 0 over 1.5s when stars unlock area

---

### E5: Factory Steam

| Field | Value |
|-------|-------|
| Type | particle |
| Frames | frame-016 |
| Duration | continuous while producing |
| Trigger | Factory production active |
| Layer | foreground |
| Intensity | subtle |

**Visual Description:** Small white puffs rising from factory oven/chimney. Gentle upward drift with fade-out.

**Reference Frames:**
- `frame-016`: Steam visible from Pastry Factory oven

**Godot Implementation Hint:**
- Node: `GPUParticles2D`
- Key params: Amount: 5-10, Emission point: factory top, Direction: (0, -1), Gravity: (0, -20), Lifetime: 1.5s, Alpha fade: 1.0→0.0
- Color: White (#FFFFFF), Scale: small (4-8px)

---

### E6: Product Bubble Bob

| Field | Value |
|-------|-------|
| Type | UI-feedback |
| Frames | 14, 20-22 |
| Duration | continuous |
| Trigger | Product ready for collection / order request |
| Layer | overlay |
| Intensity | subtle |

**Visual Description:** Small product icons in white rounded-square bubbles floating above buildings. Gentle vertical bobbing motion.

**Reference Frames:**
- `frame-014`: Multiple product icons floating above various buildings
- `frame-020-022`: Product bubbles over coastal buildings

**Godot Implementation Hint:**
- Node: `Tween` (looping) on `Control` node
- Key params: position.y oscillation ±4px, duration 1.2s cycle
- Easing: TRANS_SINE, EASE_IN_OUT

---

## Transitions

| # | Transition | Type | Duration | Direction |
|---|-----------|------|----------|-----------|
| 1 | Scene Darken | fade | ~0.3s | in |
| 2 | Modal Popup | zoom + fade | ~0.2s | center-outward |
| 3 | Card Reveal Flip | custom | ~0.3s | horizontal flip |
| 4 | Screen Celebrate | overlay | ~2s | full-screen |

## Animation Patterns

| # | Animation | Target | Property | Cycle | Loop |
|---|----------|--------|----------|-------|------|
| 1 | Star Bounce | Star icons | position + scale | 0.8s | no |
| 2 | Timer Tick | Timer text | value | 1.0s | yes |
| 3 | Product Bob | Product icons | position.y | 1.2s | yes |
| 4 | Cloud Drift | Fog sprites | position.x | continuous | yes |
| 5 | Badge Pulse | Notification badges | scale | 1.5s | yes |
| 6 | Button Glow | Claim buttons | modulate | 2.0s | yes |
