import { BREAKPOINTS } from './breakpoint';
export type AvatarSize = 'large' | 'middle' | 'small' | number | Partial<Record<keyof typeof BREAKPOINTS, number>>;
/** Sparse maps inherit the last defined smaller breakpoint; xs covers widths below sm. */
export declare function resolveAvatarSize(size: AvatarSize | undefined, width: number): number;
/** Listeners exist only while this size is responsive, and are removed on disposal. */
export declare function createAvatarSize(size: () => AvatarSize | undefined): import('solid-js').SourceAccessor<number>;
