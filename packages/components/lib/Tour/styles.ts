// @unocss-include
import { cva } from 'class-variance-authority'

// antd 6 Tour：面板宽 520（max-width fit-content）、section 8px 圆角（primary 6px）+ boxShadowTertiary、14px / 1.5714。
export const tourRootClass = cva(['fixed', 'box-border', 'max-w-fit', 'text-[14px]', 'leading-[1.5714]', 'outline-none'], {
  variants: { type: { default: ['text-on-surface'], primary: ['text-on-primary'] } },
  defaultVariants: { type: 'default' },
})

export const tourSectionClass = cva(['relative', 'text-start', 'shadow-tertiary', 'bg-clip-padding', 'max-h-[calc(100vh-16px)]', 'overflow-auto'], {
  variants: { type: { default: ['bg-surface', 'rounded-lg'], primary: ['bg-primary', 'rounded'] } },
  defaultVariants: { type: 'default' },
})

// 关闭按钮：右上 16 / 16，22×22（fontSize × lineHeight），colorIcon → hover colorIconHover + colorBgTextHover。
export const tourCloseClass = cva([
  'absolute', 'top-[16px]', 'right-[16px]', 'w-[22px]', 'h-[22px]', 'p-0', 'border-0', 'rounded-sm', 'bg-transparent',
  'flex', 'items-center', 'justify-center', 'cursor-pointer', 'transition-colors', 'duration-mid',
  'focus-visible:outline-2', 'focus-visible:outline-solid', 'focus-visible:outline-primary/30',
], {
  variants: {
    type: {
      default: ['text-on-surface/45', 'hover:text-on-surface/88', 'hover:bg-on-surface/6', 'active:bg-on-surface/15'],
      primary: ['text-on-primary', 'hover:bg-white/15', 'active:bg-white/25'],
    },
  },
  defaultVariants: { type: 'default' },
})

// cover：上 16 + 22 + 8 = 46 让出关闭按钮，左右 16；图片铺满。
export const tourCoverClass = ['text-center', 'pt-[46px]', 'px-md', '[&_img]:w-full']
export const tourHeaderClass = ['pt-md', 'px-md', 'pb-xs', 'w-[calc(100%-22px)]', 'break-words']
export const tourTitleClass = ['font-semibold']
export const tourDescriptionClass = ['px-md', 'break-words']
export const tourFooterClass = ['flex', 'items-center', 'pt-xs', 'px-md', 'pb-md', 'text-end']
export const tourIndicatorsClass = ['inline-block']
export const tourActionsClass = ['ms-auto', 'flex', 'items-center', 'gap-xs']

// 指示点 6×6、间距 6；default 为 colorFill / colorPrimary，primary 为白 15% / 白。
export const tourIndicatorClass = cva(['inline-block', 'w-[6px]', 'h-[6px]', 'rounded-full', 'align-middle', '[&:not(:last-child)]:me-[6px]'], {
  variants: {
    state: {
      'default-idle': ['bg-on-surface/15'],
      'default-active': ['bg-primary'],
      'primary-idle': ['bg-white/15'],
      'primary-active': ['bg-white'],
    },
  },
})

// primary 主题下的按钮配色（antd prev-btn / next-btn）；default 主题沿用 Button 自身配色。
export const tourPrevButtonClass = cva([], {
  variants: { type: { default: [], primary: ['!text-on-primary', '!border-white/15', '!bg-primary', 'hover:!bg-white/15', 'hover:!border-transparent'] } },
  defaultVariants: { type: 'default' },
})
// 扩展的“跳过”按钮（text 按钮）：primary 主题下白字。
export const tourSkipButtonClass = cva([], {
  variants: { type: { default: [], primary: ['!text-on-primary', 'hover:!bg-white/15'] } },
  defaultVariants: { type: 'default' },
})
export const tourNextButtonClass = cva([], {
  variants: { type: { default: [], primary: ['!text-primary', '!border-transparent', '!bg-white', 'hover:!bg-[#f0f0f0]'] } },
  defaultVariants: { type: 'default' },
})

// 箭头：与 Tooltip 相同的 8px 旋转方块，居中压在面板边上；颜色跟随 section 背景。
export const tourArrowClass = cva(['absolute', 'w-[8px]', 'h-[8px]', 'rotate-45', 'pointer-events-none'], {
  variants: {
    type: { default: ['bg-surface'], primary: ['bg-primary'] },
    side: { top: ['-top-[4px]'], bottom: ['-bottom-[4px]'], left: ['-left-[4px]'], right: ['-right-[4px]'] },
  },
  defaultVariants: { type: 'default', side: 'top' },
})

export const tourMaskClass = ['fixed', 'inset-0']
// 高亮区（mask 镂空）随步骤切换平滑移动：antd placeholder-animated = all motionDurationSlow。
export const tourHoleClass = ['transition-all', 'duration-slow']

/** 全部静态类，供主题死类测试。 */
export const tourClassMatrix = () => {
  const out: string[] = [
    ...tourCoverClass, ...tourHeaderClass, ...tourTitleClass, ...tourDescriptionClass, ...tourFooterClass,
    ...tourIndicatorsClass, ...tourActionsClass, ...tourMaskClass, ...tourHoleClass,
  ]
  for (const type of ['default', 'primary'] as const) {
    out.push(tourRootClass({ type }), tourSectionClass({ type }), tourCloseClass({ type }), tourPrevButtonClass({ type }), tourNextButtonClass({ type }), tourSkipButtonClass({ type }))
    for (const side of ['top', 'bottom', 'left', 'right'] as const) out.push(tourArrowClass({ type, side }))
  }
  for (const state of ['default-idle', 'default-active', 'primary-idle', 'primary-active'] as const) out.push(tourIndicatorClass({ state }))
  return out
}
