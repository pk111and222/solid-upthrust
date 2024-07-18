export type ButtonConfig = {
    disabled?: boolean;
    loading?: boolean | {
        delay: number;
    };
    onClick?: (e: Event) => void;
};
export declare const createButton: (config?: ButtonConfig) => {
    loading: boolean | import('solid-js').Accessor<boolean>;
    disabled: boolean;
    button: (el: Element) => void;
};
export declare const buttonSplits: (keyof ButtonConfig)[];
