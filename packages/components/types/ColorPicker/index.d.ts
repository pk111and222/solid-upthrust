import { JSX } from '@solidjs/web';
import { Color, parseColor, ColorInput, ColorPickerConfig } from 'upthrust-competence';
import { PopoverPlacement } from '../Popover';
export { Color, parseColor };
export type { ColorInput, ColorFormat, ColorRgb, ColorHsb, ColorPickerIns } from 'upthrust-competence';
export interface ColorPickerPreset {
    label: string;
    colors: readonly ColorInput[];
}
export interface ColorPickerProps extends ColorPickerConfig {
    presets?: readonly ColorPickerPreset[];
    showText?: boolean | ((color: Color | null) => JSX.Element);
    size?: 'small' | 'middle' | 'large';
    status?: 'error' | 'warning';
    inline?: boolean;
    placement?: PopoverPlacement;
    disabledFormat?: boolean;
    id?: string;
    name?: string;
    'aria-label'?: string;
    class?: string;
    style?: JSX.CSSProperties;
    panelClass?: string;
}
declare const ColorPicker: (providedProps: ColorPickerProps) => JSX.Element;
export default ColorPicker;
