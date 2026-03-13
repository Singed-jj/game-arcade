# food-crush-4 설계 문서

**날짜**: 2026-03-13
**기반**: food-crush-2 (TypeScript + DOM)
**목표**: 모바일 웹뷰 성능 개선 — PixiJS WebGL 렌더러 도입

---

## 개요

food-crush-2와 동일한 Match-3 게임을 구현하되, 모바일 웹뷰에서 발생하는 세 가지 성능 문제를 해결한다:
- 블록 스왑/낙하 애니메이션 끊김
- 모바일 터치 반응 지연
- 파티클/이펙트 버벅임

**접근 방식**: render/ 레이어만 PixiJS로 교체. core/state/screens/ui/audio는 food-crush-2에서 그대로 복사 사용.

---

## 아키텍처

```
food-crush-4/
├── core/        ← food-crush-2 그대로 복사 (변경 없음)
│   ├── types.ts
│   ├── board-logic.ts
│   ├── match-detector.ts
│   ├── gravity-handler.ts
│   ├── tool-effects.ts
│   └── level-data.ts
├── state/       ← food-crush-2 그대로 복사 (변경 없음)
│   ├── event-bus.ts
│   ├── game-state.ts
│   ├── heart-manager.ts
│   ├── piece-manager.ts
│   ├── tool-manager.ts
│   └── save-manager.ts
├── render/      ← PixiJS로 완전 재작성 (핵심 변경)
│   ├── pixi-app.ts        # PixiJS Application 싱글톤
│   ├── board-renderer.ts  # PixiJS Container 기반 보드
│   ├── block-sprite.ts    # Sprite (block-view.ts 대체)
│   └── effects-layer.ts   # ParticleContainer (effects-canvas.ts 대체)
├── screens/     ← food-crush-2 그대로 복사 (DOM)
├── ui/          ← food-crush-2 그대로 복사 (DOM)
├── audio/       ← food-crush-2 그대로 복사
└── main.ts      ← PixiJS canvas 마운트 초기화 수정
```

---

## render/ 레이어 세부 설계

### pixi-app.ts
- PixiJS `Application` 싱글톤
- `#game-board` div 안에 canvas 마운트
- `resizeTo`: 부모 div 자동 리사이즈
- `Ticker`로 60fps 루프 관리
- 앱 초기화 시 텍스처 프리로드: food-crush-2의 개별 PNG 에셋 재사용 (`assets/blocks/chicken.png` 등 5종)
- 스프라이트시트 미사용 — 개별 PNG를 `Assets.load()`로 로딩

### block-sprite.ts
- `block-view.ts`(div 기반) 대체
- PixiJS `Sprite` — 텍스처 아틀라스로 5종 블록
- 스왑/낙하 애니메이션: PixiJS `Tween` 또는 gsap
- 터치 이벤트: `eventMode = 'static'`
- 선택 상태 표시: tint 또는 scale 변경

### board-renderer.ts
- PixiJS `Container` (7×7 그리드)
- 블록 좌표: 픽셀 직접 계산 (DOM reflow 없음)
- 입력: `pointerdown` / `pointerup` on Container
- food-crush-2의 `inputLocked` 패턴 그대로 유지
- EventBus 이벤트 구독 → 스프라이트 상태 업데이트

### effects-layer.ts
- PixiJS `ParticleContainer` (GPU 파티클)
- 블록 파괴 시 burst 이펙트
- 보드 Container 위 별도 레이어

---

## DOM-Canvas 경계

```
screens/game-screen.ts (DOM)
  └── #game-board div
        └── <canvas>  ← PixiJS Application이 여기에 마운트
              └── Container (보드)
                    ├── Sprite × 49 (7×7 블록)
                    └── ParticleContainer (이펙트)
```

- EventBus 인터페이스 변경 없음
- screens/ui는 DOM 이벤트 그대로
- render/는 EventBus 구독으로 PixiJS 상태 업데이트
- PixiJS canvas 위에 DOM UI가 겹치는 경우 해당 DOM 요소에 `pointer-events: none` 적용, 터치 이벤트는 canvas의 PixiJS pointer 이벤트가 단독 처리
- HUD/툴바 등 인터랙티브 DOM 요소는 canvas 바깥(위/아래)에 배치하여 이벤트 충돌 방지

---

## 성능 개선 포인트

| 기존 (food-crush-2) | food-crush-4 |
|---|---|
| 49개 div 이동 → DOM reflow | GPU 스프라이트 이동, reflow 없음 |
| CSS transition 애니메이션 | PixiJS Ticker 기반 프레임 애니메이션 |
| Canvas 2D 파티클 | ParticleContainer (WebGL instancing) |
| getBoundingClientRect 캐시 필요 | PixiJS 내부 좌표계 직접 사용 |
| 모바일 터치 지연 | `eventMode='static'` 즉시 응답 |

---

## 기술 스택

- **언어**: TypeScript 5.x
- **번들러**: Vite
- **렌더러**: PixiJS v8 (^8.0.0) — `Application.init()` 비동기 API 사용
- **애니메이션**: gsap (블록 스왑/낙하 트윈) — PixiJS v8에 내장 tween 없음
- **나머지**: food-crush-2와 동일

---

## 구현 범위

### 포함
- food-crush-2와 동일한 모든 게임 기능 (7×7 보드, 5종 블록, 3종 도구, 하트 시스템, 뽑기, 10개 레벨)
- PixiJS 기반 보드 렌더링
- 모바일 터치 최적화

### 제외
- 신규 게임 기능 추가
- 백엔드/서버 연동
- PWA/앱 패키징

---

## 검증 방법

Claude in Chrome으로 직접 플레이하며 food-crush-2와 비교:
1. 블록 스왑 애니메이션 자연스러움
2. 모바일 터치 반응속도
3. 파티클 이펙트 부드러움
4. 전체 게임 플로우 (Cover → Map → Game → Clear/Fail)
5. 도구 사용 (Rocket/Bomb/Rainbow)

수정 → 재테스트 사이클 5회 진행.
