import { eventBus } from '@/state/event-bus'
import { BLOCK_GRADIENTS, BLOCK_EMOJIS, BlockType } from '@/core/types'

export class CoverScreen {
  constructor(container: HTMLElement) {
    container.className = 'relative w-full h-dvh max-w-[375px] mx-auto overflow-hidden flex flex-col items-center justify-center'
    container.style.background = 'linear-gradient(180deg, #1a0a3e 0%, #0e0a28 60%, #1a0820 100%)'

    // --- 애니메이션 배경 파티클 ---
    this.addFloatingEmojis(container)

    // --- 로고 영역 ---
    const logoWrap = document.createElement('div')
    logoWrap.className = 'relative z-10 flex flex-col items-center mb-8'

    // 타이틀
    const logo = document.createElement('h1')
    logo.textContent = '푸드크러시'
    logo.className = 'font-bold text-yellow-400 tracking-tight'
    logo.style.fontSize = '52px'
    logo.style.textShadow = '0 0 30px rgba(255,214,0,0.7), 0 0 60px rgba(255,214,0,0.3), 0 4px 8px rgba(0,0,0,0.6)'
    logo.style.animation = 'cover-title 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
    logoWrap.appendChild(logo)

    const subtitle = document.createElement('p')
    subtitle.textContent = '두잇 미니게임'
    subtitle.className = 'text-white/60 text-sm mt-1 tracking-wider'
    logoWrap.appendChild(subtitle)

    // 슬로건
    const slogan = document.createElement('p')
    slogan.className = 'text-sm text-white/80 mt-2'
    slogan.innerHTML = '깰 때마다 공짜 <span class="text-yellow-300 font-bold">쿠폰</span>이 쏟아진다!'
    logoWrap.appendChild(slogan)

    container.appendChild(logoWrap)

    // --- 미리보기 블록 그리드 (4x6) ---
    const previewWrap = document.createElement('div')
    previewWrap.className = 'relative z-10 mb-10'

    const grid = document.createElement('div')
    grid.style.display = 'grid'
    grid.style.gridTemplateColumns = 'repeat(4, 44px)'
    grid.style.gap = '5px'

    const blockTypes = [BlockType.CHICKEN, BlockType.COLA, BlockType.FRIES, BlockType.BURGER, BlockType.PIZZA]
    const blockOrder: BlockType[] = []
    for (let i = 0; i < 24; i++) {
      blockOrder.push(blockTypes[i % blockTypes.length])
    }

    blockOrder.forEach((type, i) => {
      const cell = document.createElement('div')
      cell.className = 'flex items-center justify-center rounded-xl text-xl'
      cell.style.width = '44px'
      cell.style.height = '44px'
      cell.style.background = BLOCK_GRADIENTS[type]
      cell.style.boxShadow = '0 3px 8px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.4)'
      cell.style.animationDelay = `${i * 0.04}s`
      cell.style.animation = 'cover-block-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both'
      cell.textContent = BLOCK_EMOJIS[type]
      grid.appendChild(cell)
    })

    previewWrap.appendChild(grid)

    // COMBO ×3 배지 (우상단 오버레이)
    const comboBadge = document.createElement('div')
    comboBadge.textContent = 'COMBO ×3'
    comboBadge.className = 'absolute top-0 right-0 text-xs font-bold text-white px-2 py-1 rounded-bl-lg rounded-tr-lg'
    comboBadge.style.background = 'linear-gradient(135deg, #f97316, #ea580c)'
    comboBadge.style.boxShadow = '0 2px 8px rgba(249,115,22,0.5)'
    comboBadge.style.transform = 'translate(4px, -4px)'
    previewWrap.appendChild(comboBadge)

    container.appendChild(previewWrap)

    // --- 소셜 라인 ---
    const socialLine = document.createElement('p')
    socialLine.textContent = '🟢 지금 1,247명 플레이 중'
    socialLine.className = 'relative z-10 text-xs text-green-300 mb-3'
    container.appendChild(socialLine)

    // --- 시작하기 버튼 ---
    const startBtn = document.createElement('button')
    startBtn.textContent = '🎮 지금 바로 시작하기'
    startBtn.className = 'relative z-10 px-14 py-5 font-bold text-xl text-white rounded-full active:scale-95 transition-transform'
    startBtn.style.background = 'linear-gradient(135deg, #fbbf24 0%, #f97316 100%)'
    startBtn.style.boxShadow = '0 4px 24px rgba(251,191,36,0.5), 0 0 0 3px rgba(251,191,36,0.2), inset 0 1px 0 rgba(255,255,255,0.3)'
    startBtn.style.animation = 'cover-btn-pulse 2s ease-in-out infinite 1s'
    startBtn.addEventListener('click', () => {
      eventBus.emit('screen:change', { screen: 'map' })
    })
    container.appendChild(startBtn)

    // --- 하단 텍스트 ---
    const bottomText = document.createElement('p')
    bottomText.textContent = '두잇 계정 자동 연동 · 로그인 없이'
    bottomText.className = 'relative z-10 text-white/35 text-xs mt-6 tracking-wide'
    container.appendChild(bottomText)

    // CSS
    if (!document.getElementById('cover-styles')) {
      const style = document.createElement('style')
      style.id = 'cover-styles'
      style.textContent = `
        @keyframes cover-title {
          0% { transform: scale(0.7) translateY(-10px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes cover-block-in {
          0% { transform: scale(0.4) rotate(-15deg); opacity: 0; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes cover-btn-pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 4px 24px rgba(251,191,36,0.5), 0 0 0 3px rgba(251,191,36,0.2), inset 0 1px 0 rgba(255,255,255,0.3); }
          50% { transform: scale(1.04); box-shadow: 0 6px 32px rgba(251,191,36,0.7), 0 0 0 5px rgba(251,191,36,0.15), inset 0 1px 0 rgba(255,255,255,0.3); }
        }
        @keyframes food-float {
          0%, 100% { transform: translateY(0) rotate(var(--rot)); opacity: var(--op); }
          50% { transform: translateY(-12px) rotate(calc(var(--rot) + 8deg)); opacity: calc(var(--op) * 0.8); }
        }
        .food-float-item {
          position: absolute;
          pointer-events: none;
          user-select: none;
          animation: food-float ease-in-out infinite;
        }
      `
      document.head.appendChild(style)
    }
  }

  private addFloatingEmojis(container: HTMLElement): void {
    const items = [
      { emoji: '🍔', top: '5%',  left: '8%',  size: '2.2rem', rot: '-12deg', op: '0.55', dur: '3.2s', delay: '0s' },
      { emoji: '🍕', top: '2%',  left: '44%', size: '1.9rem', rot: '15deg',  op: '0.50', dur: '3.8s', delay: '0.5s' },
      { emoji: '🍟', top: '7%',  left: '78%', size: '2.0rem', rot: '-8deg',  op: '0.55', dur: '2.9s', delay: '1.2s' },
      { emoji: '🍗', top: '15%', left: '18%', size: '1.6rem', rot: '20deg',  op: '0.40', dur: '4.1s', delay: '0.8s' },
      { emoji: '🥤', top: '11%', left: '62%', size: '1.8rem', rot: '-18deg', op: '0.45', dur: '3.5s', delay: '1.8s' },
      { emoji: '🍔', top: '20%', left: '88%', size: '1.5rem', rot: '10deg',  op: '0.35', dur: '3.0s', delay: '2.2s' },
      { emoji: '🍕', top: '18%', left: '3%',  size: '1.4rem', rot: '-25deg', op: '0.35', dur: '4.5s', delay: '0.3s' },
    ]
    for (const item of items) {
      const el = document.createElement('span')
      el.className = 'food-float-item'
      el.textContent = item.emoji
      el.style.top = item.top
      el.style.left = item.left
      el.style.fontSize = item.size
      el.style.setProperty('--rot', item.rot)
      el.style.setProperty('--op', item.op)
      el.style.transform = `rotate(${item.rot})`
      el.style.opacity = item.op
      el.style.animationDuration = item.dur
      el.style.animationDelay = item.delay
      container.appendChild(el)
    }
  }
}
