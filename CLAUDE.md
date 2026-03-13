# game-arcade 워크스페이스

캐주얼 웹 게임 모노레포. 게임 목록은 아래 인덱스 참조.

## 게임 목록

| 별칭 | 디렉토리 | 설명 | 상태 |
|------|----------|------|------|
| food-crush | `food-crush/` | Food Crush - Match-3 음식 퍼즐 (Godot 4, 두잇 프로모션) | 이전완료 |
| food-crush-2 | `food-crush-2/` | Food Crush 2 - Match-3 음식 퍼즐 (TypeScript + Vite) | 진행중 |
| royal-puzzle-4 | `royal-puzzle-4/` | Royal Puzzle 4 (Godot 4) | 미착수 |
| block-blast-2 | `block-blast-2/` | Block Blast 2 (Godot 4) | 미착수 |
| township | `township/` | Township 스타일 게임 (Godot 4) | 미착수 |
| last-war-survival | `last-war-survival/` | Last War Survival 전략 시뮬레이션 (Godot 4) | 미착수 |

## Obsidian 프로젝트 상태 추적

game-arcade 내 게임에 변경을 가할 때마다 Dropbox tree vault에 상태를 기록한다.

### 경로
- **vault**: `/Users/jaejin/Library/CloudStorage/Dropbox/tree/toy/`
- **메인 문서**: `toy/game-arcade/{game-name}.md`
- **세션 문서**: `toy/game-arcade/{game-name}/{session-id}.md`

### 세션 ID
- plan 파일명에서 추출 (예: `structured-wibbling-crayon`)
- plan 파일이 없으면 `date +%Y-%m-%d_%H%M` 형식 사용

### 워크플로우
1. **작업 중**: 세션 sub-document(`toy/game-arcade/{game-name}/{session-id}.md`)에 변경 이력 기록
2. **작업 완료 시**: sub-document 내용을 메인 문서(`toy/game-arcade/{game-name}.md`)의 변경 이력 테이블에 병합
3. **병합 후**: sub-document 삭제

### 메인 문서 형식
```md
# {게임명}

## 기본 정보
- **경로**: `~/projects/toy/game-arcade/{dir}/`
- **스택**: {기술 스택}
- **상태**: {현재 상태}

## 변경 이력
| 날짜 | 변경 내용 | 세션 |
|------|----------|------|
| 2026-03-13 | 초기 등록 | - |
```

### 세션 문서 형식
```md
# {session-id} 세션 변경 로그

- **프로젝트**: {game-name}
- **시작**: {날짜}

## 변경 내역
| 시점 | 변경 내용 |
|------|----------|
| ... | ... |
```
