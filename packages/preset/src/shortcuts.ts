import { DEFAULT_ClASS_PREFIX } from './index'

export const shortcuts = {
  // 'custom-shortcut': 'text-lg text-orange hover:text-teal',
}

const createShortcuts = (name?: string) => {
  const prefix = name ?? DEFAULT_ClASS_PREFIX
  return Object.entries(shortcuts).reduce((total, [key, value]) => {
    total[`${prefix}-${key}`] = value
    return total
  }, {})
}

export default createShortcuts