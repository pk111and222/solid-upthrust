export type AlertConfig = {
    onClose?: (e: Event) => void;
};
export type AlertIns = {
    alertEle: () => Element | undefined;
    closeEle: () => HTMLButtonElement | undefined;
    close: () => void;
    getStuas: () => boolean;
};
export declare function createAlert(config?: AlertConfig): {
    alert: (el: Element) => void;
    close: (el: HTMLButtonElement) => void;
    status: import('solid-js').SourceAccessor<boolean>;
    refs: {
        alertEle: () => Element | undefined;
        closeEle: () => HTMLButtonElement | undefined;
        close: () => void | undefined;
        getStuas: () => boolean;
    };
};
export declare const alertConfigSplits: (keyof AlertConfig)[];
