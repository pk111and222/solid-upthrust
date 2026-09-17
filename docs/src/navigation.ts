/** Progressive navigation: retain the SSR shell and replace only the document body. */
export function setupNavigation(remount: () => void) {
  let controller: AbortController | undefined
  let sequence = 0
  const scroll = (url: URL) => {
    const id = decodeURIComponent(url.hash.slice(1))
    if (id) document.getElementById(id)?.scrollIntoView()
    else window.scrollTo(0,0)
  }
  const navigate = async (url: URL, push: boolean) => {
    controller?.abort()
    controller = new AbortController()
    const current = ++sequence
    document.querySelector('main')?.setAttribute('aria-busy','true')
    try {
      const response = await fetch(url.href, {signal:controller.signal,headers:{Accept:'text/html'}})
      if (!response.ok || !response.headers.get('content-type')?.includes('text/html')) throw new Error('Navigation response unavailable')
      const next = new DOMParser().parseFromString(await response.text(),'text/html')
      if (current !== sequence) return
      const main = next.querySelector('main')
      if (!main || !next.querySelector('[data-docs-shell]')) throw new Error('Not a documentation page')
      // Styles are shared across static pages. A new stylesheet requires a real load.
      const styles = [...next.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')]
      if (styles.some(link => ![...document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')].some(old => old.href === new URL(link.getAttribute('href')!,url).href))) throw new Error('Styles changed')
      // Disposal must happen before removing the old example nodes and portals.
      document.dispatchEvent(new Event('docs:before-navigate'))
      document.querySelector('main')!.replaceWith(main)
      for (const label of ['文档目录','移动文档目录']) {
        const selector = `nav[aria-label="${label}"]`
        const target = document.querySelector(selector), source = next.querySelector(selector)
        if (target && source) target.replaceChildren(...source.childNodes)
      }
      document.querySelectorAll<HTMLDetailsElement>('[data-mobile-menu] details').forEach(item => {item.open = false})
      document.title = next.title
      for (const selector of ['meta[name="description"]','link[rel="canonical"]','meta[name="robots"]']) {
        document.querySelector(selector)?.remove()
        const node = next.querySelector(selector)
        if (node) document.head.append(node)
      }
      if (push) history.pushState({},'',url.href)
      remount()
      scroll(url)
      // Keyboard users land at the new document heading without an outline on pointer navigation.
      document.querySelector<HTMLElement>('#main-content')?.focus({preventScroll:true})
    } catch (error) {
      if (current !== sequence || (error instanceof DOMException && error.name === 'AbortError')) return
      window.location.assign(url.href)
    } finally { if (current === sequence) document.querySelector('main')?.removeAttribute('aria-busy') }
  }
  const click = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
    const link = (event.target as Element).closest<HTMLAnchorElement>('a[href]')
    if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return
    const url = new URL(link.href)
    if (url.origin !== location.origin || url.pathname === location.pathname && url.search === location.search) return
    // Limit interception to the documentation shell, not links emitted by live demos.
    if (!link.closest('[data-docs-shell]') || link.closest('[data-demo]')) return
    event.preventDefault()
    void navigate(url,true)
  }
  const pop = () => { void navigate(new URL(location.href),false) }
  document.addEventListener('click',click)
  window.addEventListener('popstate',pop)
  return () => { sequence++; controller?.abort(); document.removeEventListener('click',click); window.removeEventListener('popstate',pop) }
}
