export interface TagConfig {
    disabled?: boolean;
    onClose?: (event: MouseEvent) => void;
}
/** Closing may be cancelled with preventDefault, for confirmation flows. */
export declare const createTag: (config?: TagConfig) => {
    visible: import('solid-js').SourceAccessor<boolean>;
    close: (event: MouseEvent) => void;
};
export interface CheckableTagConfig {
    checked?: boolean;
    defaultChecked?: boolean;
    disabled?: boolean;
    onChange?: (checked: boolean) => void;
}
export declare const createCheckableTag: (config?: CheckableTagConfig) => {
    checked: () => boolean;
    toggle: () => void;
};
