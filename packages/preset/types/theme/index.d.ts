import { PresetThemeOptions } from 'unocss-preset-theme';
import { MaterialColorOptions } from './colors/material';
import { GapTheme } from './gap';

export type ThemeOption = {
    selectors: PresetThemeOptions<any>['selectors'];
    prefix: string;
    theme: Record<string, Record<string, any>>;
    colors?: string | MaterialColorOptions;
    defaultGap?: string | number;
    gapAlgr?: (value: ThemeOption['defaultGap']) => GapTheme;
};
declare const createTheme: (option?: ThemeOption) => (GapTheme | {
    dark: import('solid-material-color').SimpleDynamicScheme;
    light: import('solid-material-color').SimpleDynamicScheme;
} | import('@unocss/core').Preset<{
    colors: import('solid-material-color').SimpleDynamicScheme;
} | {
    colors: import('solid-material-color').SimpleDynamicScheme;
}>)[];
export default createTheme;
