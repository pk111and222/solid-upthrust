import { SizeType } from '../../common/type';
/**
 * FormItemControl — the injection contract between Form.Item and form
 * widgets (Input, and future Select/Checkbox/…).
 *
 * Solid has no cloneElement, so a Form.Item can't inject value/onChange
 * into an already-created child. Instead the Item exposes this context and
 * every first-party form widget consumes it via useFormItem(): explicit
 * props win, context fills the rest.
 */
export type FormItemControl = {
    /** Reactive field value (undefined when the Item has no name). */
    value: () => unknown;
    /** Report a new value (marks touched, updates store, triggers validation). */
    onChange: (value: any, event?: Event) => void;
    /** 'error' | 'warning' | 'validating' | 'success' | undefined */
    validateStatus: () => 'error' | 'warning' | 'validating' | 'success' | undefined;
    /** id for label htmlFor association. */
    id: () => string | undefined;
    disabled: () => boolean | undefined;
    size: () => SizeType | undefined;
};
export declare const FormItemContext: import('solid-js').Context<FormItemControl | null>;
/**
 * Consume the surrounding Form.Item control. Returns a partial when no Item
 * wraps the widget (standalone usage).
 */
export declare const useFormItem: (props: {
    value?: unknown;
    onChange?: (value: any, event?: Event) => void;
    disabled?: boolean;
    id?: string;
    size?: SizeType;
    status?: "error" | "warning";
}) => {
    value: () => unknown;
    onChange: (next: any, event?: Event) => void;
    disabled: () => boolean | undefined;
    id: () => string | undefined;
    size: () => SizeType | undefined;
    status: () => "error" | "warning" | undefined;
};
