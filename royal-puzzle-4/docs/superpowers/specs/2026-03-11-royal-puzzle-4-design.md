# Royal Puzzle 4 — Design Spec

## Context

Royal Puzzle 시리즈 4탄. Royal Match를 충실히 재현하는 Match-3 + Castle Decoration 게임.

- **엔진**: Godot 4 (GDScript), Web export (HTML5)
- **배포**: Vercel (`game-arcade/royal-puzzle-4/export/`)
- **레퍼런스**: `game-spec-royal-match-2026-03-11/` (영상 분석 스펙)
- **코드베이스**: 클린 스타트 (Royal Puzzle 3 참조만, 새로 작성)

## Decisions

| 결정 | 선택 | 근거 |
|------|------|------|
| 방향 | Royal Match 1:1 클론 | 검증된 루프, 상세 레퍼런스 보유 |
| 코드 | 클린 스타트 | 깔끔한 아키텍처, 3탄 설계만 참조 |
| 범위 | Full Package | Core + Nightmare + Castle + 부스터 합체 |
| 레벨 | 30레벨 + 에어리어 1개 | 1사이클 체험 가능한 최소 규모 |
| 경제 | 라이프 + 코인 (실결제 없음) | 세션 조절 + 게임 내 경제 루프 |
| 테마 | Royal Match 그대로 (King/Castle) | 시리즈 독자 테마 대신 레퍼런스 충실 재현 |

## Architecture

### Scene Flow
```
Splash → Home (Castle) → Game (Match-3) → Result
                       → Nightmare → Result
```

### Autoload (Global Singletons)
| Autoload | 역할 |
|----------|------|
| `GameEvents` | Signal 이벤트 버스 — 모든 씬 간 느슨한 결합 |
| `GameState` | 전역 상태 (현재 레벨, 코인, 라이프, Castle 진행) |
| `SaveManager` | localStorage/FileAccess 저장/로드 |

### Core Module (scripts/core/)
| 파일 | 역할 |
|------|------|
| `board.gd` | 8x8 보드 관리, 타일 생성/낙하/셔플, 비정형 보드 지원 |
| `tile.gd` | 타일 데이터 (타입, 색상, 위치, 상태) |
| `match_detector.gd` | 3+ 매치 탐지 (수평/수직/T/L/십자) |
| `booster.gd` | 부스터 3종 생성/활성화 (Rocket/TNT/Light Ball) + Missile |
| `booster_merger.gd` | 부스터 합체 10종 판정 및 실행 |
| `obstacle.gd` | 장애물 6종 (Box/Stone/Grass/Fence/Chain/Mailbox) |
| `level_data.gd` | 레벨 정의 Resource (목표, Moves, 보드 형태, 장애물 배치) |

### UI Module (scripts/ui/)
| 파일 | 역할 |
|------|------|
| `hud.gd` | 게임 중 HUD (Target, Moves, King 아바타) |
| `popup_manager.gd` | 팝업 (Win/Lose/Nightmare/Booster Unlock) |
| `bottom_nav.gd` | 홈 화면 하단 네비게이션 |

### Meta Module (scripts/meta/)
| 파일 | 역할 |
|------|------|
| `castle_manager.gd` | Castle 데코 에어리어/과제 관리 |
| `nightmare_manager.gd` | King's Nightmare 시나리오 관리 |
| `life_manager.gd` | 라이프 5개, 30분 회복, 코인 충전 |
| `coin_manager.gd` | 코인 획득/소비 로직 |
| `daily_bonus.gd` | 7일 연속 로그인 보너스 |

## Data Model

### Save Data (localStorage)
```json
{
  "current_level": 1,
  "coins": 0,
  "lives": 5,
  "lives_recovery_timestamp": 0,
  "stars": 0,
  "castle_tasks_completed": [],
  "daily_bonus_day": 0,
  "daily_bonus_last_claim": "",
  "unlocked_boosters": [],
  "nightmare_completed": [],
  "settings": { "sfx": true, "bgm": true }
}
```

### Level Resource (.tres)
```
level_number: int
board_width: int (default 8)
board_height: int (default 8)
board_mask: Array[Array[bool]]  # 비정형 보드용
moves: int
targets: Array[{type: String, count: int}]
obstacles: Array[{type: String, position: Vector2i, hp: int}]
tile_types: int (4 or 5)
nightmare_after: bool
```

## Game Systems Summary

### Match-3 Core
- 5종 타일, 인접 스왑, 3+ 매치, 중력 낙하, 자동 셔플
- 부스터 4종: Rocket(4직선), TNT(T/L형5), Light Ball(5직선), Missile(2x2)
- 부스터 합체 10종 (상세: GDD Section 3)
- 장애물 6종, 레벨 목표 4유형 (수집/파괴/수집형/복합)

### King's Nightmare
- 5레벨마다 출현, 30-60초 시간 제한
- 6개 시나리오 (화재/드래곤/홍수/유령/감옥/보스)
- Skip 가능, 보상 50-100 코인

### Castle Decoration
- 에어리어 1 "Castle Garden", 과제 6개 (별 1-3개 소비)
- 과제 완료 시 시각적 변화 (분수/잔디/꽃/벤치/가로등/정문)
- 에어리어 완료 보상: 코인 500 + 부스터

### Economy
- 라이프: 5개, 실패 시 -1, 30분/개 회복, 100코인=1개
- 코인 획득: 클리어 20 + 여분Moves 5/개 + Nightmare 50-100 + 에어리어 500 + 데일리
- 코인 소비: 추가 Moves 100, 라이프 100, 시작 부스터 200, 셔플 50

## SIDC Validation

**Score: A (92/100)** — 전 단계 충족. Critical Violations 없음.

개선 필요:
1. Missile 도입 시점 레벨 20으로 확정
2. 코인 밸런스 시뮬레이션 (구현 중 검증)
3. 웹 초기 로딩 UX (프로그레스바 + 팁 화면)

## Success Criteria

1. 30레벨 플레이스루 가능 (시작 → 에어리어 1 완료)
2. King's Nightmare 6개 시나리오 동작
3. Castle 과제 6개 수행 시 시각적 변화
4. 라이프/코인 경제가 30레벨 동안 파탄 없이 순환
5. Vercel 배포 후 모바일 브라우저에서 플레이 가능

## References

- [GDD (상세)](../GDD.md)
- [Royal Match 레퍼런스 스펙](../../game-spec-royal-match-2026-03-11/index.md)
- [에셋 카탈로그](../../game-spec-royal-match-2026-03-11/assets/asset-catalog.md)
- [이펙트 카탈로그](../../game-spec-royal-match-2026-03-11/effects/effects-catalog.md)
- [SIDC 리텐션 루프](../../game-spec-royal-match-2026-03-11/sidc/retention-loop.md)
