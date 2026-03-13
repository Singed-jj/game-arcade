export interface PopupButton { text: string; onClick: () => void; primary?: boolean }

export class Popup {
  readonly el: HTMLElement

  constructor(title: string, content: string | HTMLElement, buttons: PopupButton[]) {
    this.el = document.createElement('div')
    this.el.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/60'

    const card = document.createElement('div')
    card.className = 'relative w-[300px] p-6 rounded-2xl text-center'
    card.style.backgroundImage = 'url(/assets/ui/popup-frame.png)'
    card.style.backgroundSize = 'cover'
    card.style.backgroundPosition = 'center'

    const h = document.createElement('h2')
    h.className = 'text-white font-bold text-xl mb-3'
    h.textContent = title
    card.appendChild(h)

    if (typeof content === 'string') {
      const p = document.createElement('p')
      p.className = 'text-white/80 text-sm mb-4'
      p.textContent = content
      card.appendChild(p)
    } else {
      card.appendChild(content)
    }

    const btnRow = document.createElement('div')
    btnRow.className = 'flex gap-2 justify-center'
    for (const btn of buttons) {
      const b = document.createElement('button')
      b.className = btn.primary
        ? 'px-6 py-2 bg-yellow-500 text-white font-bold rounded-full'
        : 'px-6 py-2 bg-white/20 text-white rounded-full'
      b.textContent = btn.text
      b.addEventListener('click', () => { btn.onClick(); this.close() })
      btnRow.appendChild(b)
    }
    card.appendChild(btnRow)
    this.el.appendChild(card)
  }

  show(parent: HTMLElement): void { parent.appendChild(this.el) }
  close(): void { this.el.remove() }
}
