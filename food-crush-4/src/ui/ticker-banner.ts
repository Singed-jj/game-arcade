export class TickerBanner {
  private el: HTMLElement
  private textEl: HTMLElement
  private intervalId: ReturnType<typeof setInterval> | null = null

  constructor() {
    // 바깥 컨테이너 생성
    this.el = document.createElement('div')
    this.el.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: var(--ticker-h);
      padding-top: env(safe-area-inset-top, 0px);
      background: #7C3A00;
      z-index: 1000;
      overflow: hidden;
      display: flex;
      align-items: center;
    `

    // 텍스트 요소 생성 (marquee 스크롤)
    this.textEl = document.createElement('div')
    this.textEl.style.cssText = `
      white-space: nowrap;
      color: white;
      font-size: 12px;
      animation: ticker-scroll 12s linear infinite;
    `
    this.el.appendChild(this.textEl)

    // CSS animation 추가 (한 번만)
    if (!document.getElementById('ticker-style')) {
      const style = document.createElement('style')
      style.id = 'ticker-style'
      style.textContent = `
        @keyframes ticker-scroll {
          from { transform: translateX(100vw); }
          to { transform: translateX(-100%); }
        }
      `
      document.head.appendChild(style)
    }
  }

  mount(): void {
    document.body.appendChild(this.el)
    this.updateText()
    this.intervalId = setInterval(() => this.updateText(), 7000)
  }

  unmount(): void {
    if (this.intervalId) clearInterval(this.intervalId)
    this.intervalId = null
    this.el.remove()
  }

  private generateText(): string {
    const regions = ["강남구", "마포구", "송파구", "관악구", "서초구", "종로구", "용산구", "성동구", "노원구", "광진구"]
    const surnames = ["김", "이", "박", "최", "정", "강", "조", "윤", "장", "임"]
    const rewards = ["🍗 1인 치킨", "💰 1,000원 쿠폰", "💰 2,000원 쿠폰", "🚀 로켓 도구 3개", "🎰 도구 꾸러미"]
    const region = regions[Math.floor(Math.random() * regions.length)]
    const surname = surnames[Math.floor(Math.random() * surnames.length)]
    const reward = rewards[Math.floor(Math.random() * rewards.length)]
    return `${region} ${surname}○님이 ${reward}을 뽑았습니다! 🎉`
  }

  private updateText(): void {
    this.textEl.style.animation = 'none'
    this.textEl.textContent = this.generateText()
    // reflow 강제 후 animation 재시작
    void this.textEl.offsetWidth
    this.textEl.style.animation = 'ticker-scroll 12s linear infinite'
  }
}
