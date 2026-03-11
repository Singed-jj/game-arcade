# Visual & UI Analysis: Last War: Survival

## 1. Art Style

### 1.1 Overall Aesthetic
- **Style**: Cartoon/stylized 3D with isometric perspective for base management, transitioning to pseudo-3D side/top-down views for combat
- **Quality Tier**: Mid-tier mobile - polished casual style with sufficient detail for engagement without demanding hardware
- **Theme**: Post-apocalyptic zombie survival rendered in an approachable, non-threatening cartoon style

### 1.2 Character Design
- **Soldiers/Troops**: Chibi-style blue-helmeted troops with simplified proportions, forming recognizable squads at any zoom level (frames 14, 15, 26, 30, 32-33)
- **Heroes**: Semi-realistic portrait illustrations with distinct visual identities:
  - Nova Gump: Battlefield scene backdrop, military styling (frame 22)
  - Monica (SSR): Motorcycle visual, more detailed/premium presentation befitting SSR rarity (frame 23)
- **Enemies**: Red-colored bosses and zombie units for clear visual contrast against blue player troops (frames 27, 32-33)

### 1.3 Environment Design
- **Base Terrain**: Green grass with paved cross-shaped road networks, fenced perimeters, scattered vegetation (frames 6-8, 12-13, 24-25)
- **Battle Environments**:
  - Highway: Divided road with median strip, vehicles as environmental props (frames 11, 20)
  - Isometric forest: Trees, targeting circles on ground (frame 27)
  - Bridge: Narrow corridor forcing army compression for dramatic visual density (frames 32-33)
- **Decorative Elements**: Large creature (elephant/rhino) sitting on main building adds character and visual landmark (frame 25)

### 1.4 Visual Effects
- **Battle VFX**: Fire effects, ice beams, lightning, golden energy bursts, projectile trails, explosions (frames 26, 29, 30, 32-33)
- **UI VFX**: Golden glow on gacha/recruit card slots indicating premium content (frames 4, 10)
- **Damage Numbers**: Large floating numbers with outline/stroke, multiplier notation (x2, x8) for impact feedback (frames 27, 32)

---

## 2. Color Palette

### 2.1 Primary Colors

| Role | Color | Hex (Approximate) | Usage | Frames |
|------|-------|--------------------|-------|--------|
| UI Background | Dark navy/slate | #2D3748 | Shop, Arena, popup backgrounds | 2, 3, 4, 17 |
| Highlight/CTA | Orange/amber | #F6AD55 | Active tabs, buttons, highlights | 3, 17, 22 |
| Player Identity | Bright blue | #4299E1 | Player troops, ice effects, UI accents | 14, 15, 26, 30, 32 |
| Danger/Premium | Red | #E53E3E | Damage numbers, gems, enemy units | 4, 27, 32 |
| Success/Confirm | Green | #48BB78 | Upgrade buttons, confirm actions, terrain | 9, 22 |
| Base Terrain | Grass green | #68D391 | Isometric base ground | 6-8, 12-13, 24 |
| Gold/Currency | Gold/yellow | #ECC94B | Gold icons, victory effects, gacha glow | 4, 10, 30 |
| Text/Clean | White | #FFFFFF | Body text, damage numbers, stage indicators | Throughout |

### 2.2 Color Psychology
- **Blue vs Red Dichotomy**: Clear friend/foe identification - player forces are always blue, enemies are red (frames 27, 32-33). Universal gaming convention well-executed.
- **Dark UI + Bright Game**: Dark navy UI panels create contrast with the bright, colorful game world, keeping attention on gameplay
- **Golden Premiums**: Gold/amber used consistently for premium/desirable content (gacha glow, VIP, currency icons)

### 2.3 Contrast & Readability
- White text on dark backgrounds for UI panels - high contrast, good readability (frames 2, 3, 4, 17)
- Damage numbers use white with dark outlines for visibility against varied battle backgrounds (frames 27, 29, 32)
- Resource counters maintain consistent positioning and styling for quick scanning (frames 16, 24, 31)

---

## 3. UI Layout

### 3.1 Screen Structure (Portrait 9:16)

```
┌─────────────────────────┐
│  [Resources/Currencies]  │  ← Top bar: persistent resource display
│                          │
│                          │
│                          │
│     [Main Game Area]     │  ← Center: base view / battle / shop content
│                          │
│                          │
│                          │
│  [Navigation / Actions]  │  ← Bottom bar: primary navigation
│  [Alliance Chat]         │  ← Bottom overlay: social features
└─────────────────────────┘
```

### 3.2 Navigation Architecture
- **Bottom Navigation Bar**: Primary screen switching - HEROES, Inventory, WORLD visible (frame 31)
- **Tab System**: Sub-navigation within screens via horizontal tabs (frames 2, 3: ARENA tabs, MALL tabs)
- **Back Navigation**: Back arrow in bottom-left corner for hierarchical navigation (frames 5-8)
- **Home Button**: Bottom-right for quick return to base (frames 5-8)

### 3.3 Popup/Modal System
- **Full-screen Modals**: ARENA, MALL, RECRUIT take over the screen with dark backgrounds (frames 2, 3, 4)
- **Centered Popups**: "Missing Items", "Change Name" appear as centered dialogs over dimmed game view (frames 9, 16, 19)
- **Victory/Complete Screens**: Post-battle results overlay the battle scene (frames 14, 15, 18, 21, 28)

### 3.4 Battle UI Layout
```
┌─────────────────────────┐
│  [Stage Info / Timer]    │  ← Top: stage number, timer, objectives
│                          │
│                          │
│     [Battle Scene]       │  ← Center: combat action
│                          │
│                          │
│ [Hero Card 1][2][3]      │  ← Bottom: hero ability cards with cooldowns
└─────────────────────────┘
```
- Stage identifier top-left (frames 14, 15, 26, 29)
- Timer display (frame 29: 00:28)
- Hero card slots at bottom with circular cooldown overlays (frame 29: 7.9s, 7.0s, 8.0s)

### 3.5 Base UI Layout
- Resource bar at top with 4+ resource types (frames 16, 24, 31)
- Player level/VIP indicator (frame 31: Lv 120, VIP 1)
- Building interaction through tap on structures
- Alliance chat panel at bottom of base view (frame 31)

---

## 4. Typography

### 4.1 Header Typography
- **Style**: Bold italic/condensed sans-serif with comic book/military styling
- **Usage**: Screen titles - "ARENA", "MALL", "RECRUIT", "LASTWAR" (frames 2, 3, 4, 10)
- **Treatment**: Often uppercase with slight italicization, suggesting urgency and action
- **Size**: Large, dominating the top portion of modal screens

### 4.2 Body Typography
- **Style**: Clean sans-serif, likely system font or custom regular weight
- **Usage**: Descriptions, stats, labels, chat text
- **Color**: Primarily white on dark backgrounds, dark on light backgrounds
- **Readability**: High contrast maintained across all observed screens

### 4.3 Combat Typography
- **Damage Numbers**: Extra-large bold numerals with dark outline/stroke for maximum visibility (frames 27, 32)
- **Multiplier Notation**: "x2", "x8" appended to damage values (frames 27, 32)
- **Kill/Timer Stats**: Clean white text - "Kills: 86", "Time: 00:32" (frame 18)
- **Stage Indicators**: Clear white text with dark backing - "Stage 20", "Spec Ops 7" (frames 14, 20)

### 4.4 Stat Display Typography
- **Hero Stats**: Consistent label-value pairs in clean formatting (frames 22-23):
  - Labels: "Attack", "HP", "Defense", "March Size" in regular weight
  - Values: Corresponding numbers in bold/semi-bold
  - Power score: Prominently displayed composite number

---

## 5. Icons & Symbols

### 5.1 Currency Icons
| Icon | Style | Usage | Frames |
|------|-------|-------|--------|
| Gold coin | Circular, golden, 3D-styled | Primary soft currency | 4, 16, 24, 31 |
| Red gem | Hexagonal, faceted, red | Premium currency (gems) | 4 |
| Gold ticket | Rectangular, golden | Gacha/recruit tickets | 4 |
| Diamond | Crystal/gem shape | Arena purchases | 17 |

### 5.2 Battle Icons
- **Skull Icon**: Enemy count/kill tracker (frame 14: skull with "0" count)
- **Targeting Circles**: Ground-based AoE indicators during combat (frame 27)
- **Hero Card Icons**: Hero portrait thumbnails in circular/rectangular frames during battle (frame 29)

### 5.3 UI Navigation Icons
- **Back Arrow**: Left-pointing arrow, bottom-left positioning (frames 5-8)
- **Home Button**: House icon, bottom-right positioning (frames 5-8)
- **Tab Indicators**: Active/inactive state differentiation through color fill (amber active vs grey inactive)

### 5.4 Icon Style Consistency
- Mixed filled/3D icon style throughout - currency icons lean toward 3D/skeuomorphic while navigation icons are flatter
- Consistent sizing within categories (all currency icons same scale in resource bar)
- Color-coded by function: gold for currency, red for premium, blue for player actions

---

## 6. Screen Orientation & Device

### 6.1 Orientation
- **Portrait (9:16)**: All 33 frames confirm portrait-only orientation
- **No Landscape Mode Observed**: Consistent across all screens - base, battle, UI panels
- **Implication**: Designed for one-handed mobile play, casual/accessible positioning

### 6.2 Target Device
- **Primary**: Mobile phone (smartphone)
- **Screen Density**: UI elements sized for thumb-tap interaction (large buttons, generous touch targets)
- **Safe Areas**: Content properly inset from edges, accounting for notch/rounded corners on modern devices

### 6.3 Responsive Design Notes
- Resource bars and navigation elements appear fixed/anchored to screen edges
- Game area scales to fill available center space
- Modal popups centered with consistent padding regardless of content size
- Battle UI maintains consistent hero card slot positioning at bottom of screen

---

## 7. Screen Inventory

| Screen | Type | Key Elements | Frames |
|--------|------|-------------|--------|
| Loading | Splash | Black screen | 1 |
| Arena | Feature | Rookie Bootcamp tabs, challenge lineup | 2, 17 |
| Mall | Shop | Tabbed navigation, dark background | 3 |
| Recruit | Gacha | Currency display, card pack, golden glow | 4, 10 |
| Radar Tasks | Feature | Timer, task count, radar building | 5 |
| Base View | Core | Isometric buildings, resources, navigation | 6-8, 12-13, 24-25, 31 |
| Missing Items | Popup | Hero shard status, obtain button | 9 |
| Highway Battle | Combat | Troops on road, vehicles, explosions | 11, 20 |
| Stage Complete | Result | Mission stats, damage breakdown | 14, 15, 18, 21, 28 |
| Change Name | Popup | Text input, keyboard, confirm | 16, 19 |
| Hero Detail | Feature | Stats, portrait, upgrade button | 22, 23 |
| Frontline | Combat | Distance-based, stat display, effects | 26, 30 |
| Stage Battle | Combat | Isometric trees, boss, targeting | 27, 29 |
| Bridge Battle | Combat | Narrow corridor, boss, massive army | 32, 33 |
