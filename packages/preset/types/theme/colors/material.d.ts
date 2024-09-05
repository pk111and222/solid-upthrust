import { ContrastLevelType, VariantType } from 'solid-material-color';

export interface MaterialColorOptions {
    color: string;
    contrastLevel?: ContrastLevelType;
    variant?: VariantType;
}
export declare function getMaterialColor(option: MaterialColorOptions): {
    dark: import('solid-material-color').SimpleDynamicScheme;
    light: import('solid-material-color').SimpleDynamicScheme;
};
