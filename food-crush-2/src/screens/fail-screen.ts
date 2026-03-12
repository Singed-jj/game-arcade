import { eventBus } from '@/state/event-bus'
import type { HeartManager } from '@/state/heart-manager'

export class FailScreen {
  constructor(container: HTMLElement, heartManager: HeartManager, data?: Record<string, unknown>) {
    const level = (data?.level as number) ?? 1

    container.className = 'relative w-full h-dvh max-w-[375px] mx-auto flex flex-col items-center justify-center bg-gradient-to-b from-[#3a0a0a] to-[#0E0A28]'

    const title = document.createElement('h2')
    title.textContent = '실패...'
    title.className = 'text-3xl font-bold text-red-400 mb-6'
    container.appendChild(title)

    const heartInfo = document.createElement('p')
    heartInfo.className = 'text-white/70 mb-8'
    heartInfo.textContent = `남은 하트: ${heartManager.getHearts()}`
    container.appendChild(heartInfo)

    const retryBtn = document.createElement('button')
    retryBtn.textContent = '다시 도전'
    retryBtn.className = 'px-10 py-3 bg-gradient-to-r from-red-400 to-orange-500 text-white font-bold rounded-full'
    retryBtn.addEventListener('click', () => {
      eventBus.emit('screen:change', { screen: 'game', data: { level } })
    })
    container.appendChild(retryBtn)

    const mapBtn = document.createElement('button')
    mapBtn.textContent = '맵으로'
    mapBtn.className = 'mt-3 px-8 py-2 bg-white/20 text-white rounded-full'
    mapBtn.addEventListener('click', () => {
      eventBus.emit('screen:change', { screen: 'map' })
    })
    container.appendChild(mapBtn)
  }
}
