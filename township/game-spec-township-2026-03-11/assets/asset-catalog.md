# Township — Asset Catalog

> Part of [Township Reproduction Spec](../index.md)
> Total unique assets identified: ~80+

## Asset Summary by Priority

| Priority | Count | Description |
|----------|-------|-------------|
| P0 (Core Gameplay) | ~25 | Tiles, buildings, match-3 blocks, products |
| P1 (Essential UI) | ~20 | Bottom bar, HUD, buttons, progress bars |
| P2 (Polish) | ~20 | Water, trees, clouds, NPCs, particles |
| P3 (Nice-to-have) | ~15+ | Card system, event-specific, cosmetic variants |

## P0: Core Gameplay Assets

### Isometric Tiles & Buildings

| # | Asset Name | Category | Size | States | Colors | Frames |
|---|-----------|----------|------|--------|--------|--------|
| 1 | Grass Tile | tilemap | 64x32 iso | normal | Green #8BC34A | 14, 20-22 |
| 2 | Road Tile | tilemap | 64x32 iso | straight, curve, intersection | Grey #757575 | 14, 20-22 |
| 3 | Water Tile | tilemap | 64x32 iso | animated (wave) | Blue #1565C0 | 20-21 |
| 4 | Residential House (small) | building | 2x2 iso | built | Red/brown roof | 14, 20-22 |
| 5 | Residential House (medium) | building | 2x2 iso | built | Blue/white | 20-22 |
| 6 | Residential House (large) | building | 3x3 iso | built | Various | 20-22 |
| 7 | Factory Building | building | 2x3 iso | idle, producing | Brown/grey | 16, 22 |
| 8 | Farm Field | building | 3x3 iso | empty, growing, ready | Brown→Green | 14, 20 |
| 9 | Community Building | building | 3x3+ iso | built | Stone/gold dome | 21 |
| 10 | Harbor/Dock | building | variable | built | Wood/stone | 20-21 |

### Match-3 Pieces

| # | Asset Name | Size | Visual | Frames |
|---|-----------|------|--------|--------|
| 1 | Red Block | ~48x48px | Solid red rounded square | 17 |
| 2 | Green Block | ~48x48px | Solid green rounded square | 17 |
| 3 | Yellow Block | ~48x48px | Solid yellow rounded square | 17 |
| 4 | Blue Block | ~48x48px | Solid blue rounded square | 17 |
| 5 | Acorn Piece | ~48x48px | Brown acorn special item | 17 |
| 6 | Coin Piece | ~48x48px | Gold coin special item | 17 |
| 7 | Rainbow Ball | ~56x56px | Multi-color swirl sphere | 17 |
| 8 | Flower Combo | ~64x64px | Multi-petal combo piece | 17 |

### Products / Items

| # | Asset Name | Size | Visual | Frames |
|---|-----------|------|--------|--------|
| 1 | Muffin | ~32x32px | Golden brown pastry | 16 |
| 2 | Bread/Pastry variants | ~32x32px | Various baked goods | 16 |
| 3 | Crop icons (wheat, corn, etc.) | ~32x32px | Various farm products | 14, 20-22 |
| 4 | Processed goods (cookie, cake, etc.) | ~32x32px | Factory outputs | 13, 18 |

## P1: Essential UI Assets

| # | Asset Name | Category | Position | Size | States | Frames |
|---|-----------|----------|----------|------|--------|--------|
| 1 | Star Level Badge | icon | top-left | 64x64px | normal | 2, 9, 16 |
| 2 | Coin Counter Bar | bar | top-center | 120x36px | normal | 13, 21-22 |
| 3 | T-Cash Counter | icon | top-right | 80x36px | normal | 21-22 |
| 4 | Barn Capacity Indicator | bar | right | 120x28px | normal, full, overflow | 14 |
| 5 | Bottom Nav Bar | panel | bottom | full-width x 64px | normal | 21-22 |
| 6 | Trophy Button | button | bottom-bar | 48x48px | normal, notification | 21-22 |
| 7 | Quest/Star Button | button | bottom-bar | 48x48px | normal, notification | 21-22 |
| 8 | Card Button | button | bottom-bar | 48x48px | normal, notification | 21-22 |
| 9 | Helicopter Button | button | bottom-bar | 48x48px | normal, notification | 21-22 |
| 10 | Construction Button | button | bottom-bar | 48x48px | normal, notification | 21-22 |
| 11 | Claim Button (green) | button | modal | 80x36px | normal, pressed | 7, 15 |
| 12 | Send Button (green) | button | modal | 80x36px | normal, pressed | 13 |
| 13 | Event Timer Badges | panel | left-side | 64x48px | various event types | 9, 21-22 |
| 14 | Progress Bar | bar | various | variable | filling | 6, 7 |
| 15 | Modal Background (dark overlay) | panel | fullscreen | full | normal | 3-8, 12 |
| 16 | Modal Card (beige/parchment) | panel | center | variable | normal | 13, 16, 18 |
| 17 | Moves Counter Panel | panel | left | 60x80px | normal | 17 |
| 18 | Goal Icons Panel | panel | right | 60x200px | normal | 17 |
| 19 | Settings Gear | button | top-right | 36x36px | normal | 17 |
| 20 | Skip Button | button | top-right | 60x30px | normal | 11 |

## P2: Polish Assets

### Backgrounds & Environment

| # | Asset Name | Category | Layer | Tiling | Animation | Frames |
|---|-----------|----------|-------|--------|-----------|--------|
| 1 | Garden Background | background | back | no | static | 1, 2, 17 |
| 2 | Ocean Water | background | back | yes | wave animation | 20-21 |
| 3 | Mountain/Rock | decorative | mid | no | static | 9, 11, 20 |
| 4 | Pine Trees | decorative | mid | no | subtle sway | 9, 11 |
| 5 | Deciduous Trees | decorative | mid | no | subtle sway | 1, 14 |
| 6 | Cloud/Fog Layer | parallax-layer | front | yes | scrolling | 9 |
| 7 | Flowers/Bushes | decorative | mid | no | static | 1, 17 |
| 8 | Sand/Beach | tilemap | back | yes | static | 20 |

### Icons & Symbols

| # | Asset Name | Usage | Size | Style | Frames |
|---|-----------|-------|------|-------|--------|
| 1 | Gold Star | HUD/reward | M (32px) | 3D rendered | 2, 9 |
| 2 | Gold Coin | HUD/currency | S (24px) | 3D rendered | 13, 21 |
| 3 | T-Cash Bill | HUD/premium | S (24px) | 3D rendered | 21-22 |
| 4 | Heart Icon | social | S (24px) | filled | 19 |
| 5 | Trophy Icon | competition | M (32px) | 3D rendered | 6, 21 |
| 6 | Red Notification Badge | alert | S (16px) | filled circle | 7, 15, 19 |
| 7 | Green Checkmark | completion | S (16px) | filled | 12, 15 |
| 8 | XP/Level Arrow | progression | S (24px) | outline | 13 |

## P3: Nice-to-have Assets

- Card pack wrapper ("Town Cards!" branded)
- Card back (blue diamond pattern)
- Card face template (star ratings)
- Knight Pass track visual elements
- Knight character mascot
- NPC character portraits (8+ unique villagers)
- Rachel + dog story characters
- Regatta boat icons
- Team chat UI elements
- Seasonal/event decorations
- Building style variants (multiple roof colors/styles)
- Dock/pier structures
- Island decorations

## Asset Generation Order

에셋 생성 시 아래 순서를 권장합니다:
1. P0 Core Gameplay assets → `gemini-web-image-gen` 스킬
2. P1 Essential UI → 디자인 시스템에 맞춰 생성
3. P2 Polish → 게임 완성 후
4. 에셋 후처리 → `godot-game-dev/reference/asset-pipeline.md` 참조
