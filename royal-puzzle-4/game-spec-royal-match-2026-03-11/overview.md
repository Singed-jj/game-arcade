# Royal Match — Game Overview

> Part of [Royal Match Reproduction Spec](./index.md)

## 1. Game Overview

| Item | Detail |
|------|--------|
| Primary Genre | Puzzle (Match-3) |
| Sub-genre | Castle decoration, Casual |
| Platform | Mobile (iOS/Android), Portrait |
| Target Audience | Casual gamers, 25-45세, 여성 비중 높음 |
| Similar Games | Candy Crush Saga, Homescapes, Gardenscapes, Toon Blast |

## 2. Core Mechanics

### Game Loop
1. **홈 화면**: Castle 뷰 → Area Progress 확인 → 레벨 선택
2. **게임 플레이**: 목표 확인 → Match-3 스왑 → 부스터 생성/사용 → 장애물 파괴
3. **클리어**: 별 획득 → Castle 과제 수행 (별 소비) → 에어리어 진행
4. **특수 모드**: King's Nightmare (시간 제한, 보상 +50 코인)

### Controls
- **Primary**: 터치 스왑 — 인접 타일을 드래그하여 교환
- **Secondary**: 탭 — 부스터 활성화, UI 버튼 조작
- **부스터 버튼**: 하단 5개 원형 버튼 (잠금/해금)

### Win/Lose Conditions
- **Win**: 제한된 Moves 내에 Target 목표 달성 (타일 수집, 장애물 제거)
- **Lose**: Moves 소진 시 실패
- **Nightmare Win**: 시간 내 목표 수량 달성 (00:29~01:00)

### Rules & Systems

**타일 5종**: Red(정사각형), Blue(방패), Green(나뭇잎), Yellow(왕관), Pink(다이아몬드)

**부스터 생성 규칙**:
| 매치 패턴 | 부스터 | 효과 |
|----------|--------|------|
| T/L형 5개 | TNT | 3x3 범위 폭발 |
| 직선 4개 | Rocket | 행 또는 열 전체 클리어 |
| 직선 5개 | Light Ball | 같은 색 전체 제거 |

**장애물 종류**: Box/Crate (HP 1-2), Grass, Mailbox (수집형), Fire Extinguisher (수집형), Key (수집형)

## 3. Visual Design

### Art Style
Cartoon/3D-rendered 스타일. AAA 모바일 품질. 중세 판타지 테마. 둥근 모서리, 밝고 풍부한 색감. King 캐릭터가 마스코트 (보라 로브, 왕관, 큰 수염).

### Color Palette
| Role | Color | Hex |
|------|-------|-----|
| Primary | Royal Blue | #1a3a8a |
| Secondary | Gold | #f0a830 |
| Accent (Button) | Green | #4caf50 |
| Accent (Alert) | Red | #e53935 |
| Background (Sky) | Sky Blue | #87ceeb |
| Background (Dark) | Navy | #0d1b3e |

**타일 색상**: Red #d32f2f, Blue #1976d2, Green #388e3c, Yellow #ffc107, Pink #e91e63

## 4. UI/UX Structure

### Screen Layout
- **Portrait 전용** (9:16)
- 게임 영역 ~65-70%, UI 영역 ~30-35%

### HUD Elements
**일반 모드**:
- 상단 좌: Target (목표 아이콘 + 수량)
- 상단 중: King 아바타 (원형)
- 상단 우: Moves (남은 이동 수)
- 하단: 부스터 버튼 5개 + 설정 기어

**Nightmare 모드**:
- 상단: 시나리오 씬 (왕 위기 상황)
- 중단: 타이머 + 진행바 (n/n) + 특수 아이템
- 하단: 게임 보드

**홈 화면**:
- 상단 바: 코인 | 레벨 | 라이프 | 별 | 설정
- 중앙: 3D Castle 뷰
- 하단: King's Nightmare + Area Progress
- 최하단: 5탭 네비게이션

### Navigation Flow
```
Splash → Home (Castle) → Level Select (자동) → Gameplay → Result
                       → King's Nightmare → Nightmare Gameplay → Result
                       → Teams (Join/Search/Create)
                       → Castle Panel (Area Progress)
```

## 5. Progression & Monetization

### Progression System
- **레벨 진행**: Level 1, 2, 3... (순차적)
- **에어리어**: Area 1 (6개 과제) → Area 2 → ... 에어리어 클리어 시 Castle 변화
- **별 시스템**: 레벨 클리어 → 별 1개 → Castle 과제에 별 소비 (Do It ⭐2)
- **부스터 해금**: 진행에 따라 Arrow 등 UI 부스터 해금

### Monetization Model
- **F2P** + 듀얼 화폐 (Coins + Stars)
- **라이프 시스템**: "Full" 표시 — 에너지 제한, 시간 또는 IAP로 충전
- **UI 부스터**: 잠금 해제/구매 필요
- **Nightmare 보상**: +50 코인으로 추가 수익 경로
- **추정 IAP**: 추가 Moves 구매, 라이프 리필, 부스터 팩

### Meta Systems
- **Castle Decoration**: 별로 에어리어 과제 수행 (Plant the bushes 등)
- **Team**: Join/Search/Create, 팀 스코어, 50명 정원, 활동도
- **King's Nightmare**: 특수 시간 제한 이벤트 모드
- **Bottom Navigation**: 리더보드, 상점, 홈, 팀, 카드 (5탭)

## 6. Comparable Games

| Game | Genre | Similarity | Key Difference |
|------|-------|-----------|----------------|
| Candy Crush Saga | Match-3 | 핵심 매칭 메커니즘, 이동 수 제한 | Royal Match는 Castle 메타루프 추가 |
| Homescapes | Match-3 + Decoration | 장식 메타루프 | Royal Match는 King 캐릭터 중심 |
| Toon Blast | Match-3 (Tap) | 유사 부스터, 팀 시스템 | Royal Match는 스왑 기반 (탭 X) |

### Competitive Positioning
Royal Match의 차별점은 King 캐릭터를 중심으로 한 스토리텔링과 Castle 데코레이션 메타루프의 조합. King's Nightmare 모드가 일반 Match-3에서 벗어난 시간 제한 챌린지로 게임플레이 다양성 제공.

## 7. Consensus & Disagreements

### Consensus (Claude + Codex 합의)
- **장르**: 양쪽 모두 Match-3 Casual Puzzle + Team/Social meta 확인
- **부스터 시스템**: T형→TNT, 4직선→Rocket, 5직선→Light Ball 동일하게 식별
- **UI 스타일**: Cartoon/casual, cool blue + warm gold accent, portrait mobile
- **타이포그래피**: 둥근 볼드 카툰체 + 외곽선/그림자, 높은 가독성
- **아이콘**: Glossy, 둥근 사각형 프레임 + 금색 테두리
- **세션 길이**: 2-5분/레벨 추정 일치

### Disagreements
- **아트 품질 등급**: Claude는 "AAA 모바일", Codex는 "High-polish midcore/casual"로 평가. Castle 3D 렌더링(frame-022, 023)은 AAA급이지만, UI는 casual 수준 → 중간 평가 "High-quality casual" 채택
- **색상 추정**: 미세한 hex 값 차이. Claude `#1a3a8a`, Codex `#0B2F8F` 등. 큰 차이 없음 — 구현 시 실제 에셋 기반으로 조정
- **분석 범위**: Codex는 frame 1-7만 접근 (CLI 한계), Claude는 23개 전체 분석. 게임플레이 보드, Castle 뷰, Nightmare 모드 등 핵심 콘텐츠는 Claude 분석에만 포함
