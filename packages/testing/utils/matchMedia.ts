/** 可控的媒体查询边界：使用完整 EventTarget 协议，保留真实 change 事件类型。 */
class TestMediaQueryList extends EventTarget implements MediaQueryList {
  matches: boolean
  onchange: ((this: MediaQueryList, event: MediaQueryListEvent) => unknown) | null = null
  constructor(readonly media: string, matches: boolean) { super(); this.matches = matches }
  addEventListener<K extends keyof MediaQueryListEventMap>(type: K, listener: (this: MediaQueryList, event: MediaQueryListEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void
  addEventListener(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions): void
  addEventListener(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions) { super.addEventListener(type, listener, options) }
  removeEventListener<K extends keyof MediaQueryListEventMap>(type: K, listener: (this: MediaQueryList, event: MediaQueryListEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | EventListenerOptions): void
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | EventListenerOptions) { super.removeEventListener(type, listener, options) }
  addListener(listener: ((this: MediaQueryList, event: MediaQueryListEvent) => unknown) | null) { if (listener) this.addEventListener('change', listener) }
  removeListener(listener: ((this: MediaQueryList, event: MediaQueryListEvent) => unknown) | null) { if (listener) this.removeEventListener('change', listener) }
  setMatch(matches: boolean) {
    this.matches = matches
    const event = new MediaQueryListEvent('change', { matches, media:this.media })
    this.onchange?.call(this,event)
    this.dispatchEvent(event)
  }
}
export function createFakeMatchMedia(initial: Record<string, boolean>) {
  const state = { ...initial }
  const queries = new Map<string, TestMediaQueryList>()
  return {
    matchMedia(query: string): MediaQueryList {
      if (!queries.has(query)) queries.set(query,new TestMediaQueryList(query,state[query] ?? false))
      return queries.get(query)!
    },
    setMatch(query: string, matches: boolean) { state[query] = matches; queries.get(query)?.setMatch(matches) },
  }
}
