import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
import { FormFieldRule, NamePath } from 'upthrust-competence';
export interface FormItemProps {
    /** Field name path; omit for a pure render-region Item (no value bound). */
    name?: NamePath;
    label?: JSX.Element;
    /** Label alignment override (form default applies otherwise). */
    labelAlign?: 'left' | 'right';
    /** Label column width override (horizontal layout only). */
    labelWidth?: string;
    /** Let this item's label wrap (form default applies otherwise). */
    labelWrap?: boolean;
    /** Show the required asterisk; defaults to detecting `required` in rules. */
    required?: boolean;
    /** Show `:` after the label. Default follows the Form (true). */
    colon?: boolean;
    rules?: FormFieldRule[];
    initialValue?: unknown;
    dependencies?: NamePath[];
    validateTrigger?: string | string[] | false;
    validateFirst?: boolean | 'parallel';
    validateDebounce?: number;
    messageVariables?: Record<string, any>;
    normalize?: (value: any, prevValue: any, allValues: any) => any;
    getValueFromEvent?: (...args: any[]) => any;
    preserve?: boolean;
    /** Force the validation status display (overrides the field's own state). */
    validateStatus?: 'error' | 'warning' | 'validating' | 'success';
    /** Show the status icon in the widget's suffix area. */
    hasFeedback?: boolean;
    /** Custom help text; overrides the validation messages when non-empty. */
    help?: JSX.Element;
    /** Persistent hint under the validation row. */
    extra?: JSX.Element;
    /** Question-mark tooltip next to the label. */
    tooltip?: JSX.Element;
    htmlFor?: string;
    hidden?: boolean;
    disabled?: boolean;
    class?: string;
    children: JSX.Element | ((value: any, form: unknown) => JSX.Element);
    onReset?: () => void;
}
declare const FormItem: Component<FormItemProps>;
export default FormItem;
