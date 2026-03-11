# Royal Match — Asset Catalog

> Part of [Royal Match Reproduction Spec](../index.md)
> Total unique assets identified: ~65+

## Asset Summary by Priority

| Priority | Count | Description |
|----------|-------|-------------|
| P0 (Core Gameplay) | ~18 | 타일 5종, 부스터 3종, 장애물 6종, King 아바타, 보드 프레임, 수집 아이템 |
| P1 (Essential UI) | ~20 | HUD, 버튼, 패널, 네비게이션, 아이콘 |
| P2 (Polish) | ~15 | 배경 6종, 장식, 구름, 산 |
| P3 (Nice-to-have) | ~12 | Team UI, 팬파어, 전신 캐릭터, 드래곤 |

## P0: Core Gameplay Assets

### Characters / Entities

| # | Asset Name | Category | Size | States | Colors | Frames |
|---|-----------|----------|------|--------|--------|--------|
| 1 | King Avatar | NPC | ~64px 원형 | normal, happy, worried | Purple robe, gold crown | 015, 019-21 |

### Tiles (5종)

| # | Asset Name | Size | Shape | Color | Hex | Frames |
|---|-----------|------|-------|-------|-----|--------|
| 1 | Red Tile | ~48x48 | 둥근 정사각형 | Red | #d32f2f | 015, 017-21 |
| 2 | Blue Tile | ~48x48 | 방패 (Shield) | Blue | #1976d2 | 015, 017-21 |
| 3 | Green Tile | ~48x48 | 나뭇잎 (Leaf) | Green | #388e3c | 015, 017-21 |
| 4 | Yellow Tile | ~48x48 | 왕관 (Crown) | Gold | #ffc107 | 015, 017-21 |
| 5 | Pink Tile | ~48x48 | 다이아몬드 | Pink | #e91e63 | 019 |

### Boosters (3종)

| # | Asset Name | Size | Visual | Creation | Frames |
|---|-----------|------|--------|----------|--------|
| 1 | TNT | ~48x48 | 빨간 TNT 통 + 폭발 마크 | T/L형 5매치 | 005 |
| 2 | Rocket | ~48x48 | 줄무늬 구 (빨+노) | 4개 직선 매치 | 006 |
| 3 | Light Ball | ~48x48 | 무지개 구슬 (멀티컬러) | 5개 직선 매치 | 007 |

### Obstacles & Collectibles

| # | Asset Name | Size | Visual | Mechanic | Frames |
|---|-----------|------|--------|----------|--------|
| 1 | Wooden Box | ~48x48 | 밝은 갈색 나무 상자 | 인접 매치로 파괴 (HP 1-2) | 021 |
| 2 | Grass Tile | ~48x48 | 초록 잔디 패턴 | 매칭으로 제거 (HP 1) | 021 |
| 3 | Mailbox | ~48x48 | 금색 우체통 + 빨간 손잡이 | 인접 매치로 수집 | 015 |
| 4 | Fire Extinguisher | ~48x48 | 빨간 소화기 | Nightmare 수집 아이템 | 008 |
| 5 | Key | ~48x48 | 금색 열쇠 | Nightmare 수집 아이템 | 018 |
| 6 | Board Frame | 보드 크기 | 금색 테두리 보드 프레임 | 게임 영역 정의 | 019-21 |

## P1: Essential UI Assets

| # | Asset Name | Category | Position | Size | States | Frames |
|---|-----------|----------|----------|------|--------|--------|
| 1 | Target Panel | panel | top-left | ~120x60 | — | 015, 017-21 |
| 2 | Moves Counter | text-element | top-right | ~60x60 | — | 015, 017-21 |
| 3 | King Avatar Frame | icon | top-center | ~80x80 | normal/happy/worried | 015, 019-21 |
| 4 | Booster Button (x5) | button | bottom-bar | ~56x56 | locked/unlocked/active | 019-21 |
| 5 | Settings Gear | button | bottom-right | ~40x40 | normal | 019-21 |
| 6 | Continue Button | button | center | ~200x50 | normal/pressed | 013 |
| 7 | Play Button | button | center-left | ~120x50 | green, normal/pressed | 014 |
| 8 | Skip Button | button | center-right | ~120x50 | orange, normal/pressed | 014 |
| 9 | Close (X) Button | button | top-right | ~40x40 | red circle + X | 003, 009-014, 016, 018 |
| 10 | Claim Button | button | center | ~200x50 | green, normal/pressed | 012 |
| 11 | Coin Icon | icon | top-bar | ~24x24 | gold coin | 011, 022 |
| 12 | Life/Heart Icon | icon | top-bar | ~24x24 | green circle | 022 |
| 13 | Star Icon | icon | top-bar | ~24x24 | orange star | 022 |
| 14 | Timer (Circular) | bar | left | ~48x48 | green→yellow→red | 008, 018 |
| 15 | Progress Bar | bar | center-top | ~200x20 | blue fill | 008, 016, 018 |
| 16 | Well Done Panel | panel | center | ~300x250 | blue+gold frame | 013 |
| 17 | Unlock Panel | panel | center | ~300x300 | blue+gold frame | 012 |
| 18 | Nightmare Panel | panel | center | ~300x400 | gold frame + illustration | 014 |
| 19 | Castle Info Panel | panel | center | ~300x200 | blue curved panel | 011 |
| 20 | Join Button | button | center | ~150x50 | green | 009-010 |

## P2: Polish Assets

### Backgrounds & Environment

| # | Asset Name | Category | Layer | Tiling | Animation | Frames |
|---|-----------|----------|-------|--------|-----------|--------|
| 1 | Castle Exterior | background | back | no | static | 022, 023 |
| 2 | Castle Garden | background | back | no | static | 019, 021 |
| 3 | Palace Interior | background | back | no | static | 020 |
| 4 | Kitchen Interior | background | back | no | static | 016 |
| 5 | Dungeon/Cave | background | back | no | fire flicker | 018 |
| 6 | Checkered Floor | background | back | yes | static | 015 |
| 7 | Sky Gradient | parallax | far-back | no | cloud scroll | 019, 021-23 |
| 8 | Mountains | parallax | far-back | no | static | 019, 021 |

### Icons & Navigation

| # | Asset Name | Usage | Size | Style | Frames |
|---|-----------|-------|------|-------|--------|
| 1 | Trophy Tab | nav | M (48px) | 3D gold | 002, 022 |
| 2 | Cup Tab | nav | M | 3D gold | 002, 022 |
| 3 | Castle Tab (Home) | nav | M | 3D purple+gold | 002, 022 |
| 4 | Team Tab | nav | M | 3D purple shield | 002, 022 |
| 5 | Cards Tab | nav | M | 3D gold cards | 002, 022 |
| 6 | Area Progress Badge | badge | S (24px) | red circle + number | 022 |
| 7 | Treasure Chest | icon | M | purple+gold chest | 011 |

## P3: Nice-to-have Assets

- King 전신 일러스트 (Nightmare: 침대에 누운 왕 + 악몽 드래곤, frame-014)
- King 전신 캐릭터 (Kitchen: 서있는 왕, frame-016)
- Dragon 캐릭터 (빨간 드래곤, frame-018)
- Dog/Bear Companion (갈색 동물, frame-014)
- Fanfare Trumpets (나팔 2개, frame-017)
- Fireworks 이펙트 (frame-017)
- Team Info 전체 UI (frames 003, 009-010)
- Red Cushion (별 쿠션, frame-013)
- Arrow Booster 아이콘 (빨간 활, frame-012)

## Asset Generation Order

에셋 생성 시 아래 순서를 권장합니다:
1. P0 Core Gameplay assets → `gemini-web-image-gen` 스킬
2. P1 Essential UI → 디자인 시스템에 맞춰 생성
3. P2 Polish → 게임 완성 후
4. 에셋 후처리 → `godot-game-dev/reference/asset-pipeline.md` 참조
