/**
 * Headless logic for Alert — antd 6 Alert 的状态推导：banner 默认类型 / 图标、
 * closable 各入口（对象、closeText、已废弃 closeIcon）的合并与关闭状态。
 * 离场动画（max-height 收起）由 UI 层完成后调用 afterClose。
 */
export type AlertType = 'success' | 'info' | 'warning' | 'error';
export type AlertVariant = 'outlined' | 'filled';
export interface AlertClosableConfig<E = unknown, I = unknown> {
    closeIcon?: I;
    onClose?: (e: E) => void;
    afterClose?: () => void;
    [aria: `aria-${string}`]: string | undefined;
    [data: `data-${string}`]: string | undefined;
}
export type AlertConfig<E = unknown, I = unknown> = {
    type?: AlertType;
    variant?: AlertVariant;
    banner?: boolean;
    showIcon?: boolean;
    closable?: boolean | AlertClosableConfig<E, I>;
    /** @deprecated antd 已废弃，请用 closable.closeIcon。 */
    closeText?: I;
    /** @deprecated antd 已废弃，请用 closable.closeIcon。 */
    closeIcon?: I;
    /** @deprecated antd 已废弃，请用 closable.onClose。 */
    onClose?: (e: E) => void;
    /** @deprecated antd 已废弃，请用 closable.afterClose。 */
    afterClose?: () => void;
};
/** 未指定 type 时 banner 为 warning，否则 info。 */
export declare const resolveAlertType: (type: AlertType | undefined, banner?: boolean) => AlertType;
/** banner 模式在未显式设置时默认显示图标；普通模式默认不显示。 */
export declare const resolveAlertShowIcon: (showIcon: boolean | undefined, banner?: boolean) => boolean;
/** 是否可关闭：closable 对象 → true；closeText → true；布尔 closable；否则非空 closeIcon（含 0 / ''）。 */
export declare const resolveAlertClosable: <E, I>(config: Pick<AlertConfig<E, I>, "closable" | "closeText" | "closeIcon">) => boolean;
/** 关闭图标来源优先级：closable.closeIcon → closeText → closeIcon；`true` / undefined 表示默认图标。 */
export declare const resolveAlertCloseIcon: <E, I>(config: Pick<AlertConfig<E, I>, "closable" | "closeText" | "closeIcon">) => I | true | undefined;
/** closable 对象上的 aria-* / data-* 透传到关闭按钮。 */
export declare const pickAlertCloseAttrs: <E, I>(closable: AlertConfig<E, I>["closable"]) => Record<string, string>;
export declare function createAlert<E = unknown, I = unknown>(config?: AlertConfig<E, I>): {
    type: import('solid-js').SourceAccessor<"error" | "success" | "info" | "warning">;
    variant: import('solid-js').SourceAccessor<"outlined" | "filled">;
    showIcon: import('solid-js').SourceAccessor<boolean>;
    closable: import('solid-js').SourceAccessor<boolean>;
    closeIcon: import('solid-js').SourceAccessor<true | I | undefined>;
    closeAttrs: import('solid-js').SourceAccessor<Record<string, string>>;
    closed: import('solid-js').SourceAccessor<boolean>;
    close: (e: E) => void;
    afterClose: () => void;
};
export type AlertIns = ReturnType<typeof createAlert>;
export declare const alertConfigSplits: (keyof AlertConfig)[];
