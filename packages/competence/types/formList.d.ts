import { FormInstance, StoreValue } from './form';
import { InternalNamePath, NamePath } from './formUtils';
/**
 * Headless form list — the signal-based port of rc-field-form's List.
 *
 * Owns the keyManager { keys, id } so rows keep stable identities across
 * add/remove/move (input focus and animations survive). The array value
 * itself lives in the store under `prefixName`; operations mutate through
 * the store so change events and validation fire like any field write.
 */
export type FormListField = {
    /** Row index in the CURRENT value array (positional). */
    name: number;
    /** Stable identity key (survives remove/move; used as For key). */
    key: number;
    isListField: true;
};
export type FormListOperations = {
    /** Append (or insert at `index`) a row with an optional default value. */
    add: (defaultValue?: StoreValue, index?: number) => void;
    /** Remove one index or several. */
    remove: (index: number | number[]) => void;
    /** Move a row from one index to another (key travels with it). */
    move: (from: number, to: number) => void;
};
export type FormListConfig = {
    readonly name: NamePath;
    readonly initialValue?: StoreValue | undefined;
    readonly rules?: unknown[] | undefined;
    readonly preserve?: boolean | undefined;
};
export declare function createFormList(form: FormInstance, config: FormListConfig): {
    /** Reactive row descriptors: { name: index, key: stable key }. */
    fields: import('solid-js').SourceAccessor<FormListField[]>;
    /** Reactive list value (array in the store at prefixName). */
    value: import('solid-js').SourceAccessor<any[]>;
    prefixName: import('solid-js').SourceAccessor<InternalNamePath>;
    operations: FormListOperations;
};
export type FormList = ReturnType<typeof createFormList>;
