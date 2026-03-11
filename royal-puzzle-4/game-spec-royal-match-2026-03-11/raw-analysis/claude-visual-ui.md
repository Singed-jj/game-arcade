# Visual & UI Analysis — Royal Match

## 1. Art Style
- **Visual style**: Cartoon/3D-rendered — 밝고 풍부한 색감의 3D 캐릭터와 환경
- **Art quality**: AAA 모바일 수준 — 고품질 3D 렌더링 캐슬 (frame-022, 023)
- **Visual consistency**: 매우 높음 — 모든 화면에서 일관된 중세 판타지 테마
- **Character design**: King 캐릭터 — 보라색 로브, 왕관, 큰 수염, 친근한 표정 (frames 015, 016, 017, 019-21)
- **Object design**: 둥근 모서리의 보석/타일, 3D 입체감 있는 부스터 아이콘

## 2. Color Palette
- **Primary**: 로열 블루 `#1a3a8a` (배경, UI 프레임), 골드 `#f0a830` (텍스트, 장식)
- **Accent**: 그린 `#4caf50` (버튼), 레드 `#e53935` (닫기/경고)
- **타일 색상**: Red `#d32f2f`, Blue `#1976d2`, Green `#388e3c`, Yellow/Gold `#ffc107`, Pink `#e91e63`
- **배경**: 하늘색 그라데이션 `#87ceeb` → `#4a90d9` (야외), 어두운 네이비 `#0d1b3e` (Team/실내)
- **UI 프레임**: 금색 테두리 + 파란 배경 패널
- **Color psychology**: 따뜻하고 활기찬 — 로열/프리미엄 느낌 (금+보라)

## 3. UI Layout

### HUD (게임 중)
- **상단 좌측**: Target (목표 아이콘 + 수량) (frames 15, 17, 19-21)
- **상단 중앙**: King 아바타 (원형 프레임)
- **상단 우측**: Moves (남은 이동 수)
- **하단**: 5개 부스터 버튼 (원형, 잠금 아이콘) + 설정 기어

### Nightmare 모드 HUD
- **상단**: 씬 이미지 (왕 위험 상황)
- **중단**: 타이머 (원형) + 목표 진행바 (n/n) + 특수 아이템
- **하단**: 게임 보드 (frames 008, 018)

### 홈 화면 (frame-022)
- **상단 바**: 코인 | 레벨 | 라이프("Full") | 별 | 설정
- **중앙**: 3D 캐슬 뷰
- **하단 좌**: King's Nightmare 버튼
- **하단 우**: Area 진행 (4/6) + 보상 상자
- **최하단**: 5탭 네비게이션 바

### 화면 비율
- **게임 영역**: ~65-70% (보드)
- **UI 영역**: ~30-35% (HUD + 부스터)

## 4. Typography
- **Title/Header**: 볼드 세리프 + 금색 외곽선 + 그림자 ("Royal Match!", "Teams", "Castle")
- **Body**: 둥근 산세리프 (흰색, 볼드)
- **Numbers**: 큰 사이즈 볼드 (Moves: 28, Target 수치)
- **Button text**: 볼드 흰색 ("Play", "Skip", "Continue", "Claim", "Join")
- **Readability**: 매우 좋음 — 높은 대비, 큰 사이즈, 외곽선/그림자 효과

## 5. Icons & Symbols
- **Style**: 3D 렌더링, 풍부한 색감, 그림자 효과
- **타일 아이콘**: 각 5색 보석은 고유 형태 (방패, 왕관, 나뭇잎, 다이아, 정사각형)
- **부스터 아이콘**: TNT(폭발), Rocket(줄무늬 구), Light Ball(무지개 구) — 모두 3D
- **UI 아이콘**: 트로피, 성, 방패, 카드, 기어 — 일관된 금+파란 테마
- **Badge**: 빨간 원형 숫자 배지 (Area 1에 "1" 알림, frame-022)

## 6. Animation & Effects (프레임에서 추론)
- **매치 이펙트**: 타일 파괴 시 파티클 분산 (frame-018: 얼음/결정 파편)
- **부스터 활성화**: 폭발 이펙트 (TNT/Rocket 생성 시 별 모양 이펙트, frames 005-007)
- **레벨 클리어**: 별이 쿠션 위에 놓이는 연출 + 반짝이 파티클 (frame-013)
- **시작 연출**: 나팔 + 불꽃놀이 + "Royal Match!" 로고 (frame-017)
- **코인 드롭**: 코인이 떨어지는 애니메이션 (frame-022: 코인 낙하 중)

## 7. Screen Orientation & Aspect Ratio
- **Orientation**: Portrait (세로) 전용
- **Aspect ratio**: ~9:16 (모바일 표준)
- **Device target**: 모바일 (Phone 최적화, Tablet 호환)
- **Safe area**: 상단 상태바 영역 확보됨
