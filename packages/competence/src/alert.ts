import { createMemo, createSignal } from "solid-js";
import isBoolean from "lodash/isBoolean.js";
import isFunction from "lodash/isFunction.js";
import isNumber from "lodash/isNumber.js";
import isObject from "lodash/isObject.js";
import { createOwnerCleanup } from "./utils";

export type AlertConfig = {
  onClose?: (e: Event) => void;
}

export type AlertIns = {
  alertEle: () => Element | undefined;
  closeEle: () => HTMLButtonElement | undefined;
  close: () => void;
  getStuas: () => boolean;
}

export function createAlert(config: AlertConfig = {}) {
  const onOwnerCleanup = createOwnerCleanup();
  const [closeBtnElem, setCloseBtnElem] = createSignal<HTMLButtonElement>()
  const [alertElem, setAlertElem]  = createSignal<Element>()

  const [_status, _setStatus] = createSignal<boolean>(true)

  function close (el: HTMLButtonElement) {
    setCloseBtnElem(el)
    const _click = (e: Event) => {
      if(isFunction(config.onClose)) config.onClose(e)
        _setStatus(false)
    }
    el.addEventListener('click', _click)
    onOwnerCleanup(() => {
      el.removeEventListener('click', _click)
      _setStatus(false)
    })
  }

  function alert (el: Element) {
    setAlertElem(el)
  }

  const refs = {
    alertEle: () => alertElem(),
    closeEle: () => closeBtnElem(),
    close: () => closeBtnElem()?.click(),
    getStuas: () => _status()
  }
  return {alert, close, status: _status, refs}
}

export const alertConfigSplits: (keyof AlertConfig)[] = ['onClose']
