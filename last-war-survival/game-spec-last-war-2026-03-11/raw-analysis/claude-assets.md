# Last War: Survival - Asset Identification Analysis

> **Date**: 2026-03-11
> **Source**: 33-frame screen capture analysis
> **Purpose**: Comprehensive asset catalog for game recreation/study

---

## Frame Analysis Summary

33 frames captured across multiple game screens including: base management, hero collection, battle sequences, UI menus (Arena, Mall, Recruit), and boss encounters. The game features a chibi-style military aesthetic with blue-allied forces versus zombie/red enemy factions.

---

## P0: Core Gameplay Assets

### Characters / Entities

| # | Asset Name | Category | Size | States | Colors | Frames |
|---|-----------|----------|------|--------|--------|--------|
| 1 | Blue Helmet Soldier | player-unit | ~2% screen | idle / marching / attacking | Blue helmet, tan body | 14, 15, 26, 29, 30, 32, 33 |
| 2 | Military Vehicle (Truck) | player-unit | ~4% screen | moving / parked | Dark brown/green | 11, 14, 15 |
| 3 | Tank/Artillery | player-unit | ~4% screen | moving / firing | Dark metal/blue | 14, 26 |
| 4 | Zombie Boss (Large) | enemy-boss | ~15% screen | idle / attacking | Gray/white, muscular | 33 |
| 5 | Red Boss Enemy | enemy-boss | ~10% screen | attacking / damaged | Red, inflated body | 27 |
| 6 | Regular Enemies | enemy | ~2% screen | various | Yellow/orange helmet | 26, 29, 32 |
| 7 | Hero - Gump | hero-portrait | ~30% card | idle | Red suit, gas mask | 22 |
| 8 | Hero - Monica SSR | hero-portrait | ~30% card | idle, motorcycle | Blonde, military cap | 23 |
| 9 | Hero - Elsa | hero-portrait | ~5% list | list-item | Various | 21 |
| 10 | Hero - Kimberly | hero-portrait | ~5% | thumbnail | Orange-framed portrait | 9 |
| 11 | Mammoth/Creature | base-decoration | ~8% screen | sitting | Purple/gray | 25 |

### Collectibles

| # | Asset Name | Size | Visual | Frames |
|---|-----------|------|--------|--------|
| 1 | Hero Shard | small | Puzzle piece with portrait | 9 |
| 2 | LASTWAR Card Pack | medium | Blue/purple card with star logo | 10 |

---

## P1: Essential UI Assets

| # | Asset Name | Category | Position | States | Frames |
|---|-----------|----------|----------|--------|--------|
| 1 | Resource Bar (Gold) | bar | top-left | normal | 24, 31 |
| 2 | Resource Bar (Metal) | bar | top-center | normal | 24, 31 |
| 3 | Resource Bar (Blue/Oil) | bar | top-right | normal | 24, 31 |
| 4 | Gem/Diamond Icon | icon | top-right | normal | 4, 17 |
| 5 | Gold Ticket Icon | icon | top-center | normal | 4 |
| 6 | Back Arrow Button | button | bottom-left | normal / pressed | 2, 3, 5, 29 |
| 7 | Home Button | button | bottom-right | normal | 5 |
| 8 | Mission Completed Banner | banner | center | animated | 14, 15, 18, 21 |
| 9 | Upgrade Button | button | center-bottom | normal | 22, 23 |
| 10 | Hero Card Slot | card | bottom-bar | normal / cooldown | 29 |
| 11 | Damage Number | text-effect | floating | pop-up | 26, 27 |
| 12 | Stage Indicator | label | top-center | normal | 14, 15, 27, 29 |
| 13 | Bottom Navigation | tab-bar | bottom | active / inactive | 31 |
| 14 | X Close Button | button | top-right of popup | normal | 9, 17 |
| 15 | Shield Badge (T) | icon | center | normal | 18 |

---

## P2: Polish Assets

### Backgrounds

| # | Asset Name | Category | Layer | Tiling | Frames |
|---|-----------|----------|-------|--------|--------|
| 1 | Green Grass Terrain | background | back | yes | 6, 7, 8, 12, 13, 24 |
| 2 | Highway Road | background | mid | yes (repeat length) | 11, 14, 20, 26 |
| 3 | Bridge (Red Railings) | background | mid | no | 26, 30, 32, 33 |
| 4 | Dark Navy UI Background | background | back | no | 2, 3, 4 |
| 5 | Sandy/Dirt Area | background | back | yes | 12, 13, 24 |

### Buildings

| # | Asset Name | Size | Frames |
|---|-----------|------|--------|
| 1 | HQ/Main Building | large | 24, 25, 31 |
| 2 | Radar Tower | medium | 5 |
| 3 | Production Buildings (various) | small-medium | 24, 31 |
| 4 | Fence/Wall Segments | small | 24, 31 |
| 5 | Zombie Factory | medium | 28 |
| 6 | Roads/Paths | tilemap | 7, 8, 12, 13, 31 |

### Trees / Environment

| # | Asset Name | Frames |
|---|-----------|--------|
| 1 | Pine Trees | 27, 29 |
| 2 | Round Trees (Green) | 29 |

---

## P3: Nice-to-have

- Hero skill icons (various ability indicators per hero)
- VIP badge (premium status indicator)
- Alliance chat bubbles (social interaction UI)
- Road lane markings (highway detail texture)
- Fence variations (different wall/barrier styles for base perimeter)

---

## Asset Summary

| Priority | Count | Description |
|----------|-------|-------------|
| P0 | 13 | Core gameplay characters, units, bosses, collectibles |
| P1 | 15 | Essential UI elements, buttons, bars, indicators |
| P2 | 13 | Backgrounds, buildings, environment props |
| P3 | 5 | Detail polish and secondary decorations |
| **Total** | **46** | |

---

## Asset Generation Order

| Order | Asset | Rationale |
|-------|-------|-----------|
| 1 | P0 Blue Helmet Soldier | Main visual identity; appears in 7+ frames; defines player faction |
| 2 | P0 Zombie Boss + Red Boss | Primary antagonists; required for battle loop |
| 3 | P0 Vehicles (Truck, Tank) | Core army composition alongside soldiers |
| 4 | P1 UI Elements | Resource bars, buttons, banners needed for playable prototype |
| 5 | P2 Backgrounds and Terrain | Highway, grass, bridge for scene composition |
| 6 | P0 Hero Portraits | Collection/gacha system visuals |
| 7 | P2 Buildings | Base management screen |
| 8 | P2 Trees/Environment | Scene polish |
| 9 | P3 Detail Assets | Final polish pass |

---

## Notes

- **Art Style**: Chibi/super-deformed military characters with exaggerated proportions. Buildings use an isometric perspective on the base screen.
- **Color Language**: Blue = player/allied forces, Red/Orange = enemy forces, Gold = premium/reward items, Green = action/confirm buttons.
- **Scale Reference**: Soldiers are approximately 2% of screen height; bosses scale to 10-15% indicating visual hierarchy through size contrast.
- **Animation Needs**: Soldiers require march cycles, attack animations, and idle states. Bosses need attack wind-up, damage-taken, and death sequences. UI elements need press/hover feedback and transition animations.
