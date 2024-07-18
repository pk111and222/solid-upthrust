import { createSignal, onCleanup } from "solid-js";
import { isBoolean, isFunction, isNumber, isObject } from "lodash";

export type ButtonConfig = {
  disabled?: boolean;
  loading?: boolean | {delay: number};
  onClick?: (e: Event) => void;
}

export const createButton = (config: ButtonConfig = {}) => {
  const [_loading, _setLoading] = createSignal(false);

  const getRealLoading = () => {
    if(isBoolean(config.loading)) return config.loading
    if(isObject(config.loading) && config.loading?.delay) {
      return _loading
    }
  }

  const changeLoading = () => {
    if(isObject(config.loading) && isNumber(config.loading)) {
      _setLoading(true)
      setTimeout(() => {
        _setLoading(false)
      }, config.loading?.delay)
    }
  }

  function button (el: Element) {
    const _click = (e: Event) => {
      if(config.disabled) return
      if(getRealLoading()) return 
      changeLoading()
      if(isFunction(config.onClick)) config.onClick(e)
    }
    el.addEventListener('click', _click)
    onCleanup(() => {
      _setLoading(false)
      el.removeEventListener('click', _click)
    })
  }

  return {
    loading: getRealLoading(),
    disabled: config.disabled,
    button
  }
}

export const buttonSplits: (keyof ButtonConfig)[] = ['disabled', 'loading', 'onClick']