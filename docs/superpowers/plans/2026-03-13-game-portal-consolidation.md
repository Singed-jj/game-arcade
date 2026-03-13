# Game Portal Consolidation Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** game-portal 레포의 정적 파일을 game-arcade 모노레포의 `portal/` 디렉토리로 이관하고, game-arcade의 기존 deploy.yml에 portal 감지/배포 job만 추가한다.

**Architecture:** 기존 CI/CD 워크플로우(개별 게임 레포 자체 workflow, game-arcade monorepo workflow)는 일절 수정하지 않는다. game-arcade `deploy.yml`에 portal에 해당하는 outputs/loop/job을 추가하는 것이 전부다. 포털은 기존 game-portal Vercel 프로젝트(game-portal-teal.vercel.app)에 그대로 배포된다.

**Tech Stack:** GitHub Actions, Vercel CLI, Static HTML/CSS/JS

---

## 현재 CI/CD 구조 (건드리지 않음)

```
royal-puzzle-3/
  .github/workflows/deploy.yml    ← 개별 레포 자체 workflow (Godot 빌드 → Vercel) ✅ 유지

block-blast/
  .github/workflows/deploy.yml    ← 개별 레포 자체 workflow (Godot CI → Vercel) ✅ 유지

game-arcade/
  .github/workflows/deploy.yml    ← 모노레포 workflow (6개 게임 변경 감지 → 각각 Vercel) ✅ 유지 + portal 추가
```

## 변경 범위 (최소)

```
game-arcade/
  portal/                         ← NEW: game-portal 파일 이관
    index.html
    style.css
    main.js
    games.json
  .github/workflows/deploy.yml    ← MODIFY: portal 감지/배포 job만 추가 (기존 6개 job 유지)
```

## 파일 구조

| 파일 | 작업 | 비고 |
|------|------|------|
| `portal/index.html` | 생성 | game-portal에서 복사, 변경 없음 |
| `portal/style.css` | 생성 | game-portal에서 복사, 변경 없음 |
| `portal/main.js` | 생성 | game-portal에서 복사, 변경 없음 |
| `portal/games.json` | 생성+수정 | game-portal 복사 후 URL/항목 업데이트 |
| `.github/workflows/deploy.yml` | 수정 | portal 관련 4곳만 추가 (삭제 없음) |

---

## Chunk 1: portal/ 디렉토리 구성

### Task 1: portal/ 정적 파일 생성

**Files:**
- Create: `portal/index.html`
- Create: `portal/style.css`
- Create: `portal/main.js`
- Create: `portal/games.json`

- [ ] **Step 1: portal/index.html 생성**

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Game Portal</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header>
    <h1>Game Portal</h1>
    <p>토이 프로젝트 게임 모음</p>
  </header>
  <main id="games-grid" class="games-grid"></main>
  <script src="main.js"></script>
</body>
</html>
```

- [ ] **Step 2: portal/style.css 생성**

game-portal/style.css 파일을 읽어서 내용 그대로 복사.

- [ ] **Step 3: portal/main.js 생성**

```javascript
async function loadGames() {
  const res = await fetch('./games.json');
  const games = await res.json();
  const grid = document.getElementById('games-grid');

  grid.innerHTML = games.map(game => `
    <a href="${game.url}" target="_blank" rel="noopener" class="game-card">
      <h2>${game.name}</h2>
      <p>${game.description}</p>
      <div class="tags">
        ${game.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
      </div>
    </a>
  `).join('');
}

loadGames();
```

- [ ] **Step 4: portal/games.json 생성**

기존 game-portal/games.json 기반으로 food-crush-2 항목 추가, URL이 있는 게임은 그대로 유지.

> **주의**: royal-puzzle-4, block-blast-2, food-crush-2, township, last-war-survival의 Vercel URL은
> 아직 미배포 상태. URL 확정 후 이 파일만 수정하면 다음 push 때 포털이 자동 재배포됨.

```json
[
  {
    "name": "Royal Puzzle",
    "description": "탈출! 곰사원 - Match-3 퍼즐",
    "url": "https://royal-puzzle.vercel.app",
    "tags": ["puzzle", "match-3", "phaser"]
  },
  {
    "name": "Royal Puzzle 2",
    "description": "Gem Match-3 퍼즐",
    "url": "https://royal-puzzle-2.vercel.app",
    "tags": ["puzzle", "match-3", "phaser"]
  },
  {
    "name": "Royal Puzzle 3",
    "description": "Match-3 퍼즐 (Godot 4)",
    "url": "https://royal-puzzle-3.vercel.app",
    "tags": ["puzzle", "match-3", "godot"]
  },
  {
    "name": "Royal Puzzle 4",
    "description": "Royal Puzzle 시리즈 4탄 (Godot 4)",
    "url": "",
    "tags": ["puzzle", "godot"]
  },
  {
    "name": "Food Crush",
    "description": "Match-3 음식 퍼즐 (두잇 프로모션)",
    "url": "https://food-crush-blue.vercel.app",
    "tags": ["puzzle", "match-3", "godot"]
  },
  {
    "name": "Food Crush 2",
    "description": "Match-3 음식 퍼즐 2탄 (TypeScript + Vite)",
    "url": "",
    "tags": ["puzzle", "match-3", "typescript"]
  },
  {
    "name": "Block Blast",
    "description": "8x8 블록 배치 퍼즐",
    "url": "https://block-blast-lake.vercel.app",
    "tags": ["puzzle", "block", "godot"]
  },
  {
    "name": "Block Blast 2",
    "description": "Block Blast 시리즈 2탄 (Godot 4)",
    "url": "",
    "tags": ["puzzle", "block", "godot"]
  },
  {
    "name": "Township",
    "description": "Township 스타일 게임 (Godot 4)",
    "url": "",
    "tags": ["simulation", "godot"]
  },
  {
    "name": "Last War Survival",
    "description": "Last War Survival (Godot 4)",
    "url": "",
    "tags": ["survival", "godot"]
  }
]
```

- [ ] **Step 5: 로컬 동작 확인**

```bash
cd /Users/jaejin/projects/toy/game-arcade/portal
python3 -m http.server 8080
# http://localhost:8080 → 게임 카드 10개 렌더링 확인
```

- [ ] **Step 6: 커밋**

```bash
git add portal/
git commit -m "feat: add portal/ directory with game-portal static files"
```

---

## Chunk 2: deploy.yml에 portal 추가 (4곳만 수정)

### Task 2: deploy.yml 최소 수정

**Files:**
- Modify: `.github/workflows/deploy.yml`

기존 6개 game job은 **전혀 건드리지 않는다**. 아래 4곳만 추가/수정.

---

#### 수정 1: workflow_dispatch options에 `portal` 추가

현재:
```yaml
        options:
          - ''
          - food-crush
          - food-crush-2
          - block-blast-2
          - royal-puzzle-4
          - township
          - last-war-survival
```

변경 후:
```yaml
        options:
          - ''
          - food-crush
          - food-crush-2
          - block-blast-2
          - royal-puzzle-4
          - township
          - last-war-survival
          - portal
```

---

#### 수정 2: detect-changes job outputs에 `portal` 추가

현재:
```yaml
    outputs:
      food-crush: ${{ steps.changes.outputs.food-crush }}
      food-crush-2: ${{ steps.changes.outputs.food-crush-2 }}
      block-blast-2: ${{ steps.changes.outputs.block-blast-2 }}
      royal-puzzle-4: ${{ steps.changes.outputs.royal-puzzle-4 }}
      township: ${{ steps.changes.outputs.township }}
      last-war-survival: ${{ steps.changes.outputs.last-war-survival }}
```

변경 후:
```yaml
    outputs:
      food-crush: ${{ steps.changes.outputs.food-crush }}
      food-crush-2: ${{ steps.changes.outputs.food-crush-2 }}
      block-blast-2: ${{ steps.changes.outputs.block-blast-2 }}
      royal-puzzle-4: ${{ steps.changes.outputs.royal-puzzle-4 }}
      township: ${{ steps.changes.outputs.township }}
      last-war-survival: ${{ steps.changes.outputs.last-war-survival }}
      portal: ${{ steps.changes.outputs.portal }}
```

---

#### 수정 3: Detect changed games for 루프에 `portal` 추가

현재:
```bash
          for game in food-crush food-crush-2 block-blast-2 royal-puzzle-4 township last-war-survival; do
```

변경 후:
```bash
          for game in food-crush food-crush-2 block-blast-2 royal-puzzle-4 township last-war-survival portal; do
```

---

#### 수정 4: deploy-portal job 추가 (파일 끝에 append)

```yaml
  deploy-portal:
    name: Deploy portal
    needs: detect-changes
    if: needs.detect-changes.outputs.portal == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install -g vercel@latest
      - run: vercel pull --yes --environment=production --token ${{ secrets.VERCEL_TOKEN }} --cwd portal/
        env:
          VERCEL_ORG_ID: ${{ env.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID_PORTAL }}
      - run: vercel deploy --prod --yes --token ${{ secrets.VERCEL_TOKEN }} --cwd portal/
        env:
          VERCEL_ORG_ID: ${{ env.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID_PORTAL }}
```

---

- [ ] **Step 1: 수정 1~3 적용 (Edit 툴로 3번)**
- [ ] **Step 2: 수정 4 적용 (파일 끝에 deploy-portal job append)**
- [ ] **Step 3: yml 문법 확인**

```bash
# yamllint 없으면 python으로 간단 확인
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/deploy.yml'))" && echo "OK"
```

Expected: `OK`

- [ ] **Step 4: 커밋**

```bash
git add .github/workflows/deploy.yml
git commit -m "feat: add portal detection and deployment to CI/CD pipeline"
```

---

## Chunk 3: 수동 작업 체크리스트

코드 변경과 별개로 사람이 직접 수행해야 하는 작업.

### Task 3: GitHub Secret 등록

- [ ] **Step 1: game-arcade 레포에 Secret 추가**

URL: `https://github.com/[owner]/game-arcade/settings/secrets/actions`

| Secret 이름 | 값 | 비고 |
|-------------|-----|------|
| `VERCEL_PROJECT_ID_PORTAL` | `prj_iTgmyg4NDmnDfm04mwpWcPPs1rRt` | game-portal 기존 프로젝트 ID |

### Task 4: Vercel game-portal 프로젝트 Git 연결 해제 (선택)

- [ ] **Step 1**: Vercel 대시보드 → game-portal 프로젝트 → Settings → Git → Disconnect

> game-portal 레포가 Vercel에 Git 자동 배포로 연결되어 있으면, game-arcade에서 배포할 때 충돌 가능.
> Vercel의 자동 Git 배포를 비활성화하거나 game-portal 레포를 Archive하면 해결.

### Task 5: 최초 배포 테스트

- [ ] **Step 1**: game-arcade push 또는 workflow_dispatch (game: `portal`) 실행
- [ ] **Step 2**: `https://game-portal-teal.vercel.app` 접속 → 포털 정상 표시 확인
- [ ] **Step 3**: 게임 카드 클릭 → 각 게임 URL 연결 확인

---

## 완료 후 정리 (선택)

- [ ] game-portal GitHub 레포 Archive
- [ ] 로컬 game-portal 디렉토리는 참조용 유지 또는 삭제

---

## 위험 요소 요약

| 항목 | 위험 | 대응 |
|------|------|------|
| Vercel Git auto-deploy | game-portal 레포 push 시 Vercel이 자동 배포하면 game-arcade CI와 충돌 | Vercel에서 Git 연결 해제 |
| VERCEL_PROJECT_ID_PORTAL Secret 미등록 | deploy-portal job 실패 | Chunk 3 Task 3 먼저 수행 |
| portal/ 경로 변경 감지 | `portal/` 하위 파일 변경 시에만 트리거됨 (정상) | games.json URL 추가 시 자동 트리거됨 |
| 기존 6개 game job | 기존 코드 일절 수정 안 하므로 영향 없음 | - |
