# Effects & Motion Analysis — Royal Match

## 참고: fps 0.5 추출 (2초 간격)
프레임 간격이 넓어 정확한 타이밍 추론이 어려움. 효과 유형 식별 위주로 분석.

## 1. Effect Catalog

| Effect Name | Type | Evidence Frames | Trigger | Visual Description | Layers | Intensity |
|-------------|------|----------------|---------|-------------------|--------|-----------|
| Tile Match Burst | particle | 018 | 3+ 타일 매칭 | 타일 색상의 작은 파편이 방사형으로 분산. 반짝이 입자 동반 | midground | moderate |
| Booster Creation Flash | particle | 005-007 | 4+/5+/T-shape 매칭 | 별 모양 폭발 + 황금 반짝이. 부스터 아이콘이 나타나며 빛남 | foreground | dramatic |
| TNT Explosion | particle | 005 | TNT 활성화 | 3x3 범위 폭발. 주황-빨강 화염 + 파편 | foreground | dramatic |
| Rocket Trail | animation | 006 | Rocket 활성화 | 행/열 방향 줄무늬 광선. 양쪽 끝까지 이동하며 타일 파괴 | midground | dramatic |
| Light Ball Activation | particle | 007 | Light Ball 활성화 | 무지개 색 광선이 같은 색 타일 전체로 방사 | overlay | dramatic |
| Level Start Fanfare | screen-effect | 017 | 레벨 시작 | 양쪽에서 나팔 등장 + 중앙 불꽃놀이 + "Royal Match!" 로고 | overlay | dramatic |
| Level Complete Star | animation | 013 | 레벨 클리어 | 큰 별이 빨간 쿠션 위에 착지. 주변 반짝이 파티클 | overlay | dramatic |
| Coin Drop | animation | 022 | 보상 획득 | 금화가 위에서 아래로 떨어짐. 바운스 효과 추정 | foreground | moderate |
| Fire Hazard | animation | 008 | Nightmare 모드 | 배경에 불꽃이 타오르는 효과. 긴박감 연출 | background | moderate |
| Ice/Crystal Shatter | particle | 018 | 장애물 파괴 | 얼음/결정 파편이 흩어지는 효과 | midground | moderate |

## 2. Transition Catalog

| Transition Name | Type | Evidence Frames | Direction | Easing |
|----------------|------|----------------|-----------|--------|
| Splash → Home | fade | 001 → 022 | fade-in/out | ease-out |
| Home → Level | zoom + slide | 022 → 015 | zoom into board | ease-in-out |
| Level → Result | slide-up | gameplay → 013 | bottom to center | bounce |
| Nightmare Intro | slide | 014 → 008/016/018 | 패널 slide-down | ease-out |
| Team Panel | slide-up | 002 → 003 | overlay slide-up | ease-out |

## 3. Animation Patterns

| Animation Name | Target | Property | Loop | Easing |
|---------------|--------|----------|------|--------|
| Idle Tile Shimmer | 보드 타일 | opacity/brightness | yes | ease-in-out |
| Hint Highlight | 매칭 가능 타일 | scale + glow | yes (3초 주기) | ease-in-out |
| King Expression | King 아바타 | sprite swap | no (이벤트 트리거) | — |
| Timer Pulse | Nightmare 타이머 | scale | yes (1초 주기) | ease-in-out |
| Progress Bar Fill | 목표 진행바 | width | no | ease-out |
| Coin Counter Tick | 코인 카운터 | number + scale | no | linear |
| Castle Cloud Float | 배경 구름 | position.x | yes (느리게) | linear |

## 4. Effect Reproduction Notes

### Tile Match Burst
- **Godot**: GPUParticles2D
- **Parameters**: 20-30 particles, spread 360°, lifetime 0.3-0.5s, gravity 200
- **Color**: 매칭된 타일 색상, alpha fade-out

### Booster Creation Flash
- **Godot**: GPUParticles2D + AnimationPlayer
- **Parameters**: 별 모양 텍스처, 10-15 particles, scale 0→1→0.5, glow effect
- **Sequence**: 매치 파괴 → 0.2s 대기 → 폭발 이펙트 → 부스터 등장

### Level Start Fanfare
- **Godot**: AnimationPlayer (나팔 slide-in) + GPUParticles2D (불꽃)
- **Sequence**: 나팔 양쪽에서 0.5s slide → 불꽃 0.3s → 로고 scale bounce → 1s 유지 → fade-out

### Coin Drop
- **Godot**: Tween (position + bounce)
- **Parameters**: duration 0.6s, ease Bounce.OUT, y 시작 -100 → 최종 위치
