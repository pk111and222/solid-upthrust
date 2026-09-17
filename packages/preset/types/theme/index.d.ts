import { Theme } from '@unocss/preset-wind4';
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
declare const createTheme: (option?: ThemeOption, defaultTheme?: string, colors?: Theme["colors"]) => readonly [import('@unocss/core').Preset<{
    colors: {
        [x: string]: any;
    };
} | {
    colors: {
        [x: string]: any;
    };
}>, {
    readonly dark: Record<string, any>;
    readonly light: Record<string, any>;
}, GapTheme | undefined, SizeTokens, StyleTokens];
export default createTheme;
export type { SizeTokens } from './size';
export type { StyleTokens } from './style';
