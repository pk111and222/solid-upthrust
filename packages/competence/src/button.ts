import { createSignal } from "solid-js";
import isBoolean from "lodash/isBoolean.js";
import isObject from "lodash/isObject.js";
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

  const [_btnEle, _setBtnEle] = createSignal<HTMLButtonElement | undefined>(undefined, { ownedWrite: true })
  const [_anchorEle, _setAnchorEle] = createSignal<HTMLAnchorElement | undefined>(undefined, { ownedWrite: true })

  let loadingTimer: ReturnType<typeof setTimeout> | undefined
  let detach: (() => void) | undefined
  onOwnerCleanup(() => {
    detach?.()
    clearTimeout(loadingTimer)
    if (_waveTimer) clearTimeout(_waveTimer)
    _setBtnEle(undefined)
    _setAnchorEle(undefined)
  })

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
      clearTimeout(loadingTimer)
      loadingTimer = setTimeout(() => {
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

  function bind(el: HTMLButtonElement | HTMLAnchorElement) {
    detach?.()
    _setBtnEle(el.tagName === 'BUTTON' ? el as HTMLButtonElement : undefined)
    _setAnchorEle(el.tagName === 'A' ? el as HTMLAnchorElement : undefined)
    const click = (e: MouseEvent) => {
      if (config.disabled || getRealLoading()) {
        e.preventDefault()
        e.stopPropagation()
        return
      }
      changeLoading()
      triggerWave()
      config.onClick?.(e)
    }
    el.addEventListener('click', click as EventListener)
    detach = () => el.removeEventListener('click', click as EventListener)
  }
  const anchor = (el: HTMLAnchorElement) => bind(el)
  const button = (el: HTMLButtonElement) => bind(el)

  const refs: ButtonIns = {
    buttonEle: () => _btnEle(),
    anchorEle: () => _anchorEle(),
    click() {
      (_btnEle() ?? _anchorEle())?.click()
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
