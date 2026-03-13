import { Application } from 'pixi.js'

let app: Application | null = null

export async function initPixiApp(container: HTMLElement): Promise<Application> {
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
  return app
}

export function getPixiApp(): Application {
  if (!app) throw new Error('PixiJS App not initialized')
  return app
}

export function destroyPixiApp(): void {
  app?.destroy(true, { children: true })
  app = null
}
