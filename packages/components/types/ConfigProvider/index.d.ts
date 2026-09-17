import { JSX } from '@solidjs/web';
import { ConfigProviderProps, ConfigTheme } from './types';
export type { ConfigProviderProps, ConfigTheme, ComponentDefaults, ConfigComponentName } from './types';
export { useConfig, useComponentProps } from './context';
/** Converts the palette to the RGB-channel variables consumed by our UnoCSS preset. */
export declare function themeStyle(theme?: ConfigTheme): JSX.CSSProperties;
export default function ConfigProvider(props: ConfigProviderProps): JSX.Element;
