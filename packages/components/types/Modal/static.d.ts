import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
import { ModalProps } from './index';
export interface ModalStaticConfig extends Omit<ModalProps, 'open' | 'defaultOpen' | 'onOk' | 'onCancel' | 'children' | 'ref'> {
    content?: JSX.Element;
    icon?: JSX.Element | null;
    /** A callback accepting close controls dismissal itself; promises auto-close on success. */
    onOk?: (close: () => void) => void | boolean | Promise<unknown>;
    onCancel?: (close: () => void) => void | boolean | Promise<unknown>;
}
export interface ModalStaticResult {
    destroy: () => void;
    update: (config: Partial<ModalStaticConfig> | ((previous: ModalStaticConfig) => Partial<ModalStaticConfig>)) => void;
}
/** DOM and roots are allocated only when an imperative method is called. */
export declare function createModalMethods(ModalView: Component<ModalProps>): {
    confirm: (config: ModalStaticConfig) => ModalStaticResult;
    info: (config: ModalStaticConfig) => ModalStaticResult;
    success: (config: ModalStaticConfig) => ModalStaticResult;
    warning: (config: ModalStaticConfig) => ModalStaticResult;
    error: (config: ModalStaticConfig) => ModalStaticResult;
    destroyAll: () => void;
};
