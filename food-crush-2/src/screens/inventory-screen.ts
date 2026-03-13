import { ToolType } from '@/core/types'
import { eventBus } from '@/state/event-bus'
import type { ToolManager } from '@/state/tool-manager'

interface ToolCard {
  type: ToolType
  emoji: string
  name: string
}

const TOOLS: ToolCard[] = [
  { type: ToolType.ROCKET, emoji: '🚀', name: '로 켓' },
  { type: ToolType.BOMB, emoji: '💣', name: '폭 탄' },
  { type: ToolType.RAINBOW, emoji: '🌈', name: '무지개' },
]

export class InventoryScreen {
  constructor(container: HTMLElement, toolManager: ToolManager) {
    container.className = 'relative w-full h-dvh max-w-[375px] mx-auto flex flex-col overflow-hidden'
    container.style.background = 'linear-gradient(180deg, #E8740C 0%, #A0522D 100%)'

    this.buildHUD(container)
    this.buildContent(container, toolManager)
  }

  private buildHUD(container: HTMLElement): void {
    const hud = document.createElement('div')
    hud.className = 'flex items-center gap-3 px-4 py-3 shrink-0'
    hud.style.background = 'rgba(0,0,0,0.15)'

    const backBtn = document.createElement('button')
    backBtn.textContent = '←'
    backBtn.className = 'w-9 h-9 rounded-full bg-white/20 text-white text-lg font-bold flex items-center justify-center active:scale-95 transition-transform'
    backBtn.addEventListener('click', () => {
      eventBus.emit('screen:change', { screen: 'map' })
    })

    const title = document.createElement('span')
    title.textContent = '🎒 내 아이템'
    title.className = 'text-white text-lg font-bold'

    hud.appendChild(backBtn)
    hud.appendChild(title)
    container.appendChild(hud)
  }

  private buildContent(container: HTMLElement, toolManager: ToolManager): void {
    const content = document.createElement('div')
    content.className = 'flex-1 flex flex-col items-center px-6 pt-6 pb-8 overflow-y-auto'

    // 섹션 타이틀
    const sectionTitle = document.createElement('div')
    sectionTitle.textContent = '도구 보유 현황'
    sectionTitle.className = 'text-white/80 text-sm font-semibold mb-5'
    content.appendChild(sectionTitle)

    // 카드 그리드
    const grid = document.createElement('div')
    grid.className = 'grid grid-cols-3 gap-3 w-full mb-8'

    for (const tool of TOOLS) {
      const count = toolManager.getCount(tool.type)
      grid.appendChild(this.buildCard(tool, count))
    }
    content.appendChild(grid)

    // 사용 안내 박스
    const tipBox = document.createElement('div')
    tipBox.className = 'w-full rounded-2xl p-4 mb-6'
    tipBox.style.background = 'rgba(255,255,255,0.10)'

    const tipTitle = document.createElement('div')
    tipTitle.textContent = '💡 도구 사용 안내'
    tipTitle.className = 'text-white font-bold text-sm mb-2'

    const tipLines = [
      '게임 화면 하단 도구바에서',
      '도구를 선택한 후',
      '제거할 블록을 탭하세요!',
    ]
    const tipBody = document.createElement('div')
    tipBody.className = 'text-white/70 text-xs leading-relaxed'
    tipBody.innerHTML = tipLines.join('<br>')

    tipBox.appendChild(tipTitle)
    tipBox.appendChild(tipBody)
    content.appendChild(tipBox)

    // 하단 안내 문구
    const footer = document.createElement('div')
    footer.className = 'text-white/60 text-xs text-center leading-relaxed'
    footer.innerHTML = '도구가 없다면? 뽑기에서 획득 가능!<br>(조각 5개 모으면 뽑기 1회)'
    content.appendChild(footer)

    container.appendChild(content)
  }

  private buildCard(tool: ToolCard, count: number): HTMLElement {
    const card = document.createElement('div')
    card.className = 'flex flex-col items-center justify-center rounded-2xl py-4 px-2'
    card.style.background = 'rgba(255,255,255,0.10)'

    if (count === 0) {
      card.style.opacity = '0.4'
    }

    const emoji = document.createElement('div')
    emoji.textContent = tool.emoji
    emoji.className = 'text-4xl mb-2'

    const countEl = document.createElement('div')
    countEl.className = 'text-2xl font-bold text-white mb-1'
    countEl.textContent = count > 0 ? `× ${count}` : '없음'

    const name = document.createElement('div')
    name.className = 'text-xs text-white/70'
    name.textContent = tool.name

    card.appendChild(emoji)
    card.appendChild(countEl)
    card.appendChild(name)
    return card
  }
}
