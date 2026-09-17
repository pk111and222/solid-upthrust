import { InternalNamePath, NamePath } from './formUtils';
import { FormFieldRule } from './formField';
export declare const defaultValidateMessages: {
    default: string;
    required: string;
    enum: string;
    whitespace: string;
    date: {
        format: string;
        parse: string;
        invalid: string;
    };
    types: {
        string: string;
        method: string;
        array: string;
        object: string;
        number: string;
        date: string;
        boolean: string;
        integer: string;
        float: string;
        regexp: string;
        email: string;
        url: string;
        hex: string;
    };
    string: {
        len: string;
        min: string;
        max: string;
        range: string;
    };
    number: {
        len: string;
        min: string;
        max: string;
        range: string;
    };
    array: {
        len: string;
        min: string;
        max: string;
        range: string;
    };
    pattern: {
        mismatch: string;
    };
};
export type ValidateMessages = typeof defaultValidateMessages;
/** Deep-merge user validateMessages over the defaults (rc-util merge). */
export declare function mergeMessages(base: any, override?: Record<string, any> | null): any;
/** Fill ${var} templates: '请输入${name}' + { name: '用户名' } → '请输入用户名'. */
export declare function replaceMessage(template: string, kv: Record<string, any>): string;
export type RuleError = {
    errors: string[];
    rule: FormFieldRule;
};
export type ValidateFieldOptions = {
    validateMessages?: Record<string, any> | null;
    messageVariables?: Record<string, any> | null;
    [key: string]: any;
};
/**
 * Validate a field's rules. Returns a promise that ALWAYS rejects with
 * RuleError[] (empty array when valid) — rc-field-form's convention so the
 * caller can catch and inspect per-rule failures.
 */
export declare function validateRules(namePath: InternalNamePath, value: unknown, rules: FormFieldRule[], options: ValidateFieldOptions, validateFirst?: boolean | 'parallel', messageVariables?: Record<string, any>): Promise<RuleError[]>;
/**
 * Run every promise and settle with their REJECTION payloads (rc
 * allPromiseFinish). Rejections carry the per-field results; the aggregate
 * resolves with an array of those payloads (empty for all-success runs).
 */
export declare function allPromiseFinish<T>(promiseList: Promise<T>[]): Promise<T[]>;
/** Does this rule set mark the field required (drives the asterisk UI)? */
export declare function isRequiredRule(rules?: FormFieldRule[] | null, name?: NamePath): boolean;
