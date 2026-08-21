import { Breakpoint } from './breakpoint';
export type MasonryColumns = number | Partial<Record<Breakpoint, number>>;
export type MasonryConfig = {
    columns: MasonryColumns;
    sequential?: boolean;
    /** Dependency injection for tests / non-browser environments. */
    matchMedia?: (query: string) => MediaQueryList;
};
export type MasonryIns<T = unknown> = {
    columnCount: () => number;
    distribute: (items: readonly T[]) => T[][];
};
export declare const createMasonry: <T = unknown>(config: MasonryConfig) => MasonryIns<T>;
export declare const masonrySplits: (keyof MasonryConfig)[];
