import { createMemo, createSignal, onCleanup } from "solid-js";
import { isBoolean, isFunction, isNumber, isObject } from "lodash";

export type ButtonConfig = {
  disabled?: boolean;
  loading?: boolean | {delay: number};
  onClick?: (e: Event) => void;
}

export type ButtonIns = {
  buttonEle: () => HTMLButtonElement;
  anchorEle: () => HTMLAnchorElement;
  click(): void;
}
export const createButton = (config: ButtonConfig = {}) => {
  const [_loading, _setLoading] = createSignal(false);

  const [_btnEle, _setBtnEle] = createSignal<HTMLButtonElement>()
  const [_anchorEle, _setAnchorEle] = createSignal<HTMLAnchorElement>()

  const getRealLoading = createMemo(() => {
    if(isBoolean(config.loading)) return config.loading
    if(isObject(config.loading) && config.loading?.delay) {
      return _loading()
    }
  })

  const changeLoading = () => {
    if(isObject(config.loading) && isNumber(config.loading)) {
      _setLoading(true)
      setTimeout(() => {
        _setLoading(false)
      }, config.loading?.delay)
    }
  }

  function anchor (el: HTMLAnchorElement) {
    _setAnchorEle(el)
    onCleanup(() => {
      _setAnchorEle(undefined)
    })
  }
  
  function button (el: HTMLButtonElement) {
    _setBtnEle(el)
    const _click = (e: Event) => {
      if(config.disabled) return
      if(getRealLoading()) return 
      changeLoading()
      if(_anchorEle()) {
        _anchorEle().click()
      }
      if(isFunction(config.onClick)) config.onClick(e)
    }
    el.addEventListener('click', _click)
    onCleanup(() => {
      _setLoading(false)
      _setBtnEle(undefined)
      el.removeEventListener('click', _click)
    })
  }

  const refs: ButtonIns = {
    buttonEle: () => _btnEle(),
    anchorEle: () => _anchorEle(),
    click() {
      if(_btnEle()) _btnEle().click()
    }
  }

  return {
    loading: getRealLoading,
    disabled: config.disabled,
    button,
    anchor,
    refs
  }
}

export const buttonSplits: (keyof ButtonConfig)[] = ['disabled', 'loading', 'onClick']