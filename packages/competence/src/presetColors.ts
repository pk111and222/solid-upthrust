/**
 * antd 6 预设色板名（PresetColors）与预设状态色（PresetStatusColors），
 * Tag / Badge / Badge.Ribbon 共用同一判定。pink 与 magenta 同色板。
 */
export const PRESET_COLORS = [
  'blue', 'purple', 'cyan', 'green', 'magenta', 'pink', 'red',
  'orange', 'yellow', 'volcano', 'geekblue', 'lime', 'gold',
] as const

export type PresetColor = (typeof PRESET_COLORS)[number]

export const PRESET_STATUS_COLORS = ['success', 'processing', 'error', 'default', 'warning'] as const

export type PresetStatusColor = (typeof PRESET_STATUS_COLORS)[number]

export const isPresetColor = (color: unknown): color is PresetColor =>
  (PRESET_COLORS as readonly unknown[]).includes(color)

export const isPresetStatusColor = (color: unknown): color is PresetStatusColor =>
  (PRESET_STATUS_COLORS as readonly unknown[]).includes(color)
