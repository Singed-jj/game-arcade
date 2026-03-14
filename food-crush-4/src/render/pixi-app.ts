import { Application } from 'pixi.js'
import { gsap } from 'gsap'

let app: Application | null = null
let gsapTickInterval: ReturnType<typeof setInterval> | null = null

/** document.hidden일 때 RAF가 멈추므로 setInterval로 GSAP를 수동 구동 */
function ensureGsapTicker(): void {
  if (gsapTickInterval) return
  gsapTickInterval = setInterval(() => {
    if (document.hidden) gsap.ticker.tick()
  }, 16)
}

export async function initPixiApp(container: HTMLElement): Promise<Application> {
  ensureGsapTicker()
  app = new Application()
  await app.init({
    resizeTo: container,
    backgroundAlpha: 0,
    antialias: true,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  })
  container.appendChild(app.canvas)
  app.canvas.style.position = 'absolute'
  app.canvas.style.inset = '0'
  app.canvas.style.pointerEvents = 'none'
  app.canvas.style.zIndex = '0'
  return app
}

export function getPixiApp(): Application {
  if (!app) throw new Error('PixiJS App not initialized')
  return app
}

export function destroyPixiApp(): void {
  app?.destroy(true, { children: true })
  app = null
  if (gsapTickInterval) {
    clearInterval(gsapTickInterval)
    gsapTickInterval = null
  }
}
