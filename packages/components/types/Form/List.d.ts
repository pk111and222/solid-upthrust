import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
import { FormListOperations } from 'upthrust-competence';
export interface FormListProps {
    /** List name path (relative to any enclosing List). */
    name: string | (string | number)[];
    initialValue?: unknown;
    children: (fields: () => {
        name: number;
        key: number;
        isListField: true;
    }[], operations: FormListOperations) => JSX.Element;
}
/**
 * Form.List — renders a keyed row per list entry. children receives the
 * reactive field descriptors and the add/remove/move operations.
 *
 * Row keys come from the headless keyManager, so rows survive add/remove/move
 * without remounting (focus and animations preserved). Nested lists compose
 * their store prefix from the enclosing ListContext.
 */
declare const FormList: Component<FormListProps>;
export default FormList;
