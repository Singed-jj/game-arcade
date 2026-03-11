# Claude Asset Identification & Catalog — Township

## 1. Character / Entity Assets

| Asset Name | Category | Frames Seen | Approx Size | States Observed | Color Scheme | Style Notes |
|-----------|----------|-------------|-------------|----------------|-------------|-------------|
| Rachel (Explorer) | NPC | 11 | ~25% screen height | dialogue | Brown jacket, blue headphones | Semi-realistic cartoon, adventure outfit |
| Black Dog | NPC | 11 | ~10% screen width | running | Black/dark grey | Animated quadruped, near cage |
| Knight Character | NPC | 3, 7, 15 | ~8% screen height | idle (mascot) | Red hat, blue outfit, lance | Battle pass mascot, medieval theme |
| Helicopter NPCs | NPC | 18 | ~5% each | idle portraits | Various hair/outfits | 8+ unique villager avatars with map pins |
| Team Avatars | NPC | 19 | ~8% each | chat portrait | Various | Player profile pictures in chat |
| Bird/Chicken (Mom) | NPC | 19 | ~5% | idle | Red/blue, riding bird | Co-op team mascot |

## 2. UI Element Assets

| Asset Name | Category | Screen Position | Frames Seen | Interaction |
|-----------|----------|----------------|-------------|-------------|
| Star Badge (level) | icon | top-left | 2, 9, 16 | display-only |
| Coin Counter | bar | top-center | 13, 21-22 | display-only |
| T-Cash Counter | icon | top-right | 21-22 | tap (shop) |
| Barn Capacity Bar | bar | right | 14 | tap (expand) |
| Bottom Nav Bar | panel | bottom | 21-22 | tap (5 buttons) |
| Trophy Button | button | bottom-left | 21-22 | tap |
| Star/Quest Button | button | bottom | 21-22 | tap |
| Card Button | button | bottom | 21-22 | tap |
| Helicopter Button | button | bottom | 21-22 | tap |
| Construction Button | button | bottom-right | 21-22 | tap |
| Event Timer Stack | panel | left side | 9, 21-22 | tap |
| Claim Button (green) | button | center | 7, 8, 15 | tap |
| Send Now Button (green) | button | right | 13 | tap |
| Skip Button | button | top-right | 11 | tap |
| Knight Pass Banner | panel | top | 3, 7, 8, 15 | display |
| Progress Bar | bar | center | 6, 7 | display-only |

## 3. Background & Environment Assets

| Asset Name | Category | Layer | Frames Seen | Tiling | Animation |
|-----------|----------|-------|-------------|--------|-----------|
| Town Garden Background | background | back | 1, 2, 17 | no | static |
| Isometric Grass Tiles | tilemap | back | 14, 20-22 | yes | static |
| Water/Ocean | background | back | 20-21 | yes | animated (wave) |
| Mountain/Rocks | decorative | mid | 9, 11, 20 | no | static |
| Pine Trees | decorative | mid | 9, 11 | no | subtle sway |
| Cloud/Fog Layer | parallax-layer | front | 9 | yes | scrolling |
| Dark Overlay | background | front | 1-4, 6, 12 | no | fade in/out |

## 4. Building Assets (Isometric)

| Asset Name | Category | Frames Seen | Size | Notes |
|-----------|----------|-------------|------|-------|
| Residential Houses | building | 14, 20-22 | 2x2 tiles | Red/blue/brown roofs, various levels |
| Factories | building | 16, 14, 22 | 2x3 tiles | Pastry Factory, various production |
| Farms/Fields | building | 14, 20 | 3x3 tiles | Crop rows visible |
| Community Buildings | building | 21 | 3x3+ tiles | Church/town hall with domes |
| Harbor/Dock | building | 20-21 | variable | Boats, pier, coastal buildings |
| Airport | building | 13 | modal view | Runway with planes |
| Helicopter Pad | building | 18 | modal view | Map with NPC markers |
| Roads | tilemap | 14, 20-22 | 1-tile width | Grey asphalt, curves |
| Decorative Items | decorative | 14, 20-22 | 1x1 | Trees, benches, fountains, statues |

## 5. Match-3 Puzzle Assets (frame 17)

| Asset Name | Category | Size | Color | Notes |
|-----------|----------|------|-------|-------|
| Red Block | collectible | ~8% board | Red | Solid colored square |
| Green Block | collectible | ~8% board | Green | Solid colored square |
| Yellow Block | collectible | ~8% board | Yellow | Solid colored square |
| Blue Block | collectible | ~8% board | Blue | Solid colored square |
| Acorn Piece | collectible | ~8% board | Brown | Special item |
| Coin Piece | collectible | ~8% board | Gold | Special item |
| Rainbow Ball | special | ~8% board | Multi-color | Powerful combo piece |
| Flower Combo | special | ~10% board | Multi-color | Large special piece |
| Ice Cream Goal | goal-icon | ~5% panel | Pink/white | Right panel goal |
| Cup Goal | goal-icon | ~5% panel | Red/brown | Right panel goal |
| Horse Goal | goal-icon | ~5% panel | Brown | Right panel goal |
| Moves Counter | UI | ~5% panel | Beige panel | Left side "Moves 12" |
| Settings Gear | UI | ~3% | Blue | Top-right corner |

## 6. Card/Reward Assets

| Asset Name | Category | Frames Seen | Notes |
|-----------|----------|-------------|-------|
| Town Cards Pack | collectible | 4, 12 | Orange/brown wrapper, "Town Cards!" logo |
| Card Back | collectible | 10 | Blue with diamond pattern |
| Card Face | collectible | 10 | Photo-style with star rating (1-3 stars) |
| Reward Chest | reward | 7, 15 | Various sizes, green/brown |
| Money Stack | reward | 7, 15 | Green dollar bills |
| Knight Pass Track | UI | 7, 15 | Horizontal scroll with numbered nodes |

## 7. Asset Priority for Reproduction

### P0 (Core Gameplay)
- Isometric grass/terrain tiles
- Basic building sprites (houses, factories, farms)
- Match-3 colored blocks (4 colors)
- Product/crop icons (food items)
- Road tiles

### P1 (Essential UI)
- Bottom navigation bar + 5 icons
- Coin/currency counters
- Star badge
- Claim/Send buttons
- Progress bars
- Modal overlay backgrounds

### P2 (Polish)
- Character portraits (NPCs)
- Water/ocean animation
- Cloud/fog layer
- Confetti particles
- Building detail variations
- Decorative items (trees, benches)

### P3 (Nice-to-have)
- Card collection system assets
- Knight Pass track visuals
- Multiple building style variants
- Seasonal/event decorations

**Total Unique Assets Identified**: ~80+ distinct visual elements
