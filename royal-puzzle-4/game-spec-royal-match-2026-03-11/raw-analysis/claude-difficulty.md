# Difficulty Curve & Progression Analysis — Royal Match

## 참고
fps 0.5 추출(2초 간격). 30분 영상에서 23개 고유 프레임. 레벨 번호와 목표/이동 수로 난이도 추론.

## 1. Difficulty Progression Table

| Stage | Level | Moves | Target | Board Shape | New Mechanics | Complexity | Evidence |
|-------|-------|-------|--------|------------|---------------|-----------|----------|
| Tutorial/Early | ~1-5 | 28 | Mailbox 수집 50개 | 8x8 정사각형 | 기본 매칭, Mailbox 장애물 | Low | frame-015 |
| Early | 6 | — | — | — | — (클리어) | Low | frame-013 |
| Mid-Early | ~7-10 | 18 | Box 2개 | 8x9 정사각형 | Box 장애물, 부스터 등장 | Medium | frame-021 |
| Mid | ~10-15 | 11 | Box + Grass | 8x8 정사각형 | Grass 장애물, 다중 목표 | Medium-High | frame-020 |
| Mid-Late | ~15-20 | 21 | Diamond 4 + ? 17 | 불규칙(외곽 돌출) | 비정형 보드, 다이아몬드 타일 | High | frame-019 |
| Challenge | ~20+ | 4 | Box + Grass | 8x8 | 극히 적은 이동 수 | Very High | frame-017 |

## 2. Difficulty Dimensions

### a. Spatial Complexity
- **초기**: 8x8 정사각형 보드, 빈 공간 없음 (frame-015)
- **중기**: 8x8 보드 유지, 장애물이 공간 차지 (frame-020, 021)
- **후기**: 불규칙 보드 형태 — 중앙 빈 공간 (frame-018), 외곽 돌출 (frame-019)
- **진행**: 선형 → 단계적 증가

### b. Temporal Pressure
- **일반 모드**: 이동 수 제한 (시간 압박 없음) — 전략적 사고 여유
- **Nightmare 모드**: 시간 제한 (01:00, 00:32, 00:29) — 긴급한 행동 필요 (frames 008, 016, 018)
- **진행**: Nightmare 모드가 시간 압박 변동을 제공하는 별도 채널

### c. Cognitive Load
- **초기**: 1개 목표 + 기본 매칭 (frame-015: Mailbox만)
- **중기**: 2개 목표 + 부스터 활용 판단 (frame-020: Box + Grass)
- **후기**: 2+ 목표 + 비정형 보드 + 부스터 콤보 전략 (frame-019: Diamond + ? 목표)
- **Nightmare**: 시간 관리 + 목표 달성 + 특수 아이템 수집

### d. Motor Skill Demand
- **전 구간 낮음**: Match-3는 정밀한 모터 스킬 불필요
- **Nightmare**: 빠른 판단 + 연속 스왑 필요 → 약간의 속도 요구

## 3. Difficulty Spikes & Valleys

| Moment | Type | Evidence | Description | Purpose |
|--------|------|---------|-------------|---------|
| Level 1-5 | valley | frame-015 | 28 이동, 단일 목표 | Tutorial, 핵심 루프 학습 |
| Level 6 Clear | valley | frame-013 | "Well Done!" 보상 | 성취감, 캐슬 꾸미기 동기 |
| Nightmare 등장 | spike | frame-014 | 시간 제한 모드 소개 | 변화/긴장감, 추가 보상 |
| Moves 4 Level | spike | frame-017 | 극히 적은 이동 수 | 도전/부스터 사용 유도 |
| 비정형 보드 | spike | frame-019 | 외곽 돌출 형태 | 공간 활용 전략 요구 |
| Arrow 해금 | valley | frame-012 | 새 부스터 획득 | 파워 업, 진행 보상 |

## 4. Progression Signals
- **레벨 번호**: "Level 6" 명시 (frame-013)
- **Area 진행**: "Area 1 — 4/6" (frame-022), "Area Progress 3/6" (frame-011)
- **별 획득**: 레벨 클리어 시 별 → 캐슬 과제 수행 화폐 (frame-013)
- **부스터 해금**: "Unlocked! Arrow x3" (frame-012)
- **코인 누적**: 2179 → 2391 → 2999 → 3068 (frames across gameplay)
- **팀 레벨**: 멤버들 Level 374~996 (frame-009) — 장기 진행 지표

## 5. Difficulty Design Assessment

- **Curve Shape**: **Stepped** — 일반 레벨은 단계적 난이도 증가, Nightmare가 간헐적 스파이크
- **Rest Points**: 있음 — 레벨 클리어 후 캐슬 꾸미기(메타 활동), Nightmare Skip 가능
- **Fail Safety**: 추정 — 실패 시 추가 이동 구매 또는 부스터 사용 유도 (IAP 연계)
- **Skill Ceiling**: Medium-High — 이동 수 4의 레벨은 정확한 부스터 조합 전략 필요
- **Nightmare vs Normal**: 두 난이도 채널이 교차하며 단조로움 방지
