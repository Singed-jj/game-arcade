import { ToolType } from '@/core/types'
import { eventBus } from '@/state/event-bus'

const TOOL_LABELS: Record<ToolType, string> = {
  [ToolType.ROCKET]: '로켓',
  [ToolType.BOMB]: '폭탄',
  [ToolType.RAINBOW]: '무지개',
}

export class ToolBar {
  readonly el: HTMLElement
  private slots = new Map<ToolType, { el: HTMLElement; countEl: HTMLElement }>()
  private selectedTool: ToolType | null = null

  constructor() {
    this.el = document.createElement('div')
    this.el.className = 'flex justify-center gap-4 py-2'

    for (const type of [ToolType.ROCKET, ToolType.BOMB, ToolType.RAINBOW]) {
      const slot = document.createElement('button')
      slot.className = 'flex flex-col items-center p-2 rounded-xl bg-white/10 min-w-[60px]'
      const label = document.createElement('span')
      label.className = 'text-white text-xs'
      label.textContent = TOOL_LABELS[type]
      const countEl = document.createElement('span')
      countEl.className = 'text-yellow-300 text-xs font-bold'
      countEl.textContent = '\u00d70'
      slot.appendChild(label)
      slot.appendChild(countEl)
      slot.addEventListener('click', () => this.selectTool(type))
      this.el.appendChild(slot)
      this.slots.set(type, { el: slot, countEl })
    }

    eventBus.on('tool:count-changed', ({ type, count }) => {
      const slot = this.slots.get(type as ToolType)
      if (slot) slot.countEl.textContent = `\u00d7${count}`
    })
  }

  private selectTool(type: ToolType): void {
    if (this.selectedTool === type) {
      this.selectedTool = null
      this.slots.get(type)!.el.classList.remove('ring-2', 'ring-yellow-400')
      return
    }
    if (this.selectedTool) {
      this.slots.get(this.selectedTool)!.el.classList.remove('ring-2', 'ring-yellow-400')
    }
    this.selectedTool = type
    this.slots.get(type)!.el.classList.add('ring-2', 'ring-yellow-400')
    eventBus.emit('tool:selected', { type })
  }

  getSelectedTool(): ToolType | null { return this.selectedTool }
  clearSelection(): void {
    if (this.selectedTool) {
      this.slots.get(this.selectedTool)!.el.classList.remove('ring-2', 'ring-yellow-400')
      this.selectedTool = null
    }
  }
}
