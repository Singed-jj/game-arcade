# Food Crush 2

Match-3 음식 퍼즐 게임. TypeScript + Tailwind CSS 웹 앱.

## 빌드 명령어

- `npm run dev` — 개발 서버 (localhost:3000)
- `npm run build` — tsc + vite build → dist/
- `npm run test` — vitest 테스트
- `npm run test:watch` — vitest watch 모드

## 기술 스택

- TypeScript, Vite 7, Tailwind CSS 4, Vitest
- Canvas 2D (이펙트 레이어)
- DOM + CSS Grid (보드 렌더링)

## 프로젝트 구조

- `src/core/` — 순수 게임 로직 (DOM 의존 없음, 단위 테스트 대상)
- `src/state/` — 상태 관리 (이벤트 버스, 게임 상태, 저장)
- `src/render/` — 렌더링 (보드, 블록, 이펙트)
- `src/screens/` — 화면 컴포넌트 (커버, 맵, 게임, 결과, 뽑기)
- `src/ui/` — 공통 UI (HUD, 도구바, 팝업)

## 게임 규칙

- 7x7 보드, 블록 5종 (치킨/콜라/감튀/버거/피자)
- 도구 3종: 로켓(1행 제거), 폭탄(3x3), 무지개(같은 종류 전부)
- 하트 3개, 20분 회복, 클리어 시 뽑기 조각 +1
- 뽑기 조각 5개 = 뽑기 1회
- 레벨 1~10 수동 설계, 11+ 무한 자동 생성
- 별 기준: 남은 이동 0=1별, 1~3=2별, 4+=3별
