export interface TypographyEditableConfig {
    text?: string;
    editing?: boolean;
    maxLength?: number;
    onStart?: () => void;
    onChange?: (value: string) => void;
    onCancel?: () => void;
    onEnd?: () => void;
}
export interface TypographyCopyConfig {
    text?: string | (() => string | Promise<string>);
    onCopy?: (text: string) => void;
    onError?: (error: unknown) => void;
}
export interface TypographyConfig {
    text: () => string;
    disabled?: boolean;
    editable?: boolean | TypographyEditableConfig;
    copyable?: boolean | TypographyCopyConfig;
    writeClipboard: (text: string) => Promise<void>;
}
export declare function createTypography(config: TypographyConfig): {
    text: () => string;
    localText: import('solid-js').SourceAccessor<string | undefined>;
    editing: import('solid-js').SourceAccessor<boolean>;
    draft: import('solid-js').SourceAccessor<string>;
    setDraft: import('solid-js').Setter<string>;
    copied: import('solid-js').SourceAccessor<boolean>;
    copying: import('solid-js').SourceAccessor<boolean>;
    startEdit: () => void;
    finishEdit: (value?: string) => void;
    cancelEdit: () => void;
    copy: () => Promise<void>;
};
