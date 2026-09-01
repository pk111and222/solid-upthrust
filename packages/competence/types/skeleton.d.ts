/**
 * Headless logic for Skeleton — derives the block list from a compact
 * props shape so the UI layer only renders. Handles:
 *  - `loading` flipping (false renders real content instead)
 *  - rows/paragraph composition: antd maps `paragraph`/`title` booleans or
 *    overrides into a list of widths; here the derivation is pure.
 */
export type SkeletonBlock = {
    /** 'title' | 'paragraph' rows have different heights. */
    kind: 'title' | 'paragraph';
    /** Width in px; undefined = full width. Last paragraph row is ~60%. */
    width?: number | string;
};
export type SkeletonConfig = {
    loading?: boolean;
    active?: boolean;
    /** Round line ends (avatar stays round regardless). */
    round?: boolean;
    title?: boolean | {
        width?: number | string;
    };
    paragraph?: boolean | {
        rows?: number;
        width?: number | string | Array<number | string>;
    };
    avatar?: boolean | {
        size?: number | string;
        shape?: 'circle' | 'square';
    };
};
export type SkeletonIns = {
    loading: () => boolean;
};
export declare const createSkeleton: (config?: SkeletonConfig) => {
    loading: import('solid-js').SourceAccessor<boolean>;
    blocks: import('solid-js').SourceAccessor<SkeletonBlock[]>;
    refs: SkeletonIns;
};
/** Skeleton block list derivation, exported pure for tests. */
export declare const skeletonBlocks: (config: SkeletonConfig) => SkeletonBlock[];
export declare const skeletonSplits: (keyof SkeletonConfig)[];
