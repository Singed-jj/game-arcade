import { ToolType } from '@/core/types'
import { eventBus } from '@/state/event-bus'
import type { ToolManager } from '@/state/tool-manager'

const TOOL_LABELS: Record<ToolType, { icon: string; label: string }> = {
  [ToolType.ROCKET]: { icon: '🚀', label: '로켓' },
  [ToolType.BOMB]: { icon: '💣', label: '폭탄' },
  [ToolType.RAINBOW]: { icon: '🌈', label: '무지개' },
}

export class ToolBar {
  readonly el: HTMLElement
  private slots = new Map<ToolType, { el: HTMLElement; countEl: HTMLElement }>()
  private selectedTool: ToolType | null = null

  constructor() {
    this.el = document.createElement('div')
    this.el.className = 'flex justify-center gap-4 py-2 pb-4 px-4'
    this.el.style.background = 'linear-gradient(0deg, rgba(0,0,0,0.4) 0%, transparent 100%)'

    for (const type of [ToolType.ROCKET, ToolType.BOMB, ToolType.RAINBOW] as const) {
      const info = TOOL_LABELS[type]
      const slot = document.createElement('button')
      slot.className = 'flex flex-col items-center rounded-2xl min-w-[76px] py-3 px-3 transition-all duration-150 active:scale-95'
      slot.style.background = 'linear-gradient(135deg, rgba(40,20,80,0.85) 0%, rgba(20,10,50,0.85) 100%)'
      slot.style.boxShadow = '0 3px 10px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)'
      slot.style.border = '1px solid rgba(255,255,255,0.12)'
      const iconEl = document.createElement('span')
      iconEl.className = 'text-3xl mb-0.5'
      iconEl.textContent = info.icon
      const label = document.createElement('span')
      label.className = 'text-white text-xs'
      label.textContent = info.label
      const countEl = document.createElement('span')
      countEl.className = 'text-yellow-300 text-xs font-bold'
      countEl.textContent = '\u00d70'
      slot.appendChild(iconEl)
      slot.appendChild(label)
      slot.appendChild(countEl)
      slot.addEventListener('click', () => this.selectTool(type))
      this.el.appendChild(slot)
      this.slots.set(type, { el: slot, countEl })
    }

    eventBus.on('tool:count-changed', ({ type, count }) => {
      const slot = this.slots.get(type as ToolType)
      if (!slot) return
      slot.countEl.textContent = `\u00d7${count}`
      this.updateSlotAvailability(type as ToolType, count)
    })
  }

  private updateSlotAvailability(type: ToolType, count: number): void {
    const slot = this.slots.get(type)
    if (!slot) return
    if (count > 0) {
      slot.el.classList.remove('opacity-40', 'cursor-not-allowed')
      slot.el.classList.add('animate-glow', 'cursor-pointer')
    } else {
      slot.el.classList.add('opacity-40', 'cursor-not-allowed')
      slot.el.classList.remove('animate-glow', 'ring-2', 'ring-yellow-400')
      if (this.selectedTool === type) {
        this.selectedTool = null
      }
    }
  }

  private selectTool(type: ToolType): void {
    const slot = this.slots.get(type)
    if (!slot || slot.el.classList.contains('cursor-not-allowed')) return
    if (this.selectedTool === type) {
      this.selectedTool = null
      const s = this.slots.get(type)!.el
      s.style.background = 'linear-gradient(135deg, rgba(40,20,80,0.85) 0%, rgba(20,10,50,0.85) 100%)'
      s.style.boxShadow = '0 3px 10px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)'
      s.style.transform = ''
      eventBus.emit('tool:selected', { type: '' })
      return
    }
    if (this.selectedTool) {
      const prev = this.slots.get(this.selectedTool)!.el
      prev.style.background = 'linear-gradient(135deg, rgba(40,20,80,0.85) 0%, rgba(20,10,50,0.85) 100%)'
      prev.style.boxShadow = '0 3px 10px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)'
      prev.style.transform = ''
    }
    this.selectedTool = type
    const sel = this.slots.get(type)!.el
    sel.style.background = 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)'
    sel.style.boxShadow = '0 4px 16px rgba(245,158,11,0.5), inset 0 1px 0 rgba(255,255,255,0.3)'
    sel.style.transform = 'scale(1.08)'
    eventBus.emit('tool:selected', { type })
  }

  syncWithManager(toolManager: ToolManager): void {
    for (const type of [ToolType.ROCKET, ToolType.BOMB, ToolType.RAINBOW] as const) {
      const count = toolManager.getCount(type)
      const slot = this.slots.get(type)
      if (!slot) continue
      slot.countEl.textContent = `\u00d7${count}`
      this.updateSlotAvailability(type, count)
    }
  }

  getSelectedTool(): ToolType | null { return this.selectedTool }
  clearSelection(): void {
    if (this.selectedTool) {
      this.slots.get(this.selectedTool)!.el.classList.remove('ring-2', 'ring-yellow-400')
      this.selectedTool = null
    }
  }
}
