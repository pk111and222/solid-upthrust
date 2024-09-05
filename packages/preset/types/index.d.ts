import { Theme } from '@unocss/preset-uno';
import { ThemeOption } from './theme';

export declare const DEFAULT_PREFIX = "--upthrust";
export declare const DEFAULT_ClASS_PREFIX = "ut";
export interface PresetUpthrustOptions {
    defaultTheme?: string;
    switchedTheme?: ThemeOption;
    theme?: Theme;
    shortcutsPrefix?: string;
}
export declare const presetUpthrust: import('@unocss/core').PresetFactory<object, PresetUpthrustOptions>;
export default presetUpthrust;
