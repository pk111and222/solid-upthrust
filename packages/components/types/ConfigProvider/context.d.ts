import { SizeType } from '../../common/type';
import { ComponentDefaults, ConfigComponentName } from './types';
export interface ConfigContextValue {
    componentSize: () => SizeType | undefined;
    componentDisabled: () => boolean | undefined;
    defaults: () => ComponentDefaults;
    element: () => HTMLElement | undefined;
}
export declare const ConfigContext: import('solid-js').Context<ConfigContextValue | null>;
export declare const useConfig: () => ConfigContextValue | null;
/** Explicit props > Form/Item defaults > component defaults > shared defaults. */
export declare function useComponentProps<T extends object>(name: ConfigComponentName, props: T): T;
