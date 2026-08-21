import { Component } from 'solid-js';
import { JSX } from '@solidjs/web';
import { AlertIns } from 'upthrust-competence';
type AlertType = 'success' | 'info' | 'warning' | 'error';
export interface AlertProps {
    type?: AlertType;
    message?: JSX.Element;
    description?: JSX.Element;
    showIcon?: boolean;
    closable?: boolean;
    banner?: boolean;
    icon?: JSX.Element;
    action?: JSX.Element;
    onClose?: (e: Event) => void;
    afterClose?: () => void;
    children?: JSX.Element;
    ref?: (val: AlertIns) => void;
}
declare const Alert: Component<AlertProps>;
export default Alert;
