# Game Design Analysis — Royal Match

## 1. Genre Classification
- **Primary genre**: Puzzle (Match-3)
- **Sub-genres**: Castle decoration/renovation, Casual
- **Similar games**: Candy Crush Saga, Homescapes, Gardenscapes, Toon Blast
- Developer: Dream Games (frame-001 splash)

## 2. Core Game Mechanics

### Primary Mechanic: Match-3 Swap
- 8x8~9x9 격자 보드에서 인접 타일을 스왑하여 3개 이상 매칭 (frames 15, 17, 19-21)
- **타일 타입 5종**: Red(정사각형), Blue(방패), Green(나뭇잎), Yellow(왕관), Pink(다이아몬드) (frame-20)

### Secondary Mechanics
- **부스터 생성**:
  - **TNT**: T/L 형태 5개 매치 → 3x3 폭발 (frame-005)
  - **Rocket**: 4개 직선 매치 → 행/열 클리어 (frame-006)
  - **Light Ball**: 5개 직선 매치 → 같은 색 전체 제거 (frame-007)
- **장애물 시스템**:
  - **Box/Crate**: 인접 매치로 파괴 (frame-21, Target에 박스 아이콘)
  - **Grass**: 매칭으로 잔디 제거 (frame-21, Target에 잔디 아이콘)
  - **Mailbox**: 인접 매칭으로 우편물 수집 (frame-015 "Make matches next to a MAILBOX to collect MAILS!")

### Win/Lose Conditions
- **Win**: 제한된 이동 수 내에 목표 달성 (타일/장애물 수집)
- **Lose**: 이동 수 소진 (Moves: 4~28, frames 15, 17, 19-21)

### Special Modes
- **King's Nightmare**: 시간 제한 모드 (frame-014). 왕이 악몽에서 빠져나오는 설정. 보상 +50 코인
  - 화재 진압 (frame-008: 소화기, 00:32 타이머, 65/65 목표)
  - 드래곤으로부터 왕 구출 (frame-018: 00:29, 66/72, 열쇠 수집)
  - 박스 전부 파괴 (frame-016: 01:00, 0/65 목표)

## 3. Control Scheme
- **Primary**: 터치 스왑 (인접 타일 드래그)
- **Secondary**: 탭 (부스터 사용, UI 버튼)
- **UI 부스터**: 하단 5개 원형 버튼 — 대부분 잠금 상태 (frames 19-21)
  - Arrow: "Clears all the objects in a row!" (frame-012 해금 화면)

## 4. Game Loop
- **Core Loop**: 레벨 선택 → 목표 확인 → Match-3 플레이 → 클리어 → 별 획득 → 캐슬 꾸미기
- **Session length**: 2-5분/레벨 (이동 수 11~28)
- **Meta Loop**: 별 수집 → Castle Area Progress (frame-011: 3/6) → 에어리어 완료 → 새 에어리어 해금

## 5. Difficulty & Progression
- **레벨 기반 진행**: Level 6 클리어 확인 (frame-013)
- **에어리어 시스템**: Area 1 (4/6) → 점진적 해금 (frame-022)
- **난이도 조절**:
  - 이동 수 감소: 28 → 21 → 18 → 11 → 4 (frames 15, 19, 21, 20, 17)
  - 목표 복잡도 증가: 단일 장애물 → 다중 장애물
  - 보드 형태 변화: 정사각형 → 불규칙(빈 공간) (frame-019: 중앙 사각 공백, frame-020: 비정형 보드)
- **해금 시스템**: 부스터 해금 (Arrow x3, frame-012)

## 6. Monetization Model
- **F2P 모델**
- **듀얼 화폐**:
  - Coins: 2179~3068 (frames 011, 014, 022) — soft currency
  - Stars: 0~2 (frames 011, 022) — 캐슬 꾸미기 화폐
- **라이브 시스템**: "Full" 표시 — 에너지/라이프 제한 (frame-022: "5 Full")
- **King's Nightmare**: 보상 +50 코인 (frame-014) — 추가 수익 기회
- **UI 부스터**: 잠금 해제 필요 (frames 19-21) — IAP/진행 해금 가능성

## 7. Meta Systems
- **Team/Social**: Team 시스템 (frames 002-004, 009-010)
  - Join/Search/Create 탭
  - Team Score, Activity, Capacity (33/50)
  - 팀원 레벨 표시 (996, 977, 545, 374)
- **Castle Decoration**: Area Progress 기반 꾸미기 (frame-011: "Plant the bushes" — Do It ⭐2)
- **King's Nightmare**: 특수 이벤트 모드 (frame-014)
- **Bottom Navigation**: 5개 탭 — 리더보드(트로피), 상점(트로피+), 성(홈), 팀(방패), 카드(frame-002, 022)
