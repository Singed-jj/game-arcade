// src/main.ts
import { eventBus } from '@/state/event-bus'
import { GameState } from '@/state/game-state'
import { HeartManager } from '@/state/heart-manager'
import { PieceManager } from '@/state/piece-manager'
import { ToolManager } from '@/state/tool-manager'
import { loadSave, saveSave, type SaveData } from '@/state/save-manager'
import { CoverScreen } from '@/screens/cover-screen'
import { MapScreen } from '@/screens/map-screen'
import { GameScreen } from '@/screens/game-screen'
import { ClearScreen } from '@/screens/clear-screen'
import { FailScreen } from '@/screens/fail-screen'
import { GachaScreen } from '@/screens/gacha-screen'
import { InventoryScreen } from '@/screens/inventory-screen'
import { NoHeartsScreen } from '@/screens/no-hearts-screen'
import { TickerBanner } from '@/ui/ticker-banner'
import { soundManager } from '@/audio/sound-manager'

class App {
  private app: HTMLElement
  private gameState: GameState
  private heartManager: HeartManager
  private pieceManager: PieceManager
  private toolManager: ToolManager
  private save: SaveData
  private currentScreen: string = ''
  private ticker: TickerBanner

  constructor() {
    this.app = document.getElementById('app')!
    this.gameState = new GameState()
    this.heartManager = new HeartManager()
    this.pieceManager = new PieceManager()
    this.toolManager = new ToolManager()
    this.ticker = new TickerBanner()
    this.pieceManager.setToolManager(this.toolManager)
    this.save = loadSave()

    // 상태 복원
    this.heartManager.loadState(this.save.hearts, this.save.heartsLastUsedAt)
    this.pieceManager.loadState(this.save.pieces)
    this.toolManager.loadState(this.save.tools)

    soundManager.preload()
    this.setupEventListeners()
    this.ticker.mount()
    this.changeScreen('cover')
  }

  private setupEventListeners(): void {
    eventBus.on('screen:change', ({ screen, data }) => {
      this.changeScreen(screen, data)
    })

    eventBus.on('game:level-complete', ({ stars }) => {
      const level = this.gameState.getLevel()
      this.save.levelStars[level] = Math.max(this.save.levelStars[level] ?? 0, stars)
      this.save.unlockedLevel = Math.max(this.save.unlockedLevel, level + 1)
      this.pieceManager.addPieces(1)
      this.persistSave()
    })

    eventBus.on('heart:changed', () => this.persistSave())
    eventBus.on('tool:count-changed', () => this.persistSave())

    // 주기적 저장
    setInterval(() => this.persistSave(), 30000)
  }

  private changeScreen(screen: string, data?: Record<string, unknown>): void {
    this.app.innerHTML = ''
    this.currentScreen = screen

    switch (screen) {
      case 'cover':
        new CoverScreen(this.app)
        break
      case 'map':
        new MapScreen(this.app, this.save, this.heartManager, this.pieceManager)
        break
      case 'game':
        new GameScreen(this.app, this.gameState, this.heartManager, this.toolManager, data)
        break
      case 'clear':
        new ClearScreen(this.app, this.pieceManager, data)
        break
      case 'fail':
        new FailScreen(this.app, this.heartManager, this.pieceManager, data)
        break
      case 'gacha':
        new GachaScreen(this.app, this.pieceManager, this.toolManager)
        break
      case 'inventory':
        new InventoryScreen(this.app, this.toolManager)
        break
      case 'no-hearts':
        new NoHeartsScreen(this.app, this.heartManager, this.pieceManager)
        break
    }
  }

  private persistSave(): void {
    this.save.hearts = this.heartManager.getHearts()
    this.save.heartsLastUsedAt = this.heartManager.getLastUsedAt()
    this.save.pieces = this.pieceManager.getPieces()
    this.save.tools = this.toolManager.toJSON()
    saveSave(this.save)
  }
}

new App();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(window as any).__eb = eventBus
