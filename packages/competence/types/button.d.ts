export type ButtonVariant = 'outlined' | 'solid' | 'filled' | 'text' | 'link' | 'dashed';
export type ButtonColor = 'default' | 'primary' | 'danger';
export type ButtonConfig = {
    disabled?: boolean;
    loading?: boolean | {
        delay: number;
    };
    onClick?: (e: MouseEvent) => void;
};
export type ButtonIns = {
    buttonEle: () => HTMLButtonElement | undefined;
    anchorEle: () => HTMLAnchorElement | undefined;
    click(): void;
};
export declare const createButton: (config?: ButtonConfig) => {
    loading: () => boolean;
    waveActive: import('solid-js').SourceAccessor<boolean>;
    /** Reactive disabled getter — reads through the props proxy so updates flow. */
    disabled: () => boolean;
    button: (el: HTMLButtonElement) => void;
    anchor: (el: HTMLAnchorElement) => void;
    refs: ButtonIns;
};
export declare const buttonSplits: (keyof ButtonConfig)[];
