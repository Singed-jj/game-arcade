# Royal Puzzle 4 - Game Design Document

## 1. Overview
- **장르**: Match-3 Puzzle + Castle Decoration
- **핵심 컨셉**: Royal Match 스타일 Match-3 게임. 타일 스왑으로 목표를 달성하고, 별을 모아 Castle을 꾸미는 메타루프.
- **타겟 플랫폼**: Web (HTML5, Vercel 배포)
- **세션 길이**: 2-5분/레벨
- **수익화 모델**: F2P (실결제 없음) — 라이프 시스템 + 코인 경제
- **엔진**: Godot 4 (GDScript)
- **레퍼런스**: Royal Match (game-spec-royal-match-2026-03-11)

## 2. START — 첫 유저 경험

### 첫 화면
- 앱 시작 → 스플래시 (로고, 1초) → Castle 홈 화면
- Castle 3D뷰 + King 캐릭터가 환영
- 상단 HUD: 코인 | 레벨 | 라이프 | 별 | 설정

### 5초 내 시각적 흥미
- 화려한 Castle 비주얼 + 밝은 색감
- King 캐릭터 애니메이션 (환영 제스처)
- "Tap to Play" 또는 자동 레벨 1 진입

### 30초 내 첫 성공 경험
- 레벨 1: 28 Moves, 단일 목표 (타일 15개 수집)
- 튜토리얼 가이드 (손가락 힌트로 스왑 유도)
- 거의 실패 불가한 난이도 → "Well Done!" 별 보상

### Zero Friction Entry
- 터치 2회로 게임 시작 (홈 → 레벨 자동 진입)
- 회원가입/로그인 없음
- 튜토리얼 스킵 불가 (1-3레벨이 튜토리얼)

## 3. IMMERSION — 핵심 게임플레이

### 코어 루프
```
레벨 선택 → 목표 확인 → Match-3 플레이 → 클리어/실패
    ↓                                        ↓
Castle 과제 ← 별 획득 ←──────────── 클리어 시
```

### 보드 시스템
- **보드 크기**: 8x8 (기본), 비정형 보드 (레벨별 변형)
- **타일 5종**:
  | 타일 | 색상 | 형태 | Hex |
  |------|------|------|-----|
  | Red | 빨강 | 둥근 정사각형 | #d32f2f |
  | Blue | 파랑 | 방패 | #1976d2 |
  | Green | 초록 | 나뭇잎 | #388e3c |
  | Yellow | 금색 | 왕관 | #ffc107 |
  | Pink | 분홍 | 다이아몬드 | #e91e63 |

### 매칭 규칙
- 인접 타일 스왑으로 3개 이상 동일 타일 정렬
- 매칭 시 타일 제거 → 상단에서 새 타일 낙하 → 연쇄 매칭 가능
- 매칭 불가 시 자동 셔플

### 부스터 시스템 (3종 기본)

| 부스터 | 생성 조건 | 효과 |
|--------|----------|------|
| Rocket | 4개 직선 매치 | 생성된 방향(H/V)의 행 또는 열 전체 클리어 |
| TNT | T/L형 5개 매치 | 3x3 범위 폭발 |
| Light Ball | 5개 직선 매치 | 스왑한 타일과 같은 색 전체 제거 |

### 부스터 합체 (10종)

| 조합 | 결과 | 효과 |
|------|------|------|
| Rocket + Rocket | Cross | 십자형 (행+열 동시) 클리어 |
| Rocket + TNT | Big Rocket | 3행 또는 3열 클리어 |
| Rocket + Light Ball | Color Rocket | 가장 많은 색 타일을 모두 Rocket으로 변환 후 활성화 |
| TNT + TNT | Mega Explosion | 5x5 범위 폭발 |
| TNT + Light Ball | Color TNT | 가장 많은 색 타일을 모두 TNT로 변환 후 활성화 |
| Light Ball + Light Ball | All Board | 보드 전체 클리어 |
| Missile + Missile | Triple Missile | 3개 미사일 동시 발사 |
| Missile + Rocket | Missile Rocket | 미사일 경로 + 도착점에서 행/열 클리어 |
| Missile + TNT | Missile TNT | 미사일 경로 + 도착점에서 3x3 폭발 |
| Missile + Light Ball | Color Missile | 가장 많은 색 타일을 모두 Missile로 변환 후 활성화 |

> **참고**: Missile은 2x2 매치로 생성. 랜덤 타일/장애물을 추적하여 파괴.

### 장애물 시스템 (6종)

| 장애물 | HP | 파괴 방법 | 도입 레벨 |
|--------|---|----------|----------|
| Wooden Box | 1 | 인접 매치 1회 | 5 |
| Stone Box | 2 | 인접 매치 2회 | 10 |
| Grass | 1 | 위에서 매치 | 8 |
| Fence | 1 | 인접 매치 (타일 이동 차단) | 12 |
| Chain | 1 | 인접 매치 (타일 고정) | 15 |
| Mailbox | — | 인접 매치로 우편 수집 (수집형) | 3 |

### 레벨 목표 유형
- **수집**: 특정 타일 N개 매칭 (예: Red 20개)
- **장애물 제거**: 장애물 N개 파괴 (예: Box 10개)
- **수집형 아이템**: Mailbox에서 우편 수집 (예: Mail 50개)
- **복합**: 위 목표 2-3개 동시 달성

### 난이도 곡선
- **레벨 1-5**: Moves 25-28, 단일 목표, 장애물 없음 → Tutorial
- **레벨 6-10**: Moves 20-25, 장애물 도입 (Box, Mailbox), 단일 목표
- **레벨 11-20**: Moves 15-20, 다중 목표, 복합 장애물
- **레벨 21-30**: Moves 10-18, 비정형 보드, 3종 장애물 복합, 전략적 부스터 사용 필수

### 피드백 시스템
- **매치 시**: 타일 색상 파티클 버스트 + 팝 사운드
- **부스터 생성**: 별 모양 이펙트 + 강조 사운드
- **부스터 활성화**: 전용 VFX (폭발/광선/무지개) + 화면 흔들림
- **연쇄 매치**: "Great!", "Awesome!", "Incredible!" 텍스트 팝업
- **레벨 클리어**: 별 착지 애니메이션 + 불꽃놀이 + 팡파르

### 성취감 리듬
- 30초: 첫 매치 성공 → 타일 파괴 쾌감
- 60초: 첫 부스터 생성 → "내가 만들었다" 성취
- 90초: 부스터 활성화 → 대량 파괴 쾌감
- 120초: 목표 달성 → 별 보상

## 4. DESIRE — 열망 유발

### Castle 데코레이션 (메타루프)
- **에어리어 1**: "Castle Garden" — 과제 6개
  | # | 과제 | 별 비용 | 시각적 변화 |
  |---|------|---------|-----------|
  | 1 | 분수대 수리 | ⭐1 | 마른 분수 → 물 나오는 분수 |
  | 2 | 정원 잔디 심기 | ⭐2 | 황무지 → 초록 잔디 |
  | 3 | 꽃밭 조성 | ⭐2 | 빈 화단 → 꽃이 핀 화단 |
  | 4 | 벤치 배치 | ⭐1 | 빈 공간 → 벤치 |
  | 5 | 가로등 설치 | ⭐2 | 어두운 길 → 밝은 가로등 |
  | 6 | 정문 장식 | ⭐3 | 낡은 문 → 화려한 정문 |
- **에어리어 완료 시**: Castle 외관 변화 + 보상 상자 (코인 500 + 부스터 팩)

### Near-miss 설계
- 레벨 실패 시 "1 Move만 더 있었으면!" 메시지 + 추가 Moves 구매 제안 (코인 소비)
- 목표 90%+ 달성 후 실패 시 더 강한 아쉬움 연출

### 프리뷰/티저
- Castle 과제 미완성 항목이 흐릿하게 표시 → "별 2개만 더 모으면"
- 잠긴 부스터 버튼이 실루엣으로 표시 → 해금 기대감
- 다음 에어리어 미리보기 (실루엣)

### King's Nightmare (특수 모드)

5레벨마다 출현하는 시간 제한 보너스 스테이지.

| 요소 | 설명 |
|------|------|
| 출현 조건 | 레벨 5, 10, 15, 20, 25, 30 클리어 후 |
| 시간 제한 | 30초~60초 (회차별 감소) |
| 목표 | 타일 N개 매칭으로 위기 해결 |
| 보상 | 코인 50~100 |
| Skip 가능 | Play / Skip 선택 |

**시나리오 예시**:
1. 주방 화재 → 소화기 수집 (60초)
2. 드래곤 출현 → 열쇠 수집하여 왕 구출 (45초)
3. 홍수 → 모래주머니 수집 (40초)
4. 유령 성 → 횃불 수집 (35초)
5. 감옥 탈출 → 자물쇠 파괴 (30초)
6. 최종: 드래곤 보스 → 대량 타일 파괴 (30초)

## 5. CONVERSION — 수익화 + 복귀

### 라이프 시스템
- 최대 5개, 레벨 실패 시 1개 소모
- 회복: 30분당 1개 자동 회복
- 코인으로 즉시 충전: 100코인 = 라이프 1개

### 코인 경제

**획득 경로**:
| 경로 | 코인 |
|------|------|
| 레벨 클리어 (기본) | 20 |
| 레벨 클리어 (여분 Moves 보너스) | 5/Move |
| King's Nightmare 클리어 | 50-100 |
| 에어리어 완료 보상 | 500 |
| 데일리 보너스 (연속 로그인) | 10-50 |

**소비 경로**:
| 항목 | 코인 |
|------|------|
| 추가 Moves +5 | 100 |
| 라이프 즉시 충전 (1개) | 100 |
| 게임 시작 전 부스터 | 200 |
| 셔플 (게임 중) | 50 |

### 복귀 훅
- **데일리 보너스**: 연속 로그인 7일 보상 (10→20→30→40→50→코인+부스터→라이프풀충전)
- **미완성 Castle 과제**: "분수대가 기다리고 있어요!" 형태의 복귀 동기
- **King's Nightmare 알림**: "왕이 위험해요!" (게임 내 배너)

### CONVERSION → IMMERSION 복귀
- 코인으로 추가 Moves 구매 → 즉시 게임 재개 (화면 전환 없음)
- 라이프 충전 → 즉시 다음 레벨 진입
- 부스터 구매 → 레벨 시작 화면에서 바로 활성화

## 6. Loop Integrity

### 4단계 전환 흐름도
```
START ──────────────────────────────────────────────────────────── IMMERSION
  │ 스플래시 → Castle 홈 → 레벨 진입                                  │
  │ (터치 2회, 5초)                                                   │
  │                                                                    │
  │                    Match-3 플레이 ← 부스터 콤보 쾌감              │
  │                    연쇄 매치 → 대량 파괴 → "Awesome!"              │
  │                    Nightmare 모드 → 시간 제한 긴장감               │
  │                                                                    │
  │                                                          DESIRE ◄──┘
  │                                                            │
  │                    Castle 과제 미완 → "별 1개만 더"         │
  │                    잠긴 부스터 → 해금 기대                  │
  │                    Nightmare Skip → 보상 유혹               │
  │                                                            │
  └─── CONVERSION ◄────────────────────────────────────────────┘
         │
         │ 라이프 소진 → 코인 충전 또는 30분 대기
         │ 추가 Moves → 코인 소비
         │ 데일리 보너스 → 복귀 동기
         │
         └──────────── 즉시 IMMERSION 복귀 ──────────────────►
```

### CONVERSION → IMMERSION 복귀 경로 상세
1. **라이프 회복 후**: Castle 홈 → 다음 레벨 자동 제안 → 1탭으로 진입
2. **추가 Moves 구매**: 실패 팝업에서 바로 구매 → 게임 즉시 재개 (씬 전환 없음)
3. **데일리 보너스 수령**: 홈 진입 → 보너스 팝업 → Claim → Castle 홈 (레벨 진입 유도)

## 7. Technical Spec

### 프로젝트 구조 (Godot 4)
```
royal-puzzle-4/
├── project.godot
├── docs/
│   └── GDD.md
├── game-spec-royal-match-2026-03-11/   # 레퍼런스 스펙
├── export/
│   └── vercel.json                      # COOP/COEP 헤더
├── scripts/
│   ├── autoload/
│   │   ├── game_events.gd              # Signal 이벤트 버스
│   │   ├── game_state.gd               # 전역 상태 (레벨, 코인, 라이프)
│   │   └── save_manager.gd             # localStorage 저장
│   ├── core/
│   │   ├── board.gd                    # 보드 로직 (8x8, 비정형)
│   │   ├── tile.gd                     # 타일 데이터
│   │   ├── match_detector.gd           # 매치 판정
│   │   ├── booster.gd                  # 부스터 생성/활성화
│   │   ├── booster_merger.gd           # 부스터 합체 10종
│   │   ├── obstacle.gd                 # 장애물 시스템
│   │   └── level_data.gd              # 레벨 목표/보드 정의
│   ├── ui/
│   │   ├── hud.gd                      # HUD (Target, Moves, King)
│   │   ├── popup_manager.gd            # 팝업 (Win/Lose/Nightmare)
│   │   └── bottom_nav.gd              # 하단 네비게이션
│   └── meta/
│       ├── castle_manager.gd           # Castle 데코 관리
│       ├── nightmare_manager.gd        # King's Nightmare 관리
│       ├── life_manager.gd             # 라이프 시스템
│       ├── coin_manager.gd             # 코인 경제
│       └── daily_bonus.gd             # 데일리 보너스
├── scenes/
│   ├── main.tscn                       # 메인 씬 (씬 전환 관리)
│   ├── splash.tscn                     # 스플래시
│   ├── home.tscn                       # Castle 홈
│   ├── game.tscn                       # Match-3 게임 보드
│   ├── nightmare.tscn                  # Nightmare 모드
│   └── components/
│       ├── tile.tscn                   # 타일 씬
│       ├── booster.tscn               # 부스터 씬
│       └── obstacle.tscn             # 장애물 씬
├── resources/
│   ├── levels/                         # 레벨 데이터 (.tres)
│   │   ├── level_001.tres
│   │   └── ...level_030.tres
│   ├── nightmares/                     # Nightmare 시나리오
│   └── castle/                         # Castle 데코 데이터
├── assets/
│   ├── sprites/                        # 타일, 부스터, 장애물, UI
│   ├── backgrounds/                    # 배경 이미지
│   ├── characters/                     # King, Dragon 등
│   ├── effects/                        # 파티클 텍스처
│   └── audio/                         # SFX, BGM
└── tests/                             # GUT 테스트
```

### 저장 시스템
- Web: `JavaScriptBridge.eval()` → localStorage
- Native fallback: `user://save.json`
- 저장 데이터: 현재 레벨, 코인, 라이프(+회복 타임스탬프), Castle 진행, 데일리 보너스 상태

### 해상도
- 기본: 720x1280 (Portrait)
- 스케일: `canvas_items` stretch mode, `keep_height` aspect

## 8. Art Direction

### 스타일 가이드
- **레퍼런스**: Royal Match (game-spec manifest.json 참조)
- **색조**: Royal Blue (#1a3a8a) + Gold (#f0a830) 기본
- **타일**: 둥근 모서리, 입체감 있는 3D-like 2D
- **UI**: 금색 테두리 + 파란 배경 패널, 둥근 볼드 카툰 폰트
- **캐릭터**: King — 보라 로브, 왕관, 큰 수염, 친근한 표정

### 에셋 우선순위
레퍼런스: `game-spec-royal-match-2026-03-11/assets/asset-catalog.md`

1. **P0**: 타일 5종, 부스터 4종, 장애물 6종, King 아바타, 보드 프레임
2. **P1**: HUD, 버튼, 패널, 네비게이션 아이콘
3. **P2**: 배경 (Castle, 정원, 궁전), 장식
4. **P3**: Nightmare 일러스트, Dragon, 팬파어
