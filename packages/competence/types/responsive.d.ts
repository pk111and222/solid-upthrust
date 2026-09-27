import { Accessor } from 'solid-js';
import { Screen } from './breakpoint';
/** Which screens currently match; missing keys mean "not known" (SSR) rather than false. */
export type ScreenMap = Partial<Record<Screen, boolean>>;
/** A per-screen value map, e.g. `{ xs: 8, md: 16 }`. */
export type ResponsiveValue<T> = Partial<Record<Screen, T>>;
type MatchMedia = (query: string) => MediaQueryList;
export type BreakpointConfig = {
    /** Dependency injection for tests / non-browser environments. Defaults to `globalThis.matchMedia`. */
    matchMedia?: MatchMedia;
};
export type BreakpointIns = {
    /** Current screen map, or `null` when the environment has no matchMedia (SSR). */
    screens: Accessor<ScreenMap | null>;
};
/**
 * Reactive screen map. The initial value is read synchronously (no first-frame
 * flash); the subscription is released with the calling owner, so call it
 * inside a component or `createRoot`.
 */
export declare const createBreakpoint: (config?: BreakpointConfig) => BreakpointIns;
/**
 * Resolve a plain-or-responsive value: plain values pass through; for a map,
 * return the value of the widest matching screen that defines one. `null`
 * screens (SSR) count every screen as matching, so the widest defined value wins.
 */
export declare const resolveResponsive: <T>(value: T | ResponsiveValue<T> | undefined, screens: ScreenMap | null) => T | undefined;
export {};
