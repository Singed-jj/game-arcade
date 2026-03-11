# Royal Match — SIDC Retention Loop

> Part of [Royal Match Reproduction Spec](../index.md)

## Retention Loop Summary

| Phase | Strength | Key Element |
|-------|---------|-------------|
| Start | **Strong** | 즉시 플레이 가능한 레벨, 시각적 임팩트 (King + Castle) |
| Immersion | **Strong** | 부스터 콤보 쾌감, 다양한 레벨 디자인, Nightmare 변주 |
| Desire | **Strong** | Castle 꾸미기 미완 과제, Area 진행, Team 경쟁 |
| Conversion | **Moderate** | 라이프 제한, 추가 Moves, 부스터 잠금 (명시적 IAP wall 미확인) |

## Phase Details

### Start (첫 30초 훅)

| Element | Description | Evidence Frames |
|---------|-------------|-----------------|
| Visual Hook | 3D Castle + King 캐릭터로 즉각적 세계관 전달 | 022, 023 |
| Zero Friction | 튜토리얼 가이드 (Mailbox 설명) → 즉시 플레이 | 015 |
| First Success | 28 Moves로 넉넉한 첫 레벨 → 쉬운 클리어 | 015, 013 |

**분석**: Royal Match는 첫 화면에서 화려한 3D Castle과 King 캐릭터로 세계관을 즉시 전달. 첫 레벨은 28 이동으로 매우 넉넉하고, 목표도 단순(Mailbox 수집)하여 거의 실패 불가. "Well Done!" 별 보상이 빠르게 성취감을 제공.
Time-to-first-action: ~5초 (로딩 → 보드 터치).

### Immersion (몰입 유지)

| Element | Description | Evidence Frames |
|---------|-------------|-----------------|
| Booster Combo | TNT/Rocket/LightBall 생성과 활성화의 시청각 쾌감 | 005-007, 020 |
| Variety | 일반 모드 + Nightmare 모드 교차로 단조로움 방지 | 008, 014, 016, 018 |
| Progressive Challenge | Moves 감소, 비정형 보드, 다중 목표로 난이도 상승 | 017, 019, 020 |
| Visual Feedback | 타일 파괴 파티클, 레벨 클리어 연출, 불꽃놀이 | 013, 017, 018 |

**분석**: 부스터 콤보 시스템이 핵심 몰입 요소. 4연속 → Rocket 생성, T형 → TNT 등 플레이어의 전략적 선택이 보상. Nightmare 모드가 "시간 제한 + 스토리"로 기존 Match-3의 반복감 해소. 레벨당 ~2-5분으로 짧은 세션이지만 "한 판만 더" 유도.

### Desire (재방문 욕구)

| Element | Description | Evidence Frames |
|---------|-------------|-----------------|
| Castle Progress | Area 4/6 → 다음 과제 미완으로 복귀 욕구 | 011, 022 |
| King's Nightmare | Skip 가능하지만 +50 코인 보상이 유혹 | 014 |
| Team Competition | Team Score, 멤버 레벨 비교 → 사회적 동기 | 009-010 |
| Unlock Preview | 잠긴 부스터 버튼이 해금 기대감 유발 | 012, 019-21 |

**분석**: Castle 꾸미기가 강력한 복귀 동기. "Plant the bushes"처럼 구체적 과제가 Area Progress에 연결되어 "별 하나만 더 모으면" 심리 유발. Team 시스템은 사회적 책임감(Team Score 기여) 제공. King's Nightmare의 Skip/Play 선택이 FOMO 없이 자연스러운 참여 유도.

### Conversion (과금 전환)

| Element | Description | Evidence Frames |
|---------|-------------|-----------------|
| Life System | "Full" 표시 — 소진 시 대기 또는 구매 | 022 |
| Move Shortage | Moves 4~11의 어려운 레벨 → 추가 이동 구매 유도 | 017, 020 |
| Booster Lock | 하단 4개 부스터 잠금 → IAP/진행 해금 | 019-21 |
| Coin Economy | 코인 소비처 (부스터 구매 추정) vs 느린 획득 | 011, 022 |

**분석**: 영상에서 명시적 IAP 팝업이나 구매 화면은 미확인. 그러나 Moves 4 레벨 같은 고난이도와 라이프 시스템이 간접적 과금 압박. 부스터 잠금도 구매 동기. "Aggressive하지 않은 F2P" — 과금 없이도 진행 가능하지만, 과금하면 편한 구조.

## Retention Risk Assessment

| Risk | Level | Mitigation |
|------|-------|-----------|
| Content Exhaustion | Low | 레벨 자동 생성 가능, Castle 에어리어 확장 |
| Difficulty Frustration | Medium | Nightmare Skip, 부스터 해금, 추가 Moves |
| Social Dependency | Low | Team은 선택적, 솔로 플레이 완전 지원 |
| Pay-to-Win Perception | Low | 명시적 pay wall 없음, 부스터는 플레이로도 획득 |

## Cross-Reference

- 이펙트 → 몰입: [Effects Catalog](../effects/effects-catalog.md) 참조
- 난이도 → 몰입: [Difficulty Curve](../difficulty/difficulty-curve.md) 참조
- 에셋 → 전환: [Asset Catalog](../assets/asset-catalog.md)의 P0 항목
