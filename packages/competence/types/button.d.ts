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
    disabled: boolean | undefined;
    button: (el: HTMLButtonElement) => void;
    anchor: (el: HTMLAnchorElement) => void;
    refs: ButtonIns;
};
export declare const buttonSplits: (keyof ButtonConfig)[];
