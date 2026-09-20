export interface InputConfig {
    value?: string;
    defaultValue?: string;
    disabled?: boolean;
    readonly?: boolean;
    onChange?: (value: string, event?: Event) => void;
}
/** Shared text value/IME contract; the UI owns native nodes and focus. */
export declare function createInput(config?: InputConfig): {
    value: () => string;
    revision: import('solid-js').SourceAccessor<number>;
    input: (next: string, event?: Event) => void;
    compositionStart: () => void;
    compositionEnd: (next: string, event?: Event) => void;
    clear: (event?: Event) => void;
    canEnter: (event: KeyboardEvent) => boolean;
};
export interface PasswordConfig {
    visible?: boolean;
    disabled?: boolean;
    action?: 'click' | 'hover';
    onVisibleChange?: (visible: boolean) => void;
}
/** Visibility requests are separate from the text value contract. */
export declare function createPassword(config?: PasswordConfig): {
    visible: () => boolean;
    toggle: () => void;
    enter: () => void;
    leave: () => void;
};
