import { createContext, useContext } from 'solid-js'
import type { DocRoute } from './routing'

export const SiteContext = createContext<{ base: string; path: string; routes: DocRoute[] }>()
export function useSite() {
  const context = useContext(SiteContext)
  if (!context) throw new Error('Documentation content must render inside SiteContext.')
  return context
}
