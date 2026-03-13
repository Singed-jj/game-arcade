# Royal Match — Effects & Motion Analysis (Claude Vision)

## Key Observations from Frame Analysis

### Gameplay Animation Philosophy
Royal Match prioritizes **dramatic, oversized special effects** with **subtle idle animations** creating a clear hierarchy:
- Normal matches: clean, snappy pop (small particles, quick flash)
- Special piece activation: screen-filling beams, large explosions
- Cascade combos: accelerating sequence with escalating particle density

---

## Effect Catalog

### 1. Sword/Lightsaber Booster Cut
- **Type**: screen-effect / special-piece-activation
- **Observed**: Frames 120, 140 — bright white diagonal beam cutting across full board
- **Visual**: Wide glowing slash (≈50px wide), motion-blur trail, board dims momentarily around the cut path
- **Duration**: ~300-400ms (inferred from 2 frames apart at 0.1fps extraction)
- **Layers**: foreground overlay
- **Intensity**: dramatic
- **Key property**: The slash travels across board with a bright white leading edge + golden trailing glow

### 2. TNT Explosion
- **Type**: particle / screen-effect
- **Observed**: Multiple gameplay frames — ring-wave expansion from booster
- **Visual**: Orange/red concentric ring expands outward; secondary particles scatter; brief screen flash white
- **Duration**: ~500ms
- **Intensity**: dramatic
- **Particle count**: ~20-30 scattered debris pieces

### 3. Block/Gem Match Pop
- **Type**: particle / animation
- **Observed**: Active gameplay frames (f30, f50, f60, f100, f130)
- **Visual**: Tiles scale-up briefly (120%) then shatter into 6-10 small color-matched particles
- **Duration**: ~200ms for scale-up, additional 300ms for particles to scatter/fade
- **Easing**: Quick ease-in on scale, linear scatter for particles
- **Key property**: Each match tile has a brief "anticipation" expand before disappearing

### 4. Block Idle Sparkle
- **Type**: animation (looping)
- **Observed**: Resting board states (f20, f30, f50)
- **Visual**: Small gold/white star sparkle appears randomly on gems, scale 0→1→0
- **Cycle**: ~2-3s random interval per tile
- **Intensity**: subtle

### 5. Cascade Fall
- **Type**: animation
- **Observed**: Mid-match states
- **Visual**: Gems fall with **slight overshoot bounce** at landing — brief squash-and-stretch
- **Easing**: Spring-like — accelerate downward, small bounce on contact (goes 5-8px below target then snaps up)
- **Duration**: proportional to fall distance, ~150ms per row

### 6. Level Complete Overlay
- **Type**: transition / screen-effect
- **Observed**: Frame 160 — "ROYAL MATCH!" title overlay with board dimmed
- **Visual**: Large logo bounces in from off-screen top, golden rays radiate outward
- **Duration**: ~800ms for entry, stays 2s
- **Intensity**: dramatic

### 7. King Character Reaction
- **Type**: animation
- **Observed**: HUD center character in gameplay frames
- **Visual**: Character performs brief bounce/expression animation after big combos
- **Cycle**: Triggered by match events, ~400ms animation

### 8. Move Count Pulse
- **Type**: UI feedback animation
- **Observed**: Move counter (top right) decrements with scale punch
- **Visual**: Number scales 1.0 → 1.3 → 1.0 on each move
- **Duration**: ~200ms

---

## Critical Animation Differentiators vs. Food Crush 2

### What Royal Match does that food-crush-2 should adopt:

1. **Squash-stretch on block landing**: Blocks briefly squash vertically on impact (0.85x height, 1.15x width) then snap back — gives physical weight
2. **Pre-swap "pick-up" scale**: The touched block scales up slightly (1.1x) BEFORE moving, giving tactile "grab" feel
3. **Particle size scales with combo**: First match = 6 small particles; 3rd cascade = 15 large particles
4. **Board darkens on special activation**: Quick vignette flash (board dims to 60% then back to 100%) when booster fires
5. **Sound-sync visual pulses**: Every audio beat has a matching visual scale/flash on the relevant element
6. **Smooth idle board life**: Random sparkles and subtle bobbing on unmatched gems keep board "alive"
