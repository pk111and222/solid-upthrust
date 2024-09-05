export type ButtonConfig = {
    disabled?: boolean;
    loading?: boolean | {
        delay: number;
    };
    onClick?: (e: Event) => void;
};
export type ButtonIns = {
    buttonEle: () => HTMLButtonElement;
    anchorEle: () => HTMLAnchorElement;
    click(): void;
};
export declare const createButton: (config?: ButtonConfig) => {
    loading: import('solid-js').Accessor<boolean>;
    disabled: boolean;
    button: (el: HTMLButtonElement) => void;
    anchor: (el: HTMLAnchorElement) => void;
    refs: ButtonIns;
};
export declare const buttonSplits: (keyof ButtonConfig)[];
