export interface ColorRgb {
    r: number;
    g: number;
    b: number;
    a?: number;
}
/** Saturation/brightness are percentages; alpha is in [0, 1]. */
export interface ColorHsb {
    h: number;
    s: number;
    b: number;
    a?: number;
}
export type ColorInput = string | Color | ColorRgb | ColorHsb;
export type ColorFormat = 'hex' | 'rgb' | 'hsb';
export declare const clampColor: (value: number, max?: number) => number;
/** Immutable color value; hue survives edits through gray and black. */
export declare class Color {
    private readonly channels;
    constructor(input: ColorInput);
    toHsb(): Required<ColorHsb>;
    toRgb(): Required<ColorRgb>;
    toHexString(): string;
    toRgbString(): string;
    toHsbString(): string;
    toCssString(): string;
    toString(format?: ColorFormat): string;
}
export declare const parseColor: (input: ColorInput) => Color | undefined;
