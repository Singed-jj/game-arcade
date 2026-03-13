# 게임 폴리시 — 이펙트/성능/햅틱/스왑개선 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 기획 문서(food-crush-assets-and-effects.html) 기반 미구현 이펙트/사운드/햅틱 구현 + 스왑 입력 개선 + DOM 렌더링 성능 최적화

**Architecture:** DOM 기반 렌더링 구조 유지(PixiJS 불필요), BlockView의 left/top → transform: translate() 전환으로 GPU compositor 활용, pointermove 기반 즉시 스왑 인식으로 반응성 향상, HapticManager 신규 추가

**Tech Stack:** TypeScript, CSS @keyframes (style.css), Canvas 2D (EffectsCanvas), Web Vibration API (navigator.vibrate), Web Audio API (SoundManager 기존 활용)

---

## Chunk 1: 파일명 변경 + 성능/스왑 수정

> 독립적으로 커밋 및 테스트 가능. BlockView GPU 전환 + 스왑 반응성 향상.

### Task 1: 파일명 변경 + CLAUDE.md 업데이트

**Files:** `docs/food-crush-assets.html` → `docs/food-crush-assets-and-effects.html`, `CLAUDE.md`

- [ ] **1.1** 파일명 변경
  ```bash
  mv food-crush-2/docs/food-crush-assets.html food-crush-2/docs/food-crush-assets-and-effects.html
  ```

- [ ] **1.2** `CLAUDE.md`에서 `food-crush-assets.html` → `food-crush-assets-and-effects.html` 참조 업데이트 (3군데)

- [ ] **1.3** 빌드 확인
  ```bash
  cd /Users/jaejin/projects/toy/game-arcade; and bun run build:food-crush-2
  ```

---

### Task 2: BlockView 렌더링 성능 최적화

**Files:** `src/render/block-view.ts`, `src/styles/style.css` (또는 인라인 스타일)

- [ ] **2.1** constructor에서 className 변경: `transition-all` → `transition-transform`
  ```typescript
  // Before:
  this.el.className = 'absolute transition-all duration-150 ease-out rounded-xl...'
  // After:
  this.el.className = 'absolute transition-transform duration-150 ease-out rounded-xl shadow-lg flex items-center justify-center'
  ```

- [ ] **2.2** constructor에서 GPU 힌트 + 초기 위치 설정
  ```typescript
  this.el.style.willChange = 'transform'
  this.el.style.contain = 'layout style'
  this.el.style.left = '0'
  this.el.style.top = '0'
  ```

- [ ] **2.3** `updatePosition()` 메서드를 `transform: translate()` 방식으로 변경
  ```typescript
  updatePosition(): void {
    const x = this.pos.col * CELL_SIZE + 3
    const y = this.pos.row * CELL_SIZE + 3
    this.el.style.setProperty('--block-x', `${x}px`)
    this.el.style.setProperty('--block-y', `${y}px`)
    this.el.style.transform = `translate(${x}px, ${y}px)`
  }
  ```

- [ ] **2.4** `setSelected()` 메서드 변경 — transform 충돌 방지 (scale 대신 outline + brightness)
  ```typescript
  setSelected(selected: boolean): void {
    this.el.style.outline = selected ? '3px solid rgba(255,255,255,0.9)' : ''
    this.el.style.outlineOffset = '1px'
    this.el.style.zIndex = selected ? '10' : ''
    this.el.style.filter = selected ? 'brightness(1.3)' : ''
  }
  ```

- [ ] **2.5** `@keyframes block-drop` 수정 — CSS 변수 기반으로 translate와 호환
  ```css
  @keyframes block-drop {
    0%   { transform: translate(var(--block-x), calc(var(--block-y) + var(--drop-distance))); }
    70%  { transform: translate(var(--block-x), var(--block-y)); }
    80%  { transform: translate(var(--block-x), calc(var(--block-y) - 4px)); }
    90%  { transform: translate(var(--block-x), var(--block-y)); }
    95%  { transform: translate(var(--block-x), calc(var(--block-y) - 1px)); }
    100% { transform: translate(var(--block-x), var(--block-y)); }
  }
  ```

- [ ] **2.6** `animateDrop()` 메서드가 `--block-x`, `--block-y` CSS 변수를 활용하도록 확인 및 수정. `animateDrop` 완료 후 `updatePosition()` 호출 시 transform이 정상 반영되는지 확인.

- [ ] **2.7** `animateSwap()`에서 `updatePosition()`이 transform을 설정 → CSS transition이 자동 적용되는지 확인.

- [ ] **2.8** 빌드 + 브라우저 확인
  ```bash
  cd /Users/jaejin/projects/toy/game-arcade; and bun run build:food-crush-2
  ```

---

### Task 3: BoardRenderer 스왑 인식 개선

**Files:** `src/render/board-renderer.ts`

- [ ] **3.1** `cachedRect` 필드 추가 + `posFromEvent` 캐싱 적용
  ```typescript
  private cachedRect: DOMRect | null = null

  private posFromEvent(e: PointerEvent): Position | null {
    if (!this.cachedRect) this.cachedRect = this.boardEl.getBoundingClientRect()
    const rect = this.cachedRect
    const col = Math.floor((e.clientX - rect.left) / CELL_SIZE)
    const row = Math.floor((e.clientY - rect.top) / CELL_SIZE)
    if (col < 0 || col >= BOARD_COLS || row < 0 || row >= BOARD_ROWS) return null
    return { col, row }
  }
  ```

- [ ] **3.2** resize 이벤트에서 캐시 무효화
  ```typescript
  window.addEventListener('resize', () => { this.cachedRect = null })
  ```

- [ ] **3.3** `setupInput()` 재작성 — pointermove 기반 즉시 스왑
  ```typescript
  private setupInput(): void {
    let startPos: Position | null = null
    let startPixel: { x: number; y: number } | null = null
    let swapFired = false
    const SWIPE_THRESHOLD = CELL_SIZE / 3  // ~15px

    this.boardEl.addEventListener('pointerdown', (e) => {
      if (this.inputLocked) return
      startPos = this.posFromEvent(e)
      startPixel = { x: e.clientX, y: e.clientY }
      swapFired = false
      this.boardEl.setPointerCapture(e.pointerId)
    })

    this.boardEl.addEventListener('pointermove', (e) => {
      if (this.inputLocked || !startPos || !startPixel || swapFired) return
      const dx = e.clientX - startPixel.x
      const dy = e.clientY - startPixel.y

      let direction: Position | null = null
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_THRESHOLD) {
        direction = { col: startPos.col + Math.sign(dx), row: startPos.row }
      } else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > SWIPE_THRESHOLD) {
        direction = { col: startPos.col, row: startPos.row + Math.sign(dy) }
      }

      if (direction && direction.col >= 0 && direction.col < BOARD_COLS &&
          direction.row >= 0 && direction.row < BOARD_ROWS) {
        swapFired = true
        if (this.toolMode) {
          eventBus.emit('board:cell-tapped', { col: startPos.col, row: startPos.row })
        } else {
          eventBus.emit('board:swap-requested', { from: startPos, to: direction })
        }
        startPos = null
      }
    })

    this.boardEl.addEventListener('pointerup', (e) => {
      if (this.inputLocked) { startPos = null; return }
      if (!startPos || swapFired) { startPos = null; return }

      const endPos = this.posFromEvent(e)
      if (endPos && endPos.col === startPos.col && endPos.row === startPos.row) {
        // tap
        eventBus.emit('board:cell-tapped', { col: endPos.col, row: endPos.row })
        if (!this.toolMode) {
          if (this.selectedPos) {
            this.blocks.get(this.key(this.selectedPos.col, this.selectedPos.row))?.setSelected(false)
            const sdx = endPos.col - this.selectedPos.col
            const sdy = endPos.row - this.selectedPos.row
            if (Math.abs(sdx) + Math.abs(sdy) === 1) {
              eventBus.emit('board:swap-requested', { from: this.selectedPos, to: endPos })
            }
            this.selectedPos = null
          } else {
            this.selectedPos = endPos
            this.blocks.get(this.key(endPos.col, endPos.row))?.setSelected(true)
          }
        }
      }
      startPos = null
    })

    this.boardEl.addEventListener('pointercancel', () => {
      startPos = null
      startPixel = null
      swapFired = false
    })
  }
  ```

- [ ] **3.4** 기존 `pointerdown`/`pointerup` 핸들러 제거 확인 (중복 방지)

- [ ] **3.5** 빌드 + 브라우저 스왑 테스트
  ```bash
  cd /Users/jaejin/projects/toy/game-arcade; and bun run build:food-crush-2
  ```

- [ ] **3.6** Chunk 1 커밋
  ```bash
  cd /Users/jaejin/projects/toy/game-arcade; and git add -A; and git commit -m "food-crush-2: 파일명 변경 + BlockView GPU transform + pointermove 스왑"
  ```

---

## Chunk 2: 미구현 이펙트

> 독립적으로 커밋 및 테스트 가능. 기획 문서 B파트 이펙트 전체 구현.

### Task 4: EffectsCanvas 신규 메서드 + RAF 최적화

**Files:** `src/render/effects-canvas.ts`

- [ ] **4.1** `boardOffsetX`, `boardOffsetY`를 public getter로 노출 + `boardCenterX`, `boardCenterY` 추가
  ```typescript
  get boardOffsetX(): number { return (this.canvas.width - BOARD_COLS * CELL_SIZE) / 2 }
  get boardOffsetY(): number { return (this.canvas.height - BOARD_ROWS * CELL_SIZE) / 2 }
  get boardCenterX(): number { return this.canvas.width / 2 }
  get boardCenterY(): number { return this.canvas.height / 2 }
  ```

- [ ] **4.2** `flashes` 배열 + `blockFlash()` 메서드 추가 (B-1: 블록 중심 흰색 원형 flash)
  ```typescript
  private flashes: Array<{ x: number; y: number; radius: number; maxRadius: number; life: number }> = []

  blockFlash(pos: Position): void {
    const cx = this.boardOffsetX + pos.col * CELL_SIZE + CELL_SIZE / 2
    const cy = this.boardOffsetY + pos.row * CELL_SIZE + CELL_SIZE / 2
    this.flashes.push({ x: cx, y: cy, radius: 4, maxRadius: 28, life: 1.0 })
  }
  ```

- [ ] **4.3** `drawFlashes()` private 메서드 추가
  ```typescript
  private drawFlashes(): void {
    for (const f of this.flashes) {
      const r = f.maxRadius * (1 - f.life) + f.radius
      this.ctx.globalAlpha = f.life * 0.6
      this.ctx.fillStyle = 'white'
      this.ctx.beginPath()
      this.ctx.arc(f.x, f.y, r, 0, Math.PI * 2)
      this.ctx.fill()
      f.life -= 0.1
    }
    this.flashes = this.flashes.filter(f => f.life > 0)
    this.ctx.globalAlpha = 1
  }
  ```

- [ ] **4.4** `rocketBeam()` 메서드 추가 (B-4: 로켓 빛줄기)
  ```typescript
  rocketBeam(startPos: Position, isHorizontal: boolean, onComplete: () => void): void {
    const offX = this.boardOffsetX
    const offY = this.boardOffsetY
    const boardW = BOARD_COLS * CELL_SIZE
    const boardH = BOARD_ROWS * CELL_SIZE

    let startX: number, startY: number, endX: number, endY: number
    if (isHorizontal) {
      startY = offY + startPos.row * CELL_SIZE + CELL_SIZE / 2
      startX = offX
      endX = offX + boardW
      endY = startY
    } else {
      startX = offX + startPos.col * CELL_SIZE + CELL_SIZE / 2
      startY = offY
      endX = startX
      endY = offY + boardH
    }

    const duration = 300
    const startTime = performance.now()

    const drawBeam = (now: number) => {
      const progress = Math.min(1, (now - startTime) / duration)
      const curX = startX + (endX - startX) * progress
      const curY = startY + (endY - startY) * progress

      const grad = isHorizontal
        ? this.ctx.createLinearGradient(startX, startY, curX, curY)
        : this.ctx.createLinearGradient(startX, startY, curX, curY)
      grad.addColorStop(0, 'rgba(255,200,50,0)')
      grad.addColorStop(0.7, 'rgba(255,200,50,0.8)')
      grad.addColorStop(1, 'rgba(255,255,255,1)')

      this.ctx.globalAlpha = 0.8
      this.ctx.fillStyle = grad
      if (isHorizontal) {
        this.ctx.fillRect(startX, startY - 6, curX - startX, 12)
      } else {
        this.ctx.fillRect(startX - 6, startY, 12, curY - startY)
      }
      this.ctx.globalAlpha = 1

      if (progress < 1) {
        requestAnimationFrame(drawBeam)
      } else {
        onComplete()
      }
    }
    requestAnimationFrame(drawBeam)
  }
  ```

- [ ] **4.5** `rainbowSuckIn()` 메서드 추가 (B-4: 무지개 블록 빨려들어가는 효과)
  ```typescript
  rainbowSuckIn(targetElements: HTMLElement[], centerX: number, centerY: number): Promise<void> {
    return new Promise(resolve => {
      const DURATION = 400
      targetElements.forEach((el, i) => {
        const rect = el.getBoundingClientRect()
        const canvasRect = this.canvas.getBoundingClientRect()
        const elCX = rect.left - canvasRect.left + rect.width / 2
        const elCY = rect.top - canvasRect.top + rect.height / 2
        const dX = centerX - elCX
        const dY = centerY - elCY

        setTimeout(() => {
          el.style.transition = `transform ${DURATION}ms ease-in, opacity ${DURATION}ms ease-in`
          el.style.transform = (el.style.transform || '') + ` translate(${dX}px, ${dY}px) scale(0.1)`
          el.style.opacity = '0'
        }, i * 15)
      })
      setTimeout(resolve, DURATION + targetElements.length * 15)
    })
  }
  ```
  > **주의:** BlockView가 transform으로 위치를 관리하므로, `el.style.transform`에 기존 translate가 있음. 추가 translate를 append하는 방식이므로 `(el.style.transform || '') + ...` 패턴 사용. 대안으로 CSS class 방식도 고려.

- [ ] **4.6** `tick()` 메서드 RAF 최적화 — flashes 통합 + idle skip
  ```typescript
  private tick = (): void => {
    const hasWork = this.particles.length > 0 || this.flashes.length > 0
    if (hasWork) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      this.drawFlashes()
      this.particles = this.particles.filter(p => {
        // ... existing particle drawing code
      })
      this.ctx.globalAlpha = 1
    }
    this.animId = requestAnimationFrame(this.tick)
  }
  ```

- [ ] **4.7** 빌드 확인
  ```bash
  cd /Users/jaejin/projects/toy/game-arcade; and bun run build:food-crush-2
  ```

---

### Task 5: game-screen.ts — animateCascadeStep 업데이트

**Files:** `src/screens/game-screen.ts`

- [ ] **5.1** 캐스케이드 텍스트 + shake + flash 연결 (B-2)
  ```typescript
  private async animateCascadeStep(step: CascadeStep, cascadeIndex: number): Promise<void> {
    // 캐스케이드 텍스트 + shake + bg-flash
    if (cascadeIndex >= 1) {
      const TEXTS = ['', 'Good!', 'Great!!', 'Amazing!!!', 'INCREDIBLE!!!!']
      const COLORS = ['', 'white', '#FFD600', '#FF9A3C', 'rainbow']
      const SIZES = [0, 24, 32, 40, 48]
      const SHAKES = [0, 2, 4, 6, 8]
      const idx = Math.min(cascadeIndex, 4)

      this.effects.showText(
        TEXTS[idx],
        this.effects.boardCenterX,
        this.effects.boardCenterY,
        SIZES[idx],
        COLORS[idx],
      )
      this.shake.shake(SHAKES[idx], 200 + idx * 25)

      if (cascadeIndex >= 2) {
        this.effects.flash('rgba(255,255,255,0.15)')
      }
    }
    // ... rest continues in 5.2
  ```

- [ ] **5.2** 블록 pop + blockFlash + scoreFloat 추가
  ```typescript
    soundManager.play('block-pop', 1.0 + cascadeIndex * 0.12)

    const popPromises: Promise<void>[] = []
    let totalMatched = 0
    for (const match of step.matches) {
      for (const cell of match.cells) {
        this.effects.spawnBlockPop(cell, match.blockType)
        this.effects.blockFlash(cell)           // ← 추가
        const view = this.boardRenderer.getBlock(cell.col, cell.row)
        if (view) popPromises.push(view.animatePop())
      }
      totalMatched += match.cells.length
    }

    // scoreFloat at first matched cell center
    if (step.matches.length > 0 && step.matches[0].cells.length > 0) {
      const firstCell = step.matches[0].cells[0]
      const px = this.effects.boardOffsetX + firstCell.col * CELL_SIZE + CELL_SIZE / 2
      const py = this.effects.boardOffsetY + firstCell.row * CELL_SIZE
      const score = totalMatched * 10 * (cascadeIndex === 0 ? 1 : 1 + cascadeIndex * 0.5)
      this.effects.showScoreFloat(Math.round(score), px, py)
    }

    await Promise.all(popPromises)
    // ... rest of existing code (drops, fills)
  ```

- [ ] **5.3** 빌드 확인
  ```bash
  cd /Users/jaejin/projects/toy/game-arcade; and bun run build:food-crush-2
  ```

---

### Task 6: game-screen.ts — 도구 이펙트 + 잘못된 스왑 + 클리어 sweep

**Files:** `src/screens/game-screen.ts`

- [ ] **6.1** handleCellTap — 폭탄에 shockwave 추가 (B-4)
  ```typescript
  } else if (tool === ToolType.BOMB) {
    soundManager.play('bomb')
    this.shake.shake(5)
    this.effects.flash('rgba(255,140,0,0.25)')
    this.effects.shockwave({ col, row })  // ← 추가
  }
  ```

- [ ] **6.2** handleCellTap — 로켓에 beam 추가 (B-4)
  ```typescript
  if (tool === ToolType.ROCKET) {
    soundManager.play('rocket')
    this.shake.shake(3)
    await new Promise<void>(resolve => {
      this.effects.rocketBeam({ col, row }, true, resolve)
    })
  }
  ```

- [ ] **6.3** handleCellTap — 무지개에 suck-in + flash + shake 추가 (B-4)
  ```typescript
  } else {
    // rainbow
    soundManager.play('rainbow')
    const targetEls = targets
      .map(p => this.boardRenderer.getBlock(p.col, p.row)?.el)
      .filter((el): el is HTMLElement => el !== undefined)
    await this.effects.rainbowSuckIn(
      targetEls,
      this.effects.boardCenterX,
      this.effects.boardCenterY
    )
    this.effects.flash('rgba(180,0,255,0.3)')
    this.shake.shake(6, 300)
    for (const pos of targets) {
      const bt = this.boardLogic.getBlock(pos.col, pos.row)
      if (bt !== -1) this.effects.spawnBlockPop(pos, bt as BlockType)
    }
  }
  ```

- [ ] **6.4** handleSwap — 잘못된 스왑 animate back (B-6)
  ```typescript
  if (!result.valid) {
    // 150ms 대기 후 swap back (시각적 피드백)
    await new Promise(r => setTimeout(r, 150))
    await this.boardRenderer.animateSwap(from, to)
    this.shake.shake(2)
    // ... rest of invalid swap handling
  }
  ```

- [ ] **6.5** 클리어 sweep 메서드 추가 + 호출 (B-5)
  ```typescript
  private async sweepRemainingBlocks(): Promise<void> {
    const board = this.boardLogic.getBoard()
    const SWEEP_DELAY = 80  // ms per row

    for (let row = 0; row < BOARD_ROWS; row++) {
      await new Promise(r => setTimeout(r, SWEEP_DELAY))
      for (let col = 0; col < BOARD_COLS; col++) {
        if (board[col][row] !== EMPTY) {
          const view = this.boardRenderer.getBlock(col, row)
          if (view) {
            this.effects.spawnBlockPop({ col, row }, board[col][row] as BlockType)
            view.animatePop()
          }
        }
      }
    }
    await new Promise(r => setTimeout(r, 300))
  }
  ```
  호출 위치 — `areAllGoalsMet()` 직후, 클리어 화면 전환 전:
  ```typescript
  if (this.gameState.areAllGoalsMet()) {
    await this.sweepRemainingBlocks()
    // ... existing timeout to screen:change
  }
  ```

- [ ] **6.6** 빌드 확인
  ```bash
  cd /Users/jaejin/projects/toy/game-arcade; and bun run build:food-crush-2
  ```

---

### Task 7: GameInfoBar 이동 수 바운스

**Files:** `src/ui/game-info-bar.ts`, `src/styles/style.css` (또는 해당 CSS 파일)

- [ ] **7.1** style.css에 `moves-bounce` keyframes 추가
  ```css
  @keyframes moves-bounce {
    0%   { transform: scale(1); }
    50%  { transform: scale(1.35); }
    100% { transform: scale(1); }
  }
  ```

- [ ] **7.2** `updateMoves()` 에서 바운스 애니메이션 트리거
  ```typescript
  updateMoves(remaining: number): void {
    this.movesEl.textContent = String(remaining)
    // 바운스 애니메이션 트리거
    this.movesEl.style.animation = 'none'
    this.movesEl.offsetHeight  // force reflow
    this.movesEl.style.animation = 'moves-bounce 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)'
    // ... rest of existing code
  }
  ```

- [ ] **7.3** 빌드 + 브라우저 확인
  ```bash
  cd /Users/jaejin/projects/toy/game-arcade; and bun run build:food-crush-2
  ```

- [ ] **7.4** Chunk 2 커밋
  ```bash
  cd /Users/jaejin/projects/toy/game-arcade; and git add -A; and git commit -m "food-crush-2: 미구현 이펙트 전체 구현 (cascade text/shake/flash, blockFlash, rocketBeam, rainbowSuckIn, shockwave, sweep, wrong-swap, moves bounce)"
  ```

---

## Chunk 3: 햅틱

> 독립적으로 커밋 및 테스트 가능. Web Vibration API + iOS webkit bridge.

### Task 8: HapticManager 신규 구현

**Files:** `src/audio/haptic-manager.ts` (신규)

- [ ] **8.1** `HapticEvent` 타입 + 진동 패턴 정의
  ```typescript
  export type HapticEvent =
    | 'swap' | 'wrongSwap'
    | 'match' | 'cascade2' | 'cascade3' | 'cascade4plus'
    | 'rocket' | 'bomb' | 'rainbow'
    | 'clear' | 'fail' | 'star'

  const VIBRATION_PATTERNS: Record<HapticEvent, number | number[]> = {
    swap:         10,
    wrongSwap:    [10, 50, 10],
    match:        15,
    cascade2:     20,
    cascade3:     [15, 30, 25],
    cascade4plus: [15, 20, 15, 20, 30],
    rocket:       [10, 10, 10, 10, 10, 10, 50],
    bomb:         [30, 0, 50],
    rainbow:      [10, 20, 10, 20, 10, 20, 80],
    clear:        [30, 50, 30, 50, 100],
    fail:         [50, 100, 30],
    star:         20,
  }
  ```

- [ ] **8.2** iOS haptic 매핑 정의
  ```typescript
  const IOS_HAPTIC_MAP: Record<HapticEvent, string> = {
    swap: 'light',       wrongSwap: 'soft',    match: 'medium',
    cascade2: 'medium',  cascade3: 'heavy',    cascade4plus: 'rigid',
    rocket: 'rigid',     bomb: 'heavy',        rainbow: 'heavy',
    clear: 'heavy',      fail: 'medium',       star: 'medium',
  }
  ```

- [ ] **8.3** `HapticManager` 싱글턴 클래스 구현
  ```typescript
  export class HapticManager {
    private static _instance: HapticManager
    private enabled = true

    static getInstance(): HapticManager {
      if (!HapticManager._instance) HapticManager._instance = new HapticManager()
      return HapticManager._instance
    }

    trigger(event: HapticEvent): void {
      if (!this.enabled) return

      // iOS webkit bridge
      const webkit = (window as any).webkit
      if (webkit?.messageHandlers?.haptic) {
        webkit.messageHandlers.haptic.postMessage(IOS_HAPTIC_MAP[event])
        return
      }

      // Web Vibration API (Android)
      if (navigator.vibrate) {
        navigator.vibrate(VIBRATION_PATTERNS[event])
      }
    }

    setEnabled(v: boolean): void { this.enabled = v }
  }

  export const hapticManager = HapticManager.getInstance()
  ```

- [ ] **8.4** 빌드 확인
  ```bash
  cd /Users/jaejin/projects/toy/game-arcade; and bun run build:food-crush-2
  ```

---

### Task 9: HapticManager game-screen.ts 연결

**Files:** `src/screens/game-screen.ts`, (선택) `src/screens/clear-screen.ts`

- [ ] **9.1** import 추가
  ```typescript
  import { hapticManager } from '@/audio/haptic-manager'
  ```

- [ ] **9.2** handleSwap에서 스왑 성공/실패 햅틱 추가
  ```typescript
  // 스왑 시작 시:
  soundManager.play('swap')
  hapticManager.trigger('swap')

  // 잘못된 스왑 시:
  this.shake.shake(2)
  hapticManager.trigger('wrongSwap')
  ```

- [ ] **9.3** animateCascadeStep에서 캐스케이드 인덱스 기반 햅틱 추가
  ```typescript
  const hapticEvents: HapticEvent[] = ['match', 'cascade2', 'cascade3', 'cascade4plus']
  hapticManager.trigger(hapticEvents[Math.min(cascadeIndex, 3)])
  ```

- [ ] **9.4** handleCellTap 도구 사용 시 햅틱 추가
  ```typescript
  if (tool === ToolType.ROCKET) { hapticManager.trigger('rocket') }
  else if (tool === ToolType.BOMB) { hapticManager.trigger('bomb') }
  else { hapticManager.trigger('rainbow') }
  ```

- [ ] **9.5** 클리어/실패 시 햅틱 추가
  ```typescript
  // 클리어 성공:
  hapticManager.trigger('clear')

  // 이동 수 소진 (실패):
  hapticManager.trigger('fail')
  ```

- [ ] **9.6** (선택) clear-screen.ts에서 별 표시 시 햅틱 추가
  ```typescript
  import { hapticManager } from '@/audio/haptic-manager'
  // 별 획득 사운드 재생 위치에:
  hapticManager.trigger('star')
  ```

- [ ] **9.7** 빌드 + 기존 테스트 실행
  ```bash
  cd /Users/jaejin/projects/toy/game-arcade; and bun run build:food-crush-2; and bun test
  ```

- [ ] **9.8** Chunk 3 커밋
  ```bash
  cd /Users/jaejin/projects/toy/game-arcade; and git add -A; and git commit -m "food-crush-2: HapticManager 구현 + 전체 게임 이벤트 햅틱 연결"
  ```

---

## 주의사항

### 1. BlockView transform + animateDrop 호환성
- `left/top` → `transform: translate()` 전환 시, CSS `@keyframes block-drop`도 translate 기반으로 수정 필수
- `--block-x`, `--block-y` CSS 변수로 현재 위치를 keyframes에서 참조
- animateDrop 완료 후 `updatePosition()` 호출 시 transform이 정상 반영되는지 확인

### 2. EffectsCanvas public getter
- `boardOffsetX`, `boardOffsetY`는 현재 private method → public getter로 변경 필요
- game-screen.ts에서 점수 float 위치 계산에 사용

### 3. rainbowSuckIn transform 충돌
- BlockView가 `transform: translate()`로 위치 관리 중이므로, rainbowSuckIn에서 추가 translate를 append할 때 기존 transform 문자열에 이어 붙이는 방식 사용
- 대안: CSS class 기반 애니메이션으로 전환 고려

### 4. 테스트 전략
- 기존 38개 단위 테스트는 core/state 레이어 (DOM 없음)
- 성능/이펙트/햅틱 변경은 단위 테스트 불필요 — 브라우저 검증으로 확인
- 빌드 성공 + 기존 테스트 통과가 각 Chunk의 검증 기준

---

## Summary

| Chunk | Tasks | 핵심 내용 |
|-------|-------|----------|
| 1 | Task 1-3 | 파일명 변경, GPU transform 전환, pointermove 스왑 |
| 2 | Task 4-7 | blockFlash, rocketBeam, rainbowSuckIn, cascade 연결, sweep, wrong-swap, moves bounce |
| 3 | Task 8-9 | HapticManager 구현 + 전체 게임 이벤트 연결 |
