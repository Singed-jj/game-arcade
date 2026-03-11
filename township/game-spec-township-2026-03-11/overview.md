# Township — Game Overview

> Part of [Township Reproduction Spec](./index.md)

## 1. Game Overview

| Item | Detail |
|------|--------|
| Primary Genre | Simulation / City Builder |
| Sub-genre | Farm Management, Production Chain, Match-3 Puzzle (minigame) |
| Platform | Mobile (iOS/Android), Landscape |
| Target Audience | Casual gamers, 25-45 age, predominantly female |
| Similar Games | Hay Day (Supercell), SimCity BuildIt, Gardenscapes (Playrix) |

## 2. Core Mechanics

### Game Loop
```
Farm Crops → Process in Factory → Fulfill Orders (Helicopter/Airport) → Earn Coins/XP → Level Up → Unlock Buildings → Expand Town
```

Secondary loop: Play Match-3 → Earn Stars → Clear Fog → Unlock Town Areas

### Controls
- **Touch-based**: Tap buildings to interact, pinch-to-zoom, swipe to pan isometric view
- **Match-3**: Tap/swipe to match colored blocks
- **Bottom navigation bar**: 5 main buttons (trophy, quests, cards, helicopter, construction)

### Win/Lose Conditions
- **Match-3**: Complete goals within move limit (e.g., "Moves 12" with 4 objectives)
- **Town**: No fail state — progression-driven management
- **Events**: Timed completion (14H-17D durations)

### Rules & Systems
1. **Production Chain**: Farms grow crops → Factories process into goods → Orders consume goods for coins/XP
2. **Star Gating**: Stars from match-3 levels required to unlock town expansion areas
3. **Storage Management**: Barn has capacity limit (12973/14020 at late game)
4. **Multi-currency**: Coins (soft), T-Cash (premium), event tokens
5. **Timer-based**: Factory production, airport orders, event deadlines
6. **Mining**: Underground exploration for resources

## 3. Visual Design

### Art Style
Cartoon/cel-shaded isometric with high-quality 3D-rendered assets. Playrix AAA mobile production quality. Friendly, warm, rounded design language. Semi-realistic cartoon characters with exaggerated proportions.

### Color Palette
| Role | Color | Hex |
|------|-------|-----|
| Primary (nature) | Green | #4CAF50 |
| Primary (sky/water) | Blue | #2196F3 |
| Reward/highlight | Gold/Yellow | #FFC107 |
| Premium/urgency | Orange/Red | #FF5722 |
| Background (grass) | Light Green | #8BC34A |
| Background (water) | Deep Blue | #1565C0 |

## 4. UI/UX Structure

### Screen Layout
- **Landscape orientation**, ~16:9 to 21:9 aspect ratio
- **Game area**: ~70% of screen (isometric town view)
- **UI area**: ~30% (HUD + bottom bar + side buttons)
- **Modal overlays**: Center-screen popups with dark backdrop for buildings, events, orders

### HUD Elements
- **Top-left**: Player level badge (circular gold frame) + XP bar
- **Top-center**: Coin counter, product request bubbles floating over buildings
- **Top-right**: T-Cash counter, barn capacity, settings menu
- **Left side**: Event timer stack (up to 4 concurrent events)
- **Right side**: Quick access (store, map, event shortcuts)
- **Bottom bar**: 5 primary navigation icons

### Navigation Flow
```
Main Town View (hub)
├── Match-3 Puzzle (star progression)
├── Factory Modal (production management)
├── Helicopter Pad (order fulfillment)
├── Airport (timed shipments + leaderboard)
├── Knight Pass (battle pass rewards)
├── Mining (underground exploration)
├── Team/Co-op (chat + regattas)
└── Story Quests (narrative scenes)
```

## 5. Progression & Monetization

### Progression System
- **Player Level**: 160+ levels observed (extremely deep progression)
- **Star System**: Stars from match-3 gate town expansion (14/100 visible)
- **Building Unlocks**: New factories, community buildings at level milestones
- **Town Expansion**: Clear fog/clouds to reveal new areas + coastal/island zones
- **Production Chain Growth**: Simple crops → complex multi-ingredient products

### Monetization Model
- **F2P + IAP**: Free-to-play with premium currency (T-Cash)
- **Battle Pass**: Knight Pass (free + premium track, 17-day cycle, 20 tiers)
- **Gacha/Cards**: Town Cards collection system with star ratings
- **Speed-ups**: Skip production/shipping timers with T-Cash
- **Expansion**: Buy factory slots (12 T-Cash), barn storage expansion
- **Starter Packs**: Likely first-purchase incentives (not visible in late-game)

### Meta Systems
- **Team/Co-op**: Join teams (up to 46 members), team chat, request help
- **Regattas**: Competitive boat racing events between teams (leaderboard)
- **Card Collection**: Town Cards (gacha packs, star-rated cards like "Candy Apples", "Snowboard")
- **Events**: Knight Pass, Mayor's Week (multi-goal challenges), seasonal events
- **Story Quests**: Character-driven narrative (Rachel + dog, forest exploration)

## 6. Comparable Games

| Game | Genre | Similarity | Key Difference |
|------|-------|-----------|----------------|
| Hay Day | Farm Sim | Production chain + order fulfillment | No match-3 minigame, more farm-focused |
| Gardenscapes | Match-3 + Builder | Match-3 gates building progression | Garden decoration, not full city management |
| SimCity BuildIt | City Builder | Isometric town building | No farming/production chain, more urban planning |

### Competitive Positioning
Township uniquely combines city building + farming + match-3 puzzle into one cohesive experience. The match-3 minigame provides active engagement between passive timer-based management, keeping players in-app longer. Deep social features (regattas) and the battle pass system drive retention and monetization.

## 7. Consensus & Disagreements

### Consensus (Claude + Codex 일치)
- **Battle Pass 중심 라이브 옵스**: Knight Pass가 핵심 수익화 + 리텐션 시스템 (양쪽 모두 강조)
- **카드 컬렉션/가차 시스템**: Town Cards가 메타 진행의 주요 요소
- **강력한 셀레브레이션 피드백**: "Well Done!", 컨페티, 별 애니메이션 등 보상 연출
- **다중 타이머 기반 복귀 유도**: 동시 이벤트 카운트다운으로 일일 접속 유도
- **Landscape 모바일**: 16:9 가로 모드, 터치 기반 인터랙션
- **카툰/광택 아트 스타일**: 따뜻한 색감, 글로시 UI, 둥근 아이콘 언어
- **F2P + Premium Pass 구조**: 무료 트랙 + 프리미엄 트랙 이중 보상

### Disagreements
| 항목 | Claude (Primary) | Codex (Secondary) | 판정 |
|------|-----------------|-------------------|------|
| 장르 분류 | City Builder + Farm + Match-3 | Casual progression / Event-heavy economy | **Claude 우세** — frame 14, 17, 20-22에서 도시 건설, 농장, 매치3 직접 확인 |
| 유사 게임 | Hay Day, SimCity BuildIt, Gardenscapes | Coin Master, Monopoly GO!, Royal Match | **Claude 우세** — Playrix 게임 계열(Gardenscapes)이 정확. Codex는 메타 화면만 보고 판단 |
| 코어 루프 | 생산 체인 (농장→공장→주문) | 별/토큰 수집 → 패스 진행 | **Claude 우세** — Codex는 코어 게임플레이 프레임(17, 14, 16)을 충분히 분석하지 못함 |
| 모터 스킬 | 낮음-중간 (전략적 매치3) | 탭 기반 UI 네비게이션 | **병합** — 메타 관리는 탭, 매치3는 전략적 판단 필요 |

> Note: Codex는 초기 프레임(F1-F7)에 집중하여 메타/보상 시스템을 상세히 분석했으나, 후반 프레임의 실제 게임플레이(도시 건설, 매치3, 생산 체인)를 충분히 반영하지 못함. Claude의 전체 22프레임 분석이 더 포괄적임.
