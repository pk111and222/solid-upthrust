import { Color, ColorFormat, ColorHsb, ColorInput } from './color';
export * from './color';
export interface ColorPickerConfig {
    value?: ColorInput | null;
    defaultValue?: ColorInput | null;
    format?: ColorFormat;
    defaultFormat?: ColorFormat;
    open?: boolean;
    defaultOpen?: boolean;
    disabled?: boolean;
    disabledAlpha?: boolean;
    allowClear?: boolean;
    onChange?: (color: Color | null, css: string) => void;
    onChangeComplete?: (color: Color | null) => void;
    onFormatChange?: (format: ColorFormat) => void;
    onOpenChange?: (open: boolean) => void;
    onClear?: () => void;
}
export declare function createColorPicker(config?: ColorPickerConfig): {
    color: import('solid-js').SourceAccessor<Color | null>;
    hsb: () => Required<ColorHsb>;
    format: import('solid-js').SourceAccessor<"hex" | "rgb" | "hsb">;
    open: import('solid-js').SourceAccessor<boolean>;
    setOpen: (next: boolean) => void;
    setColor: (input: ColorInput, finish?: boolean) => boolean;
    setHsb: (patch: Partial<ColorHsb>, finish?: boolean) => boolean;
    setSaturationBrightness: (x: number, y: number, finish?: boolean) => boolean;
    setFormat: (next: ColorFormat) => void;
    clear: () => void;
    complete: () => void;
    text: () => string;
    css: () => string;
};
export type ColorPickerIns = ReturnType<typeof createColorPicker>;
