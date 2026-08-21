import { PresetThemeOptions } from 'unocss-preset-theme';
import { MaterialColorOptions } from './colors/material';
import { GapTheme } from './gap';
import { SizeTokens } from './size';
import { StyleTokens } from './style';
export type ThemeOption = {
    selectors: PresetThemeOptions<any>['selectors'];
    prefix: string;
    theme: Record<string, Record<string, any>>;
    colors?: string | MaterialColorOptions;
    defaultGap?: string | number;
    gapAlgr?: (value: ThemeOption['defaultGap']) => GapTheme;
    sizeTokens?: Partial<SizeTokens>;
    styleTokens?: Partial<StyleTokens>;
};
declare const createTheme: (option?: ThemeOption) => readonly [import('@unocss/core').Preset<{
    colors: import('solid-material-color').SimpleDynamicScheme | null;
} | {
    colors: import('solid-material-color').SimpleDynamicScheme | null;
}>, {
    dark: import('solid-material-color').SimpleDynamicScheme | null;
    light: import('solid-material-color').SimpleDynamicScheme | null;
}, GapTheme | undefined, SizeTokens, StyleTokens];
export default createTheme;
export type { SizeTokens } from './size';
export type { StyleTokens } from './style';
