import { Component, JSX } from 'solid-js';
import { AlertIns } from 'upthrust-competence';

type AlertType = 'primary' | 'default' | 'danger' | 'dashed';
type AlertSemantic = 'button' | 'icon' | 'text' | '';
type IconMap = 'info' | 'success' | 'warning' | 'error' | 'wait';
export interface AlertProps {
    classGroup?: Record<AlertSemantic, Record<string, boolean>>;
    type?: AlertType;
    action?: Component;
    showIcon?: boolean;
    icon?: JSX.Element | IconMap;
    onClose?: (e: Event) => void;
    afterClose?: () => void;
    closable?: boolean;
    message?: string;
    description?: string;
    children?: JSX.Element;
    ref?: (val: AlertIns) => void;
}
declare const Alert: Component<AlertProps>;
export default Alert;
