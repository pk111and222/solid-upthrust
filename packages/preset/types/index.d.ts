import { PresetFactory } from '@unocss/core';
import { Theme } from '@unocss/preset-wind4';
import { ThemeOption } from './theme';
import { SizeTokens } from './theme/size';
import { StyleTokens } from './theme/style';
export declare const DEFAULT_PREFIX = "--upthrust";
export declare const DEFAULT_ClASS_PREFIX = "ut";
export interface PresetUpthrustOptions {
    defaultTheme?: string;
    switchedTheme?: ThemeOption;
    theme?: Theme;
    shortcutsPrefix?: string;
}
export declare const presetUpthrust: PresetFactory<Theme, PresetUpthrustOptions>;
export default presetUpthrust;
export { extractorIcons } from './extractors';
export type { SizeTokens, StyleTokens };
