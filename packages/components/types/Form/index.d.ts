import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
import { FormInstance, FormCallbacks, FormValidateErrorEntity, Store } from 'upthrust-competence';
import { SizeType } from '../../common/type';
import { default as FormItem, FormItemProps } from './Item';
export interface FormProps {
    /** External form instance (createForm()). One is created when omitted. */
    form?: FormInstance;
    /** Form name (id prefix). */
    name?: string;
    initialValues?: Store;
    /** Default 'onChange'. */
    validateTrigger?: string | string[] | false;
    validateMessages?: Record<string, any>;
    preserve?: boolean;
    clearOnDestroy?: boolean;
    /** 'horizontal' (default) | 'vertical' | 'inline' — label placement. */
    layout?: 'horizontal' | 'vertical' | 'inline';
    size?: SizeType;
    disabled?: boolean;
    labelAlign?: 'left' | 'right';
    /** Fixed label column width, e.g. '120px' (horizontal layout only). */
    labelWidth?: string;
    /** Let long labels wrap instead of ellipsis (horizontal). Default false. */
    labelWrap?: boolean;
    /** true (default): `*` on required; false: hidden; 'optional': `(optional)` hint. */
    requiredMark?: boolean | 'optional';
    /** Show `:` after labels. Default true. */
    colon?: boolean;
    onValuesChange?: FormCallbacks['onValuesChange'];
    onFieldsChange?: FormCallbacks['onFieldsChange'];
    onFinish?: (values: Store) => void;
    onFinishFailed?: (errorInfo: FormValidateErrorEntity) => void;
    /** Render a plain div (block) instead of a <form> element. */
    component?: 'form' | 'div' | false;
    class?: string;
    style?: JSX.CSSProperties;
    children: JSX.Element;
    ref?: (form: FormInstance) => void;
}
/**
 * Form — the container that owns (or borrows) a headless createForm()
 * instance and provides it to every Form.Item below through FormContext.
 *
 * Native submit/reset are wired: submit validates everything first and only
 * calls onFinish when every field passes (antd semantics).
 */
declare const Form: Component<FormProps>;
export default Form;
export { FormItem };
export type { FormItemProps };
export { default as FormList } from './List';
export type { FormListProps } from './List';
