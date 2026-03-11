# Effects & Motion Analysis - Last War: Survival

> Source: 33 frames at 0.5fps extraction from 73-min gameplay video
> Analysis date: 2026-03-11
> Note: All timing is approximate due to low frame rate extraction

---

## Effect Catalog

| # | Effect Name | Type | Trigger | Visual Description | Frames | Intensity |
|---|-------------|------|---------|-------------------|--------|-----------|
| 1 | Ice Beam Barrage | particle | Soldier attack | Blue/cyan vertical beams from army, fan spread pattern | 26, 30 | dramatic |
| 2 | Fire Rain | particle | Boss/enemy attack | Orange-red vertical streaks falling from above | 32, 33 | dramatic |
| 3 | Golden Explosion | screen-effect | Enemy kill/damage | Bright golden burst/flash, expanding circle | 20, 30, 32 | dramatic |
| 4 | Damage Number Pop | UI-feedback | Hit landed | Large white/yellow numbers with outline, float upward | 26 (-98, 38), 27 (8158x2) | moderate |
| 5 | Card Reveal Glow | animation | Gacha/recruit | Golden glowing rectangle below card | 10 | moderate |
| 6 | Mission Completed Banner | UI-feedback | Stage clear | Golden ribbon banner with text, chevron arrows | 14, 15, 18, 21 | moderate |
| 7 | Targeting Circle | animation | Boss target | Red circle with crosshair rotating around boss | 27 | subtle |
| 8 | Hero Cooldown Timer | UI-feedback | Ability used | Radial countdown on hero card slots | 29 | subtle |
| 9 | Projectile Trails | particle | Ranged attack | Orange/white streaks from units to enemies | 29, 32 | moderate |
| 10 | Boss HP Bar | UI-feedback | Boss battle | Red/green segmented bar at top of screen | 26, 32 | subtle |

---

## Effect Detail Breakdown

### Dramatic Effects

#### 1. Ice Beam Barrage (frames 26, 30)
- **Source**: Player army (blue soldiers)
- **Pattern**: Multiple vertical beams emitted simultaneously in a fan spread
- **Color**: Cyan/ice-blue with white highlights
- **Context**: Frontline Breakthrough mode - appears when massed army fires
- **Frame 26**: 83m distance marker, beams with lightning sub-effects, damage numbers -98/38 visible
- **Frame 30**: 63m distance marker, massive blue army, combined with golden explosion on impact
- **Duration estimate**: Continuous while army attacks (sustained particle system)

#### 2. Fire Rain (frames 32, 33)
- **Source**: Enemy boss / zombie boss
- **Pattern**: Vertical orange-red streaks falling from sky, wide area coverage
- **Color**: Orange-red gradient, ember particles
- **Context**: Bridge battle boss encounters - appears as boss area attack
- **Frame 32**: Combined with "2,000 x8" damage indicator, fire/ice effects simultaneously
- **Frame 33**: Large zombie boss casting fire rain over blue army
- **Duration estimate**: Burst pattern, 1-2 second intervals

#### 3. Golden Explosion (frames 20, 30, 32)
- **Source**: Impact point on enemies
- **Pattern**: Radial burst expanding outward, bright center fading to edges
- **Color**: Golden/yellow with white flash center
- **Context**: Major damage events - enemy kills or high-damage hits
- **Frame 20**: Spec Ops 7 - explosion ahead on highway
- **Frame 30**: Frontline Breakthrough - explosion at army collision point
- **Frame 32**: Bridge battle - explosion amidst boss fight
- **Duration estimate**: Quick burst, ~0.3-0.5 seconds

### Moderate Effects

#### 4. Damage Number Pop (frames 26, 27, 29)
- **Style**: Large outlined numbers, white/yellow fill with dark outline
- **Animation**: Float upward from hit point, slight scale-up then fade
- **Frame 26**: Shows -98 and 38 (small damage values, Frontline mode)
- **Frame 27**: Shows 8,158 x2 (large boss damage, red coloring for boss hits)
- **Variation**: Red numbers for boss damage vs white for player damage

#### 5. Card Reveal Glow (frame 10)
- **Style**: Golden rectangular glow emanating from behind card
- **Animation**: Pulsing glow intensifies then reveals card content
- **Context**: RECRUIT screen, LASTWAR branded card
- **Sub-effects**: Particle sparkles around card edges

#### 6. Mission Completed Banner (frames 14, 15, 18, 21)
- **Style**: Golden ribbon/banner with decorative chevron arrows on sides
- **Animation**: Slides in from top or center expansion
- **Frame 14**: Stage 20 - small squad completion
- **Frame 15**: Stage 33 - larger army shown below banner
- **Frame 18**: Spec Ops 3 - includes Kills 86, Time 00:32 stats
- **Frame 21**: Stage 18 - includes damage stats for 5 heroes

#### 9. Projectile Trails (frames 29, 32)
- **Style**: Orange/white streak lines from unit positions to enemy positions
- **Animation**: Fast travel from source to target, slight arc
- **Frame 29**: Multiple projectiles from hero positions, visible during 00:28 timer
- **Frame 32**: Dense projectile field during bridge boss battle

### Subtle Effects

#### 7. Targeting Circle (frame 27)
- **Style**: Red circle with crosshair/reticle pattern
- **Animation**: Slow rotation around target, pulsing opacity
- **Context**: Isometric stage 18, appears around red boss unit
- **Purpose**: Indicates boss target for player army focus

#### 8. Hero Cooldown Timer (frame 29)
- **Style**: Radial sweep overlay on hero portrait slots
- **Animation**: Clockwise sweep clearing as cooldown completes
- **Frame 29**: 3 hero slots showing 7.9s / 7.0s / 8.0s remaining
- **Purpose**: Core gameplay feedback for ability timing

#### 10. Boss HP Bar (frames 26, 32)
- **Style**: Segmented horizontal bar, red fill on green/dark background
- **Position**: Top of battle screen
- **Animation**: Smooth drain as damage applied, segment breaks on thresholds
- **Context**: Appears in Frontline Breakthrough and bridge boss battles

---

## Transitions

| # | Transition | Type | Frames | Description |
|---|------------|------|--------|-------------|
| 1 | Battle Start | fade/zoom | 11 (battle view) | Camera zooms into highway battle scene, units appear |
| 2 | Mission Complete Overlay | slide-in | 14, 18, 21 | Golden banner slides over battle scene, stats populate |
| 3 | Back to Base | fade | 18 -> 24 | Battle fades out, base overview fades in |
| 4 | Mode Transition | cut/fade | various | Between Arena, Mall, Recruit, Battle modes |

---

## Effect Layering Observations

Simultaneous effect combinations observed:

1. **Frame 26**: Ice beams + damage numbers + boss HP bar + distance marker (4 layers)
2. **Frame 30**: Ice beams + golden explosion + damage numbers + army mass (4 layers)
3. **Frame 32**: Fire rain + ice effects + golden explosion + projectile trails + damage numbers + boss HP (6 layers)
4. **Frame 29**: Projectile trails + explosion + hero cooldown timers + stage timer (4 layers)

Peak visual density occurs in late-game bridge battles (frames 32-33) with 5-6 simultaneous effect layers.

---

## Godot 4 Implementation Notes

### Ice Beam Barrage
```
Node: GPUParticles2D
- emission_shape: line (horizontal spread matching army width)
- direction: Vector2(0, -1) with spread ~15 degrees
- color_ramp: cyan (#00DDFF) -> white (#FFFFFF) -> transparent
- amount: 40-60 particles
- lifetime: 0.4s
- speed: 800-1200 px/s
- Add sub-emitter for impact sparkle at endpoint
```

### Fire Rain
```
Node: GPUParticles2D
- emission_shape: rectangle (wide area above screen)
- direction: Vector2(0, 1) with spread ~5 degrees
- color_ramp: orange (#FF6600) -> red (#CC0000) -> transparent
- amount: 30-50 particles
- lifetime: 0.6s
- speed: 600-900 px/s
- Add ember sub-particles with slower speed, random drift
```

### Golden Explosion
```
Node: GPUParticles2D (burst mode, one_shot=true)
- emission_shape: point
- direction: radial (spread = 180)
- color_ramp: white (#FFFFFF) -> gold (#FFD700) -> transparent
- amount: 20-30 particles
- lifetime: 0.3s
- scale_curve: large -> small over lifetime
- Overlay: ColorRect with AnimationPlayer for screen flash (0.1s white fade)
```

### Damage Numbers
```
Node: Label + Tween
- font: bold, outlined (outline_size=4, outline_color=black)
- Tween sequence:
  1. scale: Vector2(0.5, 0.5) -> Vector2(1.2, 1.2) over 0.1s
  2. scale: Vector2(1.2, 1.2) -> Vector2(1.0, 1.0) over 0.05s
  3. position.y: -= 60px over 0.8s (ease_out)
  4. modulate.a: 1.0 -> 0.0 over last 0.3s
- Color variation: white for normal, red for boss, yellow for crit
- Use object pooling for performance during heavy combat
```

### Card Reveal Glow
```
Node: AnimationPlayer + ColorRect
- ColorRect behind card sprite, golden color
- AnimationPlayer keyframes:
  1. modulate.a: 0 -> 0.8 over 0.5s
  2. scale: Vector2(0.8, 0.8) -> Vector2(1.2, 1.2) over 0.5s
  3. Pulse: modulate.a oscillate 0.6-1.0 over 0.3s x3
  4. Card flip/reveal trigger
- Add GPUParticles2D sparkle overlay with low count (10-15)
```

### Hero Cooldown Timer
```
Node: TextureProgressBar (radial mode)
- fill_mode: FILL_CLOCKWISE
- texture_progress: semi-transparent dark overlay
- Label child for seconds remaining (formatted to 1 decimal)
- Update via _process(): value = (cooldown_remaining / cooldown_total) * 100
```
