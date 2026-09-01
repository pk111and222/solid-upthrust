import { createSignal } from "solid-js";
import { isBoolean, isFunction, isObject } from "lodash";
import { createOwnerCleanup } from "./utils";

export type ButtonVariant = 'outlined' | 'solid' | 'filled' | 'text' | 'link' | 'dashed'
export type ButtonColor = 'default' | 'primary' | 'danger'

export type ButtonConfig = {
  disabled?: boolean;
  loading?: boolean | {delay: number};
  onClick?: (e: MouseEvent) => void;
}

export type ButtonIns = {
  buttonEle: () => HTMLButtonElement | undefined;
  anchorEle: () => HTMLAnchorElement | undefined;
  click(): void;
}

export const createButton = (config: ButtonConfig = {}) => {
  const onOwnerCleanup = createOwnerCleanup();
  // ownedWrite: written from the click listener (an imperative entry point).
  const [_loading, _setLoading] = createSignal(false, { ownedWrite: true });
  const [_waveActive, _setWaveActive] = createSignal(false, { ownedWrite: true });

  const [_btnEle, _setBtnEle] = createSignal<HTMLButtonElement>(undefined, { ownedWrite: true })
  const [_anchorEle, _setAnchorEle] = createSignal<HTMLAnchorElement>(undefined, { ownedWrite: true })

  let _waveTimer: ReturnType<typeof setTimeout> | null = null

  const getRealLoading = () => {
    if(isBoolean(config.loading)) return config.loading
    if(isObject(config.loading) && typeof config.loading.delay === 'number') {
      return _loading()
    }
    return false
  }

  const changeLoading = () => {
    if(isObject(config.loading) && typeof config.loading.delay === 'number') {
      _setLoading(true)
      setTimeout(() => {
        _setLoading(false)
      }, config.loading?.delay)
    }
  }

  const triggerWave = () => {
    if (_waveTimer) clearTimeout(_waveTimer)
    _setWaveActive(true)
    _waveTimer = setTimeout(() => {
      _setWaveActive(false)
      _waveTimer = null
    }, 400)
  }

  function anchor (el: HTMLAnchorElement) {
    _setAnchorEle(el)
    onOwnerCleanup(() => {
      _setAnchorEle(undefined)
    })
  }

  function button (el: HTMLButtonElement) {
    _setBtnEle(el)
    const _click = (e: MouseEvent) => {
      if(config.disabled) return
      if(getRealLoading()) return
      changeLoading()
      triggerWave()
      const anchorElement = _anchorEle()
      if(anchorElement) {
        anchorElement.click()
      }
      if(isFunction(config.onClick)) config.onClick(e)
    }
    el.addEventListener('click', _click)
    onOwnerCleanup(() => {
      _setLoading(false)
      _setWaveActive(false)
      if (_waveTimer) clearTimeout(_waveTimer)
      _setBtnEle(undefined)
      el.removeEventListener('click', _click)
    })
  }

  const refs: ButtonIns = {
    buttonEle: () => _btnEle(),
    anchorEle: () => _anchorEle(),
    click() {
      _btnEle()?.click()
    }
  }

  return {
    loading: getRealLoading,
    waveActive: _waveActive,
    /** Reactive disabled getter — reads through the props proxy so updates flow. */
    disabled: () => !!config.disabled,
    button,
    anchor,
    refs
  }
}

export const buttonSplits: (keyof ButtonConfig)[] = ['disabled', 'loading', 'onClick']
