/**
 * antd 6 预设色板名（PresetColors）与预设状态色（PresetStatusColors），
 * Tag / Badge / Badge.Ribbon 共用同一判定。pink 与 magenta 同色板。
 */
export declare const PRESET_COLORS: readonly ["blue", "purple", "cyan", "green", "magenta", "pink", "red", "orange", "yellow", "volcano", "geekblue", "lime", "gold"];
export type PresetColor = (typeof PRESET_COLORS)[number];
export declare const PRESET_STATUS_COLORS: readonly ["success", "processing", "error", "default", "warning"];
export type PresetStatusColor = (typeof PRESET_STATUS_COLORS)[number];
export declare const isPresetColor: (color: unknown) => color is PresetColor;
export declare const isPresetStatusColor: (color: unknown) => color is PresetStatusColor;
