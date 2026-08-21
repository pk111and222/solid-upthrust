import { DEFAULT_ClASS_PREFIX } from './index'

export const shortcuts: Record<string, string> = {
  'control': 'h-control text-[14px] leading-[1.5714] rounded',
  'control-sm': 'h-control-sm text-[12px] leading-[1.5714] rounded-sm',
  'control-lg': 'h-control-lg text-[16px] leading-[1.5714] rounded-lg',
  'overlay': 'bg-surface rounded-lg shadow',
  'disabled': 'cursor-not-allowed pointer-events-none',
}

const createShortcuts = (name?: string): Record<string, string> => {
  const prefix = name ?? DEFAULT_ClASS_PREFIX
  return Object.entries(shortcuts).reduce((total, [key, value]) => {
    total[`${prefix}-${key}`] = value
    return total
  }, {} as Record<string, string>)
}

export default createShortcuts
