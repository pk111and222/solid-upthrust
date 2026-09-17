import { FormInstance } from 'upthrust-competence';
import { SizeType } from '../../common/type';
/**
 * FormContext — the form instance + form-level defaults shared by every
 * Form.Item below the <Form>.
 */
export type FormContextValue = {
    form: () => FormInstance;
    validateTrigger: () => string | string[] | false;
    size: () => SizeType;
    disabled: () => boolean;
    layout: () => 'horizontal' | 'vertical' | 'inline';
    labelAlign: () => 'left' | 'right';
    /** Fixed label column width (e.g. '120px'); undefined = label sizes to content. */
    labelWidth: () => string | undefined;
    labelWrap: () => boolean;
    /** true (default): `*` on required; false: hidden; 'optional': `(optional)` on optional. */
    requiredMark: () => boolean | 'optional';
    /** Show `:` after labels. Default true (antd colon default). */
    colon: () => boolean;
};
export declare const FormContext: import('solid-js').Context<FormContextValue | null>;
export declare const useFormContext: () => FormContextValue | null;
/**
 * ListContext — Form.List nesting support. Each List level contributes a
 * prefix (its name) and a key manager; child Items and nested Lists resolve
 * their full namePath through it. getKey maps an inner path index to the
 * stable row key (so keyed For rows survive add/remove/move).
 */
export type FormListContextValue = {
    prefixName: () => (string | number)[];
    getKey: (namePath: (string | number)[]) => [number, (string | number)[]];
};
export declare const FormListContext: import('solid-js').Context<FormListContextValue | null>;
export declare const useFormListContext: () => FormListContextValue | null;
