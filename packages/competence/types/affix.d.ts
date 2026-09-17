export interface AffixRect {
    top: number;
    left: number;
    width: number;
    height: number;
}
export interface AffixPosition {
    top: number;
    left: number;
    width: number;
    height: number;
    relativeTop: number;
}
export interface AffixConfig {
    offsetTop?: number;
    offsetBottom?: number;
    disabled?: boolean;
    target?: () => HTMLElement | Window | undefined | null;
    onChange?: (affixed: boolean) => void;
}
/** Viewport coordinates; top takes precedence if both offsets are supplied. */
export declare function calculateAffix(placeholder: AffixRect, target: {
    top: number;
    bottom: number;
}, config: Pick<AffixConfig, 'offsetTop' | 'offsetBottom' | 'disabled'>): AffixPosition | undefined;
export declare function createAffix(config?: AffixConfig): {
    position: import('solid-js').SourceAccessor<AffixPosition | undefined>;
    affixed: () => boolean;
    elementTarget: import('solid-js').SourceAccessor<boolean>;
    updatePosition: () => void;
    placeholderRef: (element: HTMLElement) => HTMLElement;
    contentRef: (element: HTMLElement) => HTMLElement;
};
export type AffixIns = ReturnType<typeof createAffix>;
