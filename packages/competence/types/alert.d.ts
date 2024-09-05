export type AlertConfig = {
    onClose?: (e: Event) => void;
};
export type AlertIns = {
    alertEle: () => Element;
    closeEle: () => HTMLButtonElement;
    close: () => void;
    getStuas: () => boolean;
};
export declare function createAlert(config?: AlertConfig): {
    alert: (el: Element) => void;
    close: (el: HTMLButtonElement) => void;
    status: import('solid-js').Accessor<boolean>;
    refs: {
        alertEle: () => Element;
        closeEle: () => HTMLButtonElement;
        close: () => void;
        getStuas: () => boolean;
    };
};
export declare const alertConfigSplits: (keyof AlertConfig)[];
