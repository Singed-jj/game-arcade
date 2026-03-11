# Claude Effects & Motion Analysis — Township

> Note: Frames extracted at 0.5fps (2-second intervals). Precise timing cannot be determined from these frames. Analysis focuses on effect identification and reproduction notes.

## 1. Effect Catalog

| Effect Name | Type | Frames Seen | Trigger | Visual Description | Layer | Intensity |
|-------------|------|-------------|---------|-------------------|-------|-----------|
| Star Reward Float | animation | 2 | Level completion | 2 golden stars floating/bouncing in center screen | overlay | moderate |
| Confetti Burst | particle | 5 | Event/race completion | Multi-color dots (green, yellow, blue, pink) scattered across screen | overlay | dramatic |
| Card Pack Glow | screen-effect | 12 | Card pack ready | Green glow emanating from card pack | overlay | moderate |
| Cloud Fog | animation | 9 | Unexplored area | White/grey clouds obscuring map areas, slow drift | midground | subtle |
| Factory Steam | particle | 16 | Production active | White smoke/steam rising from oven | foreground | subtle |
| Product Bubble Float | UI-feedback | 14, 20-22 | Product ready/needed | Small icons floating above buildings | overlay | subtle |

## 2. Transition Catalog

| Transition Name | Type | Frames | Direction | Easing |
|----------------|------|--------|-----------|--------|
| Dark Overlay | fade | 1→2 | in | ease-in |
| Modal Popup | zoom | Various | center-out | ease-out/bounce |
| Card Reveal | custom | 10 | flip horizontal | ease-in-out |
| Screen Darken (overlay) | fade | 3,4,6,12 | in | ease-in |

## 3. Animation Patterns

| Animation Name | Target | Property | Loop | Easing |
|---------------|--------|----------|------|--------|
| Star Bounce | Star icons | position + scale | no (1 play) | bounce |
| Coin Counter Tick | Coin display | value + scale | no | ease-out |
| Timer Countdown | Timer text | value | yes (every 1s) | linear |
| Product Bubble Bob | Product icons | position.y | yes | sine |
| Cloud Drift | Fog layer | position.x | yes | linear |
| Notification Pulse | Red badges | scale | yes | sine |
| Button Highlight | Claim buttons | color/glow | yes | sine |

## 4. Effect Reproduction Notes (Godot)

### Star Reward
- **Node**: `AnimationPlayer` on `Sprite2D`
- **Key params**: Scale 0→1.2→1.0 (overshoot), position tween from center-top to slot
- **Duration**: ~1.5s per star

### Confetti Burst
- **Node**: `GPUParticles2D`
- **Key params**: Emission shape: rect (full screen), gravity: (0, 50), spread: 360°, amount: 100-200
- **Colors**: Randomize between green, yellow, blue, pink, red
- **Lifetime**: 2-3s, one-shot

### Card Reveal Flip
- **Node**: `Tween` on `TextureRect`
- **Sequence**: Scale.x: 1→0 (0.15s) → swap texture → Scale.x: 0→1 (0.15s)
- **Easing**: ease-in then ease-out

### Product Bubble Bob
- **Node**: `Tween` (looping) on product icon container
- **Key params**: position.y oscillation ±5px, duration 1.5s
- **Easing**: TRANS_SINE

### Cloud/Fog Layer
- **Node**: `ParallaxLayer` with `Sprite2D` tiled
- **Key params**: Slow horizontal scroll (10-20 px/s), alpha 0.7-0.9
- **Reveal**: Tween alpha to 0 when area unlocked
