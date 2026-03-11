# Game Arcade

캐주얼 웹 게임 모노레포 (Godot 4).

## 게임 목록

| 게임 | 설명 | 상태 |
|------|------|------|
| royal-puzzle-4 | Royal Puzzle 시리즈 4탄 | 미착수 |
| block-blast-2 | Block Blast 시리즈 2탄 | 미착수 |
| township | Township 스타일 게임 | 미착수 |
| last-war-survival | Last War Survival | 미착수 |

## 구조

각 게임은 독립적인 Godot 4 프로젝트이며, `export/` 폴더의 HTML5 빌드를 Vercel로 배포합니다.

## 배포

- 각 게임별 Vercel 프로젝트가 연결되어 있음
- 변경된 게임 디렉토리만 자동 배포 (Ignored Build Step 설정)
- COOP/COEP 헤더는 각 `export/vercel.json`에서 설정
