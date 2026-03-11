# Royal Match — Effects Catalog

> Part of [Royal Match Reproduction Spec](../index.md)
> Frame timing: 0.5fps (1 frame = 2s) — 정확한 타이밍보다 유형 식별 위주

## Effect Summary

| # | Effect Name | Type | Duration (est.) | Trigger |
|---|------------|------|----------|---------|
| 1 | Tile Match Burst | particle | ~0.3s | 3+ 타일 매칭 |
| 2 | TNT Explosion | particle | ~0.5s | TNT 활성화 |
| 3 | Rocket Trail | animation | ~0.4s | Rocket 활성화 |
| 4 | Light Ball Activation | particle | ~0.6s | Light Ball 활성화 |
| 5 | Booster Creation Flash | particle | ~0.3s | 4+/5+/T형 매치 |
| 6 | Level Start Fanfare | screen-effect | ~2s | 레벨 시작 |
| 7 | Level Complete Star | animation | ~1s | 레벨 클리어 |
| 8 | Coin Drop | animation | ~0.6s | 보상 획득 |
| 9 | Fire Hazard | animation | continuous | Nightmare 모드 |
| 10 | Ice/Crystal Shatter | particle | ~0.3s | 장애물 파괴 |

## Detailed Effects

### E1: Tile Match Burst

| Field | Value |
|-------|-------|
| Type | particle |
| Duration | ~0.3s |
| Trigger | 3개 이상 동일 타일 매칭 |
| Layer | midground |
| Intensity | moderate |

**Visual Description:** 매칭된 타일 색상의 작은 파편이 방사형(360°)으로 분산. 반짝이 입자 동반. 빠르게 alpha fade-out.

**Reference Frames:**
- `frame-018`: 보드에서 매치 후 파편 잔상 확인

**Godot Implementation Hint:**
- Node: GPUParticles2D
- Key params: amount=20-30, spread=360°, lifetime=0.3s, gravity=200, color=타일색, alpha_curve=fade-out

---

### E2: TNT Explosion

| Field | Value |
|-------|-------|
| Type | particle |
| Duration | ~0.5s |
| Trigger | TNT 부스터 활성화 |
| Layer | foreground |
| Intensity | dramatic |

**Visual Description:** 3x3 범위 주황-빨강 화염 폭발. 중심에서 외곽으로 확산. 파편 + 충격파 링.

**Reference Frames:**
- `frame-005`: TNT 생성 설명 (T형 매치 → TNT)

**Godot Implementation Hint:**
- Node: GPUParticles2D + AnimationPlayer
- Key params: amount=40-50, 2단계(화염→파편), screen_shake 0.1s

---

### E3: Rocket Trail

| Field | Value |
|-------|-------|
| Type | animation |
| Duration | ~0.4s |
| Trigger | Rocket 부스터 활성화 |
| Layer | midground |
| Intensity | dramatic |

**Visual Description:** 행 또는 열 방향으로 줄무늬 광선이 양쪽 끝까지 이동하며 경로의 모든 타일 파괴.

**Reference Frames:**
- `frame-006`: Rocket 생성 설명 (4개 직선 → Rocket)

**Godot Implementation Hint:**
- Node: Tween (position) + GPUParticles2D (trail)
- Key params: 양방향 동시 이동, duration=0.4s, trail particles lifetime=0.2s

---

### E4: Light Ball Activation

| Field | Value |
|-------|-------|
| Type | particle |
| Duration | ~0.6s |
| Trigger | Light Ball과 타일 스왑 |
| Layer | overlay |
| Intensity | dramatic |

**Visual Description:** 무지개 색 광선이 Light Ball 위치에서 같은 색 타일 전체로 방사. 각 타일이 순차적으로 폭발.

**Reference Frames:**
- `frame-007`: Light Ball 생성 설명 (5개 직선 → Light Ball)

**Godot Implementation Hint:**
- Node: Line2D (빔) + GPUParticles2D (각 타일 폭발)
- Key params: 빔 duration=0.1s/타일, 색상=무지개, 각 타일 폭발은 E1과 동일

---

### E5: Booster Creation Flash

| Field | Value |
|-------|-------|
| Type | particle |
| Duration | ~0.3s |
| Trigger | 특수 매치 (4+, 5+, T/L형) |
| Layer | foreground |
| Intensity | dramatic |

**Visual Description:** 별 모양 폭발 + 황금 반짝이. 매치 위치에서 부스터 아이콘이 scale 0→1로 등장.

**Reference Frames:**
- `frame-005~007`: 각 부스터 생성 다이어그램

**Godot Implementation Hint:**
- Node: GPUParticles2D (별) + Tween (부스터 scale bounce)
- Key params: star texture, amount=10-15, 부스터 scale 0→1.2→1.0 (bounce)

---

### E6: Level Start Fanfare

| Field | Value |
|-------|-------|
| Type | screen-effect |
| Duration | ~2s |
| Trigger | 레벨 시작 |
| Layer | overlay |
| Intensity | dramatic |

**Visual Description:** 양쪽에서 나팔이 slide-in. 중앙에 "Royal Match!" 로고 + 불꽃놀이. 배경 어둡게 overlay.

**Reference Frames:**
- `frame-017`: 나팔 + 불꽃놀이 + 로고

**Godot Implementation Hint:**
- Node: AnimationPlayer (시퀀스)
- Sequence: 나팔 slide-in 0.5s → 불꽃 GPUParticles2D 0.3s → 로고 scale bounce → 1s hold → fade-out

---

### E7: Level Complete Star

| Field | Value |
|-------|-------|
| Type | animation |
| Duration | ~1s |
| Trigger | 레벨 클리어 |
| Layer | overlay |
| Intensity | dramatic |

**Visual Description:** 큰 황금 별이 위에서 빨간 쿠션 위로 착지. 주변 반짝이 파티클.

**Reference Frames:**
- `frame-013`: "Well Done!" + 별 + 쿠션

**Godot Implementation Hint:**
- Node: Tween (별 y position, bounce ease) + GPUParticles2D (sparkle)
- Key params: 별 size ~128px, bounce duration=0.6s, sparkle amount=15

---

## Transitions

| # | Transition | Type | Duration (est.) | Direction |
|---|-----------|------|----------|-----------|
| 1 | Splash → Home | fade | ~1s | fade-in/out |
| 2 | Home → Level | zoom + slide | ~0.8s | zoom into board |
| 3 | Level → Result | slide-up | ~0.5s | bottom to center (bounce) |
| 4 | Nightmare Intro | slide | ~0.4s | panel slide-down |
| 5 | Team Panel | slide-up | ~0.3s | overlay slide-up |

## Animation Patterns

| # | Animation | Target | Property | Cycle | Loop |
|---|----------|--------|----------|-------|------|
| 1 | Idle Tile Shimmer | 보드 타일 | brightness | ~2s | yes |
| 2 | Hint Highlight | 매칭 가능 타일 | scale + glow | ~3s | yes |
| 3 | King Expression | King 아바타 | sprite swap | event | no |
| 4 | Timer Pulse | Nightmare 타이머 | scale | ~1s | yes |
| 5 | Progress Bar Fill | 목표 진행바 | width | ~0.5s | no |
| 6 | Coin Counter Tick | 코인 카운터 | number + scale | ~0.1s/tick | no |
| 7 | Castle Cloud Float | 배경 구름 | position.x | ~30s | yes |
