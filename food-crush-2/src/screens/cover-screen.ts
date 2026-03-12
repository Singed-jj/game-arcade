import { eventBus } from '@/state/event-bus'

export class CoverScreen {
  constructor(container: HTMLElement) {
    container.className = 'relative w-full h-dvh max-w-[375px] mx-auto overflow-hidden flex flex-col items-center justify-center bg-gradient-to-b from-[#1a0a3e] to-[#0E0A28]'

    const logo = document.createElement('h1')
    logo.textContent = '푸드크러시'
    logo.className = 'text-4xl font-bold text-yellow-400 mb-8 drop-shadow-lg'
    container.appendChild(logo)

    const subtitle = document.createElement('p')
    subtitle.textContent = '맛있는 퍼즐 어드벤처'
    subtitle.className = 'text-white/70 text-sm mb-12'
    container.appendChild(subtitle)

    const startBtn = document.createElement('button')
    startBtn.textContent = '시작하기'
    startBtn.className = 'px-12 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold text-xl rounded-full shadow-lg active:scale-95 transition-transform'
    startBtn.addEventListener('click', () => {
      eventBus.emit('screen:change', { screen: 'map' })
    })
    container.appendChild(startBtn)
  }
}
