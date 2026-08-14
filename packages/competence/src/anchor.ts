import { createMemo, createSignal, onCleanup, onMount } from "solid-js";

export type AnchorItem = {
  key: string
  href: string
  title: string
  children?: AnchorItem[]
}

export type AnchorConfig = {
  items: AnchorItem[]
  targetOffset?: number
  onChange?: (activeKey: string) => void
  getCurrentAnchor?: () => string
  bounds?: number
}

export type AnchorIns = {
  activeKey: () => string
  scrollTo: (key: string) => void
}

export const createAnchor = (config: AnchorConfig) => {
  const [_activeKey, _setActiveKey] = createSignal('')
  const sectionMap = new Map<string, HTMLElement>()

  const activeKey = createMemo(() => {
    if (config.getCurrentAnchor) return config.getCurrentAnchor()
    return _activeKey()
  })

  const flatItems = createMemo(() => {
    const result: AnchorItem[] = []
    const walk = (items: AnchorItem[]) => {
      for (const item of items) {
        result.push(item)
        if (item.children) walk(item.children)
      }
    }
    walk(config.items)
    return result
  })

  let _containerEl: HTMLElement | undefined
  let _rafId: number | undefined

  const getScrollContainer = () => _containerEl || document.documentElement

  const handleScroll = () => {
    if (_rafId) cancelAnimationFrame(_rafId)
    _rafId = requestAnimationFrame(() => {
      const offset = config.targetOffset ?? 0
      const bounds = config.bounds ?? 5
      const container = getScrollContainer()
      const scrollTop = container === document.documentElement ? window.scrollY : container.scrollTop

      let currentKey = ''
      for (const item of flatItems()) {
        const el = document.getElementById(item.href.replace('#', ''))
        if (el) {
          const top = el.getBoundingClientRect().top + scrollTop - (container === document.documentElement ? 0 : container.getBoundingClientRect().top)
          if (top <= scrollTop + offset + bounds) {
            currentKey = item.key
          }
        }
      }

      if (currentKey && currentKey !== _activeKey()) {
        _setActiveKey(currentKey)
        config.onChange?.(currentKey)
      }
    })
  }

  const scrollTo = (key: string) => {
    const item = flatItems().find(i => i.key === key)
    if (!item) return
    const el = document.getElementById(item.href.replace('#', ''))
    if (el) {
      const offset = config.targetOffset ?? 0
      const container = getScrollContainer()
      if (container === document.documentElement) {
        window.scrollTo({ top: el.offsetTop - offset, behavior: 'smooth' })
      } else {
        container.scrollTo({ top: el.offsetTop - offset, behavior: 'smooth' })
      }
      _setActiveKey(key)
      config.onChange?.(key)
    }
  }

  const containerRef = (el: HTMLElement) => {
    _containerEl = el
  }

  const init = () => {
    const container = getScrollContainer()
    if (container === document.documentElement) {
      window.addEventListener('scroll', handleScroll, { passive: true })
    } else {
      container.addEventListener('scroll', handleScroll, { passive: true })
    }
    handleScroll()
  }

  const cleanup = () => {
    const container = getScrollContainer()
    if (container === document.documentElement) {
      window.removeEventListener('scroll', handleScroll)
    } else {
      container.removeEventListener('scroll', handleScroll)
    }
    if (_rafId) cancelAnimationFrame(_rafId)
  }

  onMount(init)
  onCleanup(cleanup)

  const refs: AnchorIns = {
    activeKey,
    scrollTo
  }

  return {
    activeKey,
    scrollTo,
    containerRef,
    refs
  }
}

export const anchorSplits: (keyof AnchorConfig)[] = ['items', 'targetOffset', 'onChange', 'getCurrentAnchor', 'bounds']
