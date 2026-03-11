# Royal Match — Difficulty Curve

> Part of [Royal Match Reproduction Spec](../index.md)
> Video duration: 1800s | Frames analyzed: 23 @ 0.5fps

## Difficulty Progression

| Stage | Level | Moves | Target | Board Shape | New Mechanics | Complexity | Evidence |
|-------|-------|-------|--------|------------|---------------|-----------|----------|
| Tutorial | ~1-5 | 28 | Mailbox 50개 | 8x8 정사각형 | 기본 매칭, Mailbox | Low | frame-015 |
| Early | 6 | — | — (클리어) | — | — | Low | frame-013 |
| Mid-Early | ~7-10 | 18 | Box 2개 | 8x9 정사각형 | Box 장애물, 부스터 | Medium | frame-021 |
| Mid | ~10-15 | 11 | Box + Grass | 8x8 정사각형 | Grass, 다중 목표 | Medium-High | frame-020 |
| Mid-Late | ~15-20 | 21 | Diamond 4 + ? 17 | 불규칙(외곽 돌출) | 비정형 보드, 다이아 | High | frame-019 |
| Challenge | ~20+ | 4 | Box + Grass | 8x8 | 극소 이동 수 | Very High | frame-017 |

## Difficulty Dimensions

### Spatial Complexity

보드 형태가 진행에 따라 복잡해짐.

| Stage | Board Shape | Safe Zone % | Obstacle Count | Evidence |
|-------|------------|------------|---------------|----------|
| Tutorial | 8x8 정사각형 (빈 공간 없음) | 100% | Mailbox 행 (보드 하단) | frame-015 |
| Mid | 8x8 정사각형 + 장애물 | ~85% | Box/Grass 산재 | frame-020, 021 |
| Mid-Late | 불규칙 (빈 공간 있음) | ~70% | 복합 + 비정형 | frame-019 |
| Nightmare | 빈 공간 + 시간 제한 | ~60% | 중앙 사각 공백 | frame-018 |

### Temporal Pressure

| Stage | Timer | Action Window | Evidence |
|-------|-------|-------------- |----------|
| Normal (전 구간) | 없음 (Moves 제한) | 무제한 (전략적 사고) | frames 015-21 |
| Nightmare Easy | 01:00 | 긴급 (빠른 연속 스왑) | frame-016 |
| Nightmare Mid | 00:32 | 매우 긴급 | frame-008 |
| Nightmare Hard | 00:29 | 극도로 긴급 | frame-018 |

### Cognitive Load

| Stage | Simultaneous Tracks | Evidence |
|-------|-------------------|----------|
| Tutorial | 1 (Mailbox 수집만) | frame-015 |
| Mid | 2 (Box 파괴 + Grass 제거) | frame-020 |
| Mid-Late | 3 (다중 목표 + 비정형 보드 + 부스터 전략) | frame-019 |
| Nightmare | 4 (시간 관리 + 목표 + 특수 아이템 + 빠른 판단) | frame-018 |

### Motor Skill Demand

| Stage | Precision Required | Speed Required | Evidence |
|-------|-------------------|---------------|----------|
| Normal (전 구간) | Low (인접 스왑) | None (턴제) | frames 015-21 |
| Nightmare | Low (동일) | Medium (시간 제한) | frames 008, 016, 018 |

## Spikes & Valleys

| Moment | Type | Frame | Description | Purpose |
|--------|------|-------|-------------|---------|
| Level 1-5 | valley | 015 | 28 이동, 단일 목표 | Tutorial, 코어 루프 학습 |
| Level 6 Clear | valley | 013 | "Well Done!" 별 보상 | 성취감, Castle 동기 부여 |
| Arrow 해금 | valley | 012 | 새 부스터 획득 (Arrow x3) | 파워업, 진행 보상 |
| Nightmare 등장 | spike | 014 | 시간 제한 모드 소개 | 변화/긴장감, 추가 보상 |
| 비정형 보드 | spike | 019 | 외곽 돌출 + 다중 목표 | 공간 전략 요구 |
| Moves 4 Level | spike | 017 | 극히 적은 이동 수 | 도전/부스터 사용 유도 |

## Progression Signals

- **레벨 번호**: "Level 6" (frame-013)
- **Area 진행**: "Area 1 — 4/6" (frame-022), "Area Progress 3/6" (frame-011)
- **별 획득**: 레벨 클리어 → Castle 과제 화폐 (frame-013)
- **부스터 해금**: "Unlocked! Arrow x3" (frame-012)
- **코인 누적**: 2179 → 2391 → 2999 → 3068 (다수 프레임)
- **팀 레벨**: 374~996 (frame-009) — 장기 진행 지표

## Design Assessment

| Aspect | Assessment |
|--------|-----------|
| Curve Shape | **Stepped** — 일반 레벨 단계적 증가, Nightmare 간헐 스파이크 |
| Rest Points | Castle 꾸미기 + Nightmare Skip 옵션 |
| Fail Safety | 추가 Moves 구매, 부스터 사용 유도 (IAP 연계 추정) |
| Skill Ceiling | Medium-High (Moves 4 레벨 = 정확한 부스터 콤보 전략) |
| Estimated Mastery Time | ~2-3시간 (기본 메커니즘), 수백 레벨 (전체 콘텐츠) |
