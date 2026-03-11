# Asset Identification & Catalog — Royal Match

## 1. Character / Entity Assets

| Asset Name | Category | Frames Seen | Approx Size | States Observed | Color Scheme | Style Notes |
|-----------|----------|-------------|-------------|-----------------|-------------|-------------|
| King Character | NPC | 015-022 | ~15% width | idle, worried, happy | Purple robe, gold crown | 3D rendered, 큰 수염, 친근한 표정 |
| Dragon | enemy | 018 | ~25% width | idle (위협) | Red body, yellow belly | 3D, 날개 접은 채 서있음 |
| Dog/Bear Companion | NPC | 014 | ~10% width | sleeping | Brown fur | King과 함께 침대에 누움 |

## 2. Game Tile Assets (P0 — Core Gameplay)

| Asset Name | Category | Frames Seen | Color | Shape | States |
|-----------|----------|-------------|-------|-------|--------|
| Red Tile | collectible | 015, 017-21 | Red `#d32f2f` | 둥근 정사각형 | normal, highlighted, matched |
| Blue Tile | collectible | 015, 017-21 | Blue `#1976d2` | 방패(Shield) 형태 | normal, highlighted, matched |
| Green Tile | collectible | 015, 017-21 | Green `#388e3c` | 나뭇잎(Leaf) 형태 | normal, highlighted, matched |
| Yellow Tile | collectible | 015, 017-21 | Gold `#ffc107` | 왕관(Crown) 형태 | normal, highlighted, matched |
| Pink Tile | collectible | 019 | Pink `#e91e63` | 다이아몬드 형태 | normal, highlighted, matched |

## 3. Booster Assets (P0)

| Asset Name | Category | Frames Seen | Visual Description | Creation Pattern |
|-----------|----------|-------------|-------------------|-----------------|
| TNT | collectible | 005 | 빨간 TNT 통 + 폭발 이펙트 | T/L형 5개 매치 |
| Rocket | collectible | 006 | 줄무늬 구 (빨+노) | 4개 직선 매치 |
| Light Ball | collectible | 007 | 무지개 구슬 (멀티컬러) | 5개 직선 매치 |
| Arrow Booster | collectible | 012 | 빨간 활 + 화살 | UI 부스터 (해금) |

## 4. Obstacle Assets (P0)

| Asset Name | Category | Frames Seen | Visual Description | HP |
|-----------|----------|-------------|-------------------|---|
| Wooden Box/Crate | obstacle | 021 | 나무 상자 (밝은 갈색) | 1-2 |
| Grass Tile | obstacle | 021 | 초록 잔디 패턴 | 1 |
| Mailbox | obstacle | 015 | 금색 우체통 (빨간 손잡이) | — (수집형) |
| Iron Box | obstacle | — | 철제 상자 추정 | 2-3 |
| Fire Extinguisher Item | collectible | 008 | 빨간 소화기 | — (수집형) |
| Key Item | collectible | 018 | 금색 열쇠 | — (수집형) |

## 5. UI Element Assets (P1)

| Asset Name | Category | Screen Position | Frames Seen | States | Interaction |
|-----------|----------|----------------|-------------|--------|------------|
| King Avatar Frame | icon | top-center | 015, 019-21 | normal, happy, worried | display-only |
| Target Panel | panel | top-left | 015, 017, 019-21 | — | display-only |
| Moves Counter | text-element | top-right | 015, 017, 019-21 | — | display-only |
| Booster Button (x5) | button | bottom-bar | 019-21 | locked, unlocked, active | tap |
| Settings Gear | button | bottom-right | 019-21 | normal | tap |
| Continue Button | button | center | 013 | normal, pressed | tap |
| Play Button | button | center-left | 014 | normal, pressed | tap |
| Skip Button | button | center-right | 014 | normal, pressed | tap |
| Close (X) Button | button | top-right | 003, 009-011, 014, 016, 018 | normal | tap |
| Coin Display | icon+text | top-bar | 011, 014, 022 | — | tap (shop) |
| Life/Heart Display | icon+text | top-bar | 022 | full, counting | tap |
| Star Display | icon+text | top-bar | 022 | — | display-only |
| Timer (Circular) | bar | left-of-progress | 008, 018 | counting down | display-only |
| Progress Bar | bar | center-top | 008, 016, 018 | filling | display-only |

## 6. Background & Environment Assets (P2)

| Asset Name | Category | Frames Seen | Layer | Animation |
|-----------|----------|-------------|-------|----------|
| Castle Exterior | background | 022, 023 | back | static (clouds animated) |
| Castle Garden | background | 019, 021 | back | static |
| Palace Interior | background | 020 | back | static |
| Kitchen Interior | background | 016 | back | static |
| Dungeon/Cave | background | 018 | back | static (fire flicker) |
| Checkered Floor | background | 015 | back | static |
| Sky Gradient | background | 019, 021, 022 | far-back | cloud scroll |
| Mountains | background | 019, 021 | far-back | static |

## 7. Navigation & Meta UI Assets (P1)

| Asset Name | Category | Frames Seen | Description |
|-----------|----------|-------------|-------------|
| Bottom Nav — Trophy Tab | icon | 002, 004, 022 | 금색 트로피 + 빨간 리본 |
| Bottom Nav — Cup Tab | icon | 002, 004, 022 | 금색 우승컵 |
| Bottom Nav — Castle Tab | icon | 002, 004, 022 | 보라+금 성 (홈) |
| Bottom Nav — Team Tab | icon | 002, 004, 022 | 보라 방패 + 발자국 |
| Bottom Nav — Cards Tab | icon | 002, 004, 022 | 금색 카드팩 |
| King's Nightmare Button | button | 022 | 초록 라운드 버튼 |
| Area Progress Button | button | 022 | Area n/6 + 보상 상자 |
| Castle Panel | panel | 011 | "Castle" — Area Progress bar + 과제 목록 |
| Well Done Panel | panel | 013 | 별 + 쿠션 + Continue |
| Unlock Panel | panel | 012 | "Unlocked!" + 아이템 + Claim |
| Nightmare Panel | panel | 014 | King 일러스트 + Play/Skip |
| Team Info Panel | panel | 009-010 | 팀 정보 + 멤버 리스트 |

## 8. Asset Priority Summary

### P0 — Core Gameplay (게임 불가 없이 불가)
- 5종 타일 (Red, Blue, Green, Yellow, Pink) — 각 ~48x48px
- 3종 부스터 (TNT, Rocket, Light Ball) — 각 ~48x48px
- 4+ 장애물 (Box, Grass, Mailbox, Key, Fire Extinguisher)
- 게임 보드 배경 (그리드 프레임)
- King 아바타

### P1 — Essential UI
- HUD (Target, Moves, Timer, Progress Bar)
- 5개 부스터 버튼
- 팝업 패널 (Win, Lose, Nightmare)
- Bottom Navigation 5탭
- Coin/Life/Star 아이콘

### P2 — Polish
- Castle 3D 뷰 및 정원
- 배경 환경 (실내/실외 6종)
- King 전신 캐릭터 일러스트
- Dragon, Companion 캐릭터
- 구름 애니메이션

### P3 — Nice-to-have
- Team UI 전체
- 레벨 시작 나팔/불꽃놀이
- 코인 드롭 이펙트

**Total unique assets identified: ~65+**
