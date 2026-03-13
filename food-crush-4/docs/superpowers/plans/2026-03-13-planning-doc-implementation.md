# Food Crush 2 — 기획 문서 전체 구현 계획

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 기획 문서(wireframe/level/assets) 대비 누락된 모든 UI·기능·사운드를 구현해 기획과 일치시킨다.

**Architecture:** 기존 이벤트버스 + 화면 클래스 패턴 유지. 각 화면은 독립 파일로 수정, 신규 공통 컴포넌트(TickerBanner, SoundManager, InventoryScreen)는 별도 파일로 추가한다.

**Tech Stack:** TypeScript, Vite 7, Tailwind CSS 4, Canvas 2D, Web Audio API, localStorage

---

## 공통 규칙

- **파일 충돌 방지**: 각 사이클의 작업자는 지정된 파일만 수정. 겹치는 파일 없음.
- **Mock 처리**: 두잇 연동 버튼은 클릭 시 toast "현재 구현중인 화면입니다" 표시.
- **점수**: game-info-bar에서 점수 영역 제거.
- **테스트**: 각 사이클 후 `npm run test` 통과 필수.
- **에이전트 모델**: 모두 opus 4.6.

---

## 전체 파일 맵

| 파일 | 상태 | 담당 사이클 |
|------|------|-----------|
| `src/screens/cover-screen.ts` | 수정 | Cycle 1 |
| `src/core/level-data.ts` | 수정 | Cycle 1 |
| `src/ui/hud.ts` | 수정 | Cycle 2 |
| `src/screens/map-screen.ts` | 수정 | Cycle 2 |
| `src/screens/game-screen.ts` | 수정 | Cycle 3 |
| `src/ui/game-info-bar.ts` | 수정 | Cycle 3 |
| `src/screens/clear-screen.ts` | 수정 | Cycle 4 |
| `src/screens/fail-screen.ts` | 수정 | Cycle 5 |
| `src/screens/gacha-screen.ts` | 수정 | Cycle 6 |
| `src/state/piece-manager.ts` | 수정 | Cycle 6 |
| `src/ui/ticker-banner.ts` | 신규 | Cycle 7 |
| `src/main.ts` | 수정 | Cycle 7 |
| `src/screens/inventory-screen.ts` | 신규 | Cycle 8 |
| `src/audio/sound-manager.ts` | 신규 | Cycle 9 |
| `public/audio/*.mp3` | 신규 | Cycle 9 |

---

## Chunk 1 — 커버 화면 재설계 + 레벨 데이터 수정

### Cycle 1-A: 커버 화면 재설계 (cover-screen.ts)

**파일:** `src/screens/cover-screen.ts` (현재 139줄)

**변경 내용:**
1. 서브로고: "맛있는 퍼즐 어드벤처" → "두잇 미니게임"
2. 슬로건 추가: "깰 때마다 공짜 쿠폰이 쏟아진다!" (일부 강조 색상)
3. 블록 미리보기: 현재 2×4 그리드 → 6×4 그리드 + "COMBO ×3" 뱃지
4. 소셜 라인 추가: "🟢 지금 1,247명 플레이 중" (고정 숫자)
5. 버튼 텍스트: "시작하기 ▶" → "🎮 지금 바로 시작하기"
6. 서브텍스트: "레벨을 클리어하고..." → "두잇 계정 자동 연동 · 로그인 없이"

- [ ] **Step 1**: `src/screens/cover-screen.ts` 전체 읽기
- [ ] **Step 2**: 서브로고 텍스트 수정 ("두잇 미니게임")
- [ ] **Step 3**: 슬로건 div 추가 (기존 서브로고 아래, `text-sm text-yellow-300 font-bold`, "쿠폰" 단어는 주황색)
- [ ] **Step 4**: 블록 그리드를 6×4로 확장 (블록 타입 배열 재구성) + COMBO 뱃지 오버레이
- [ ] **Step 5**: 소셜 라인 div 추가 (초록 점 + 텍스트, 버튼 위)
- [ ] **Step 6**: 버튼 텍스트 + 서브텍스트 수정
- [ ] **Step 7**: `npm run build` 확인 (에러 없음)

### Cycle 1-B: 레벨 데이터 기획 맞게 수정 (level-data.ts)

**파일:** `src/core/level-data.ts`

**기획 vs 현재 이동수:**

| 레벨 | 기획 | 현재 | 목표 |
|------|------|------|------|
| 1 | 25 | 26 | 2종 각 14개 |
| 2 | 23 | 22 | 2종 |
| 3 | 20 | ? | 2종 |
| 4 | 18 | 19 | 2종 |
| 5 | 17 | 22 | 2종 (클리어율 45%) |
| 6 | 16 | 17 | 2종 (숨돌리기) |
| 7 | 13 | 15 | 2종 (어려움) |
| 8 | 15 | 20 | 3종 (숨돌리기) |
| 9 | 12 | 14 | 2종 (어려움) |
| 10 | 10 | 15 | 3종 (보스) |

- [ ] **Step 1**: `src/core/level-data.ts` 전체 읽기
- [ ] **Step 2**: 레벨 1~10 이동수를 기획 기준으로 수정
- [ ] **Step 3**: 레벨 5 목표 타입을 2종으로 수정 (기획: 2종, 클리어율 45%)
- [ ] **Step 4**: `npm run test` 실행 → 통과 확인
- [ ] **Step 5**: `npm run build` 확인

---

## Chunk 2 — HUD + 맵 화면 보완

### Cycle 2-A: HUD N/5 숫자 카운터 (hud.ts)

**파일:** `src/ui/hud.ts` (현재 94줄)

**변경 내용:**
- 조각 도트 옆에 "N/5" 숫자 텍스트 추가
- 하트 부족 시(< 3개) 회복 타이머 표시 (MM:SS, 1초마다 업데이트)
- 타이머 표시 형식: 하트 아이콘 옆 소형 텍스트 "🕐 14:22"

- [ ] **Step 1**: `src/ui/hud.ts` 전체 읽기
- [ ] **Step 2**: 조각 위젯에 `pieceCountEl` (N/5 텍스트) 추가
- [ ] **Step 3**: `piece:changed` 핸들러에서 숫자도 업데이트
- [ ] **Step 4**: `heartTimerEl` 추가, `heart:changed` 핸들러에서 하트 < 3개 시 타이머 시작
- [ ] **Step 5**: `setInterval` 기반 MM:SS 카운트다운 (1초, heartManager.getRecoveryTimeMs() 사용)
- [ ] **Step 6**: 화면 전환 시 인터벌 cleanup
- [ ] **Step 7**: `npm run build` 확인

### Cycle 2-B: 맵 화면 보완 (map-screen.ts)

**파일:** `src/screens/map-screen.ts` (현재 175줄)

**변경 내용:**
1. 잠금 레벨 노드에 🔒 텍스트 추가 (현재는 빈 흰 원)
2. 현재 레벨 노드에 "플레이!" 태그 + 마스콧 🐥 (노드 옆)
3. 뽑기 버튼: 조각 5개 이상 시만 노출 (기존 구현 조건 유지, 위치/스타일 기획 맞게)
4. 아이템 버튼 추가: "🎒 아이템" (우하단 고정 버튼) → `screen:change { screen: 'inventory' }` emit

- [ ] **Step 1**: `src/screens/map-screen.ts` 전체 읽기
- [ ] **Step 2**: 잠금 노드 div에 🔒 span 추가
- [ ] **Step 3**: 현재(unlock) 레벨 노드에 "플레이!" 태그 + 🐥 이모지 추가
- [ ] **Step 4**: 아이템 버튼 DOM 생성 + 이벤트 연결 (`screen:change { screen: 'inventory' }`)
- [ ] **Step 5**: main.ts에 `case 'inventory':` 라우팅 추가 (임시로 빈 div)
- [ ] **Step 6**: `npm run build` 확인

---

## Chunk 3 — 게임 화면 보완

### Cycle 3-A: 일시정지 버튼 + 상태 저장 (game-screen.ts)

**파일:** `src/screens/game-screen.ts` (현재 526줄)

**변경 내용:**
1. HUD에 ⏸ 버튼 추가 (뒤로가기 버튼 옆)
2. 일시정지 시:
   - 보드 입력 잠금
   - 현재 보드 상태(grid, moves, goals 진행도, 레벨) → localStorage `pause-state` 키로 저장
   - 일시정지 팝업 표시 (이어하기 / 맵으로 나가기)
3. "이어하기" 클릭 시:
   - localStorage `pause-state` 삭제
   - 보드 입력 잠금 해제
4. "맵으로 나가기" 클릭 시:
   - localStorage `pause-state` 유지 (다음 진입 시 복구용)
   - `screen:change { screen: 'map' }` emit
5. 레벨 진입 시:
   - localStorage `pause-state` 확인
   - 동일 레벨이면 저장된 상태로 복구 (board.initWithGrid)
   - 다른 레벨이면 삭제 후 새로 시작

**일시정지 팝업 구현 (인라인 오버레이):**
```
┌──────────────────────────────┐
│  ⏸ 일시정지                  │
│  (현재 레벨 / 남은 이동수)    │
│                              │
│  [▶ 이어하기]  [← 맵으로]    │
└──────────────────────────────┘
```

- [ ] **Step 1**: `src/screens/game-screen.ts` 전체 읽기
- [ ] **Step 2**: `savePauseState()` 메서드 추가 (boardLogic 현재 grid, moves, goals → JSON → localStorage)
- [ ] **Step 3**: `loadPauseState()` 메서드 추가 (localStorage 읽기 → 동일 레벨 확인 → 반환)
- [ ] **Step 4**: `clearPauseState()` 메서드 추가 (localStorage 삭제)
- [ ] **Step 5**: 일시정지 팝업 DOM 빌드 함수 추가
- [ ] **Step 6**: HUD에 ⏸ 버튼 추가, 클릭 시 `savePauseState()` + 팝업 표시
- [ ] **Step 7**: 레벨 시작 시 `loadPauseState()` 확인 + 복구 로직
- [ ] **Step 8**: `npm run build` 확인

### Cycle 3-B: 이동수 긴박 연출 + 점수 숨김 (game-info-bar.ts)

**파일:** `src/ui/game-info-bar.ts` (현재 102줄)

**변경 내용:**
1. 점수 표시 영역 제거 (score 관련 DOM, 이벤트 리스너)
2. 이동수 5회 이하: 숫자 빨간색 + 깜빡임 (CSS animation)
3. 이동수 3회 이하: 게임 화면 배경 색상 어두운 빨강으로 변경 (CSS class 토글)

- [ ] **Step 1**: `src/ui/game-info-bar.ts` 전체 읽기
- [ ] **Step 2**: 점수 관련 DOM 요소 및 `game:score-changed` 리스너 제거
- [ ] **Step 3**: `game:move-used` 핸들러에서 남은 이동수 ≤ 5 시 `text-red-400` + `animate-pulse` 클래스 추가
- [ ] **Step 4**: 남은 이동수 ≤ 3 시 `eventBus.emit('game:urgent-mode', true)` 발생
- [ ] **Step 5**: game-screen.ts에서 `game:urgent-mode` 수신 → 배경 div에 `bg-red-900/30` 클래스 토글
- [ ] **Step 6**: `npm run build` 확인

---

## Chunk 4 — 클리어 화면 재설계

### Cycle 4: 클리어 화면 (clear-screen.ts)

**파일:** `src/screens/clear-screen.ts` (현재 159줄)

**변경 내용:**
1. 조각 박스 추가 (별 표시 아래):
   - "🎟️ +1 조각 획득!" 텍스트
   - 도트 N개 채워진 상태 (현재 보유 조각 수 기준)
   - 텍스트: "N/5 — 1개만 더!" (N=4 이하) / "✨ 5/5 — 뽑기 준비 완료!" (N=5)
2. 조각 5/5 달성 시:
   - 조각 박스 금색 테두리 강조
   - "[✨ 공짜 쿠폰 뽑기!]" 버튼 추가 (금색, 1순위) → `screen:change { screen: 'gacha' }` emit
   - "[다음 레벨 먼저 ▶]" 버튼을 유령 스타일로 변경 (2순위)
3. 조각 5개 미만 시: 기존 "[다음 레벨 ▶]" 버튼 유지

- [ ] **Step 1**: `src/screens/clear-screen.ts` 전체 읽기
- [ ] **Step 2**: `buildPieceBox(currentPieces: number)` 헬퍼 함수 작성
- [ ] **Step 3**: 조각 박스를 별 표시 아래에 삽입
- [ ] **Step 4**: `currentPieces >= 5` 분기: 금색 박스 + 뽑기 버튼 (1순위) + 다음 레벨 유령 버튼 (2순위)
- [ ] **Step 5**: `currentPieces < 5` 분기: 기존 버튼 레이아웃 유지
- [ ] **Step 6**: `npm run build` 확인

---

## Chunk 5 — 실패 화면 재설계

### Cycle 5: 실패 화면 (fail-screen.ts)

**파일:** `src/screens/fail-screen.ts` (현재 205줄)

**변경 내용:**
1. 이모지: 💔 → 😢
2. 제목: "실패..." → "아깝다!"
3. 부제 추가: "조금만 더였는데..."
4. 아이템 쇼케이스 추가 (3칸 카드):
   - 🚀 로켓: "가로 또는 세로 한 줄 제거"
   - 💣 폭탄: "3×3 범위 폭발"
   - 🌈 무지개: "같은 종류 전부 제거"
5. 배지 추가: "🍗 치킨 쿠폰도 뽑힐 수 있어요!"
6. "[🛒 주문하고 뽑기]" 버튼 추가 (주황색, 1순위, Mock: toast)
7. 하트 0 시 인라인 팝업 (화면 전환 없이 오버레이):
   - 💔 "하트가 없어요"
   - 하트 3개 (모두 회색)
   - 회복 타이머 "다음 하트까지 MM:SS"
   - "[🛒 주문하고 회복]" 버튼 (Mock toast, 1순위)
   - "[👥 친구 링크 공유]" 버튼 (Mock toast: "친구가 클릭하면 ❤️+1 · 🎟️+1", 2순위)
   - "[⏰ 기다릴게요]" 텍스트 링크 (팝업 닫기, 3순위)
8. "[🔄 재도전]" 버튼: 하트 있을 때만 활성 (기존 유지)

- [ ] **Step 1**: `src/screens/fail-screen.ts` 전체 읽기
- [ ] **Step 2**: 이모지/제목/부제 수정
- [ ] **Step 3**: `buildItemShowcase()` 헬퍼 작성 (3칸 카드)
- [ ] **Step 4**: 배지 + 주문 버튼 (Mock toast) 추가
- [ ] **Step 5**: `buildHeartEmptyOverlay()` 헬퍼 작성 (하트 0 인라인 팝업)
- [ ] **Step 6**: 하트 0 시 팝업 자동 노출 로직
- [ ] **Step 7**: 타이머 cleanup (screen:change 시)
- [ ] **Step 8**: `npm run build` 확인

---

## Chunk 6 — 뽑기 시스템 완전 교체

### Cycle 6-A: 확률 테이블 업데이트 (piece-manager.ts)

**파일:** `src/state/piece-manager.ts` (현재 31줄)

**기획 확률표:**
- 66.45%: 도구 1개 (로켓 or 폭탄 랜덤)
- 30%: 도구 3개 (로켓 + 폭탄 + 무지개)
- 3%: 1,000원 쿠폰
- 0.5%: 2,000원 쿠폰
- 0.05%: 🍗 1인 치킨 (10,000원)

**GachaResult 타입 추가:**
```typescript
type GachaResultType = 'tool1' | 'tool3' | 'coupon1000' | 'coupon2000' | 'chicken'
interface GachaResult {
  type: GachaResultType
  tools?: ToolType[]       // tool1/tool3 시
  couponValue?: number     // coupon* 시
}
```

- [ ] **Step 1**: `src/state/piece-manager.ts` 전체 읽기
- [ ] **Step 2**: `GachaResult` 타입 + `GachaResultType` 추가 (src/core/types.ts에 추가 또는 piece-manager.ts 상단)
- [ ] **Step 3**: `useForGacha()` 메서드를 새 확률 테이블로 교체 (누적 확률 방식)
- [ ] **Step 4**: `npm run test` 실행

### Cycle 6-B: 뽑기 화면 릴 연출 (gacha-screen.ts)

**파일:** `src/screens/gacha-screen.ts` (현재 190줄) → 완전 재작성

**릴 연출 스펙:**
- 릴 높이: 셀 1개 = 60px, 보이는 영역 = 288px (~4.8개)
- 릴 아이템 순서: 🚀 💣 🎟 🚀 🍗 💣 🌈 (반복)
- 애니메이션: 0~1.5초 빠르게 스크롤 → 1.5~3.0초 점점 느려지며 정지
- 중앙 하이라이트 프레임 (금색 테두리)
- 정지 후 1초 대기 → 결과 화면으로 자동 전환

**Near-miss 로직:**
```typescript
// GachaResult가 chicken이 아닌 경우, 30% 확률로
// 릴 최종 정지 위치를 치킨(🍗)이 하이라이트 바로 위 or 아래에 오도록 조정
const nearMiss = result.type !== 'chicken' && Math.random() < 0.3
```

**결과 화면 분기:**
- `tool1`: "🚀 로켓 획득!" + 설명 + 도구 현황 + [확인]
- `tool3`: "로켓+폭탄+무지개 획득!" + 도구 현황 + [확인]
- `coupon1000`: "🎉 1,000원 쿠폰!" + "두잇 앱 주문 시 사용" + "⏰ 24시간 유효" + [🛒 주문하기 Mock] + [나중에]
- `coupon2000`: "🎉 2,000원 쿠폰!" + 동일
- `chicken`: "🎉🍗 1인 치킨 당첨!" (금색, 특별 연출) + [🛒 주문하기 Mock] + [나중에]

- [ ] **Step 1**: `src/screens/gacha-screen.ts` 전체 읽기
- [ ] **Step 2**: 릴 DOM 구조 설계 (컨테이너 + 스크롤 영역 + 하이라이트 프레임)
- [ ] **Step 3**: 릴 스크롤 애니메이션 구현 (requestAnimationFrame, easeOut)
- [ ] **Step 4**: Near-miss 위치 계산 로직
- [ ] **Step 5**: 정지 후 결과 div 전환 (릴 숨기기, 결과 보이기)
- [ ] **Step 6**: 결과 타입별 UI 빌드 (분기)
- [ ] **Step 7**: Mock toast 연결
- [ ] **Step 8**: `npm run build` 확인

---

## Chunk 7 — 띠배너 공통 컴포넌트

### Cycle 7: 띠배너 (ticker-banner.ts + main.ts)

**파일:** `src/ui/ticker-banner.ts` (신규), `src/main.ts` (수정)

**스펙:**
- 모든 화면 최상단에 고정 (z-index 최상위)
- 높이 28px, 배경 진한 주황/갈색
- 텍스트 우→좌 자동 스크롤 (CSS animation: marquee)
- 랜덤 데이터 생성:
  - 지역명: ["강남구", "마포구", "송파구", "관악구", "서초구", "종로구", "용산구", "성동구"]
  - 성: ["김", "이", "박", "최", "정", "강", "조", "윤"]
  - 보상: ["1인 치킨", "1,000원 쿠폰", "2,000원 쿠폰", "로켓 도구 3개"]
  - 형식: "{지역명} {성}○님이 {보상}을 뽑았습니다!"
- 5~10초마다 텍스트 교체

```typescript
export class TickerBanner {
  private el: HTMLElement
  private intervalId: number | null = null

  constructor(container: HTMLElement) { ... }
  start(): void { ... }
  stop(): void { ... }
  private generateText(): string { ... }
}
```

- [ ] **Step 1**: `src/ui/ticker-banner.ts` 신규 작성
- [ ] **Step 2**: CSS marquee 스타일 (Tailwind 커스텀 또는 inline style)
- [ ] **Step 3**: `src/main.ts` 읽기
- [ ] **Step 4**: `App` 클래스에 `tickerBanner: TickerBanner` 인스턴스 추가
- [ ] **Step 5**: `changeScreen()` 후 매 화면에 띠배너 마운트 (app 컨테이너 최상단)
- [ ] **Step 6**: `npm run build` 확인

---

## Chunk 8 — 아이템 인벤토리 화면

### Cycle 8: 인벤토리 화면 (inventory-screen.ts)

**파일:** `src/screens/inventory-screen.ts` (신규), `src/main.ts` (수정)

**스펙 (기획 외 자체 디자인):**
```
┌──────────────────────────────┐
│ ← 뒤로    🎒 내 아이템       │
├──────────────────────────────┤
│  도구 보유 현황               │
│  ┌──────┐┌──────┐┌──────┐   │
│  │  🚀  ││  💣  ││  🌈  │   │
│  │ ×N   ││ ×N   ││ ×N   │   │
│  │ 로켓 ││ 폭탄 ││무지개│   │
│  └──────┘└──────┘└──────┘   │
├──────────────────────────────┤
│  도구 사용 안내               │
│  "게임 화면 하단 도구바에서   │
│   사용할 수 있어요!"          │
└──────────────────────────────┘
```

- [ ] **Step 1**: `src/screens/inventory-screen.ts` 신규 작성
- [ ] **Step 2**: ToolManager에서 각 도구 개수 읽기
- [ ] **Step 3**: 3칸 카드 UI (도구 이모지 + 개수 + 이름)
- [ ] **Step 4**: 뒤로가기 → `screen:change { screen: 'map' }` emit
- [ ] **Step 5**: main.ts `case 'inventory':` 라우팅 추가 (임시 div → 실제 InventoryScreen)
- [ ] **Step 6**: `npm run build` 확인

---

## Chunk 9 — 사운드 시스템

### Cycle 9: 사운드 (sound-manager.ts + 파일 다운로드)

**파일:** `src/audio/sound-manager.ts` (신규), `public/audio/*.mp3` (신규)

**다운로드할 사운드 파일 (freesound.org):**

| 파일명 | 설명 | 검색 키워드 |
|--------|------|-------------|
| `block-pop.mp3` | 블록 터짐 (0.08초) | "pop bubble short" |
| `swap.mp3` | 블록 스왑 (0.1초) | "woosh swipe short" |
| `rocket.mp3` | 로켓 도구 (0.3초) | "rocket whoosh" |
| `bomb.mp3` | 폭탄 도구 (0.3초) | "explosion retro" |
| `rainbow.mp3` | 무지개 도구 (0.5초) | "magic sparkle" |
| `clear.mp3` | 레벨 클리어 (1.5초) | "victory fanfare short" |
| `fail.mp3` | 레벨 실패 (1초) | "fail sad" |
| `star.mp3` | 별 획득 (0.2초) | "star ding" |

**SoundManager 인터페이스:**
```typescript
export class SoundManager {
  private static instance: SoundManager
  private sounds: Map<string, AudioBuffer> = new Map()
  private ctx: AudioContext | null = null

  static getInstance(): SoundManager { ... }
  async preload(): Promise<void> { ... }
  play(name: string, pitchMultiplier = 1.0): void { ... }
}
```

**연결 포인트:**
- 블록 터짐: `board-renderer.ts` animatePop() 시점
- 스왑: board-renderer.ts animateSwap()
- 도구: game-screen.ts 도구 사용 시
- 클리어/실패: game-screen.ts level-complete/fail 시
- 연쇄 x2~x5: effects-canvas.ts showText() 시

- [ ] **Step 1**: freesound.org에서 8개 파일 다운로드 → `public/audio/`에 저장
- [ ] **Step 2**: `src/audio/sound-manager.ts` 신규 작성
- [ ] **Step 3**: main.ts에서 앱 시작 시 `soundManager.preload()` 호출
- [ ] **Step 4**: board-renderer.ts에 `soundManager.play('block-pop')` 연결
- [ ] **Step 5**: game-screen.ts에 rocket/bomb/rainbow/clear/fail 사운드 연결
- [ ] **Step 6**: effects-canvas.ts에 연쇄 사운드 연결 (pitch: x2=1.15, x3=1.30, x4=1.45)
- [ ] **Step 7**: `npm run build` 확인

---

## Chunk 10 — 버그픽스 사이클

### Cycle 10: 종합 검증 + 버그픽스

이전 9사이클 구현 완료 후 localhost:3000에서 전체 플로우 점검:

**체크리스트:**
- [ ] 커버 화면: 서브로고, 슬로건, 6×4 그리드, 소셜 라인 표시 정상
- [ ] 맵 화면: 잠금 🔒, 마스콧 🐥, "플레이!" 태그, 아이템 버튼 동작
- [ ] HUD: 조각 N/5 숫자, 하트 회복 타이머 표시
- [ ] 게임 화면: ⏸ 버튼, 팝업, 일시정지 복구, 이동수 긴박 연출
- [ ] 클리어 화면: 조각 박스, 5/5 뽑기 CTA
- [ ] 실패 화면: "아깝다!", 아이템 쇼케이스, 하트0 팝업
- [ ] 뽑기: 릴 연출, 결과 화면 (도구/쿠폰/치킨), Near-miss
- [ ] 띠배너: 모든 화면에 표시, 5~10초 텍스트 교체
- [ ] 인벤토리: 맵에서 진입, 도구 개수 표시
- [ ] 사운드: 블록 터짐, 스왑, 도구, 클리어, 실패 재생
- [ ] `npm run test` 전체 통과
- 발견된 버그 → 이 사이클에서 수정
