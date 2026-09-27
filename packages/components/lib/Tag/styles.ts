// @unocss-include
import { cva } from 'class-variance-authority'

/**
 * antd 6 Tag：12px 字号、20px 行高、左右 7px 内边距 + 1px 边框（总高 22px）、4px 圆角。
 * 颜色矩阵按「变体-颜色」合并为一个 tone 键（UnoCSS 只能静态扫描 variants 的字面量）。
 * 预设色板取 antd 色板第 1/3/6/7 级：filled/outlined 用 1 级底、7 级字，outlined 加 3 级边，solid 用 6 级底白字。
 */
export const tagClass = cva(
  'relative inline-flex items-center align-middle max-w-full px-[7px] text-[12px] leading-[20px] whitespace-nowrap text-start rounded-sm border border-solid transition-upthrust [&_a]:[color:inherit] [&_a:hover]:[color:inherit]',
  {
    variants: {
      tone: {
        'filled-default': 'bg-on-surface/4 text-on-surface border-transparent',
        'outlined-default': 'bg-on-surface/4 text-on-surface border-outline',
        'solid-default': 'bg-on-surface text-surface border-transparent',
        'filled-success': 'bg-[#f6ffed] text-[#52c41a] border-transparent',
        'outlined-success': 'bg-[#f6ffed] text-[#52c41a] border-[#b7eb8f]',
        'solid-success': 'bg-[#52c41a] text-[#fff] border-[#52c41a]',
        'filled-processing': 'bg-primary/10 text-primary border-transparent',
        'outlined-processing': 'bg-primary/10 text-primary border-primary/45',
        'solid-processing': 'bg-primary text-on-primary border-primary',
        'filled-error': 'bg-error/8 text-error border-transparent',
        'outlined-error': 'bg-error/8 text-error border-error/35',
        'solid-error': 'bg-error text-on-error border-error',
        'filled-warning': 'bg-[#fffbe6] text-[#faad14] border-transparent',
        'outlined-warning': 'bg-[#fffbe6] text-[#faad14] border-[#ffe58f]',
        'solid-warning': 'bg-[#faad14] text-[#fff] border-[#faad14]',
        'filled-blue': 'bg-[#e6f4ff] text-[#0958d9] border-transparent',
        'outlined-blue': 'bg-[#e6f4ff] text-[#0958d9] border-[#91caff]',
        'solid-blue': 'bg-[#1677ff] text-[#fff] border-[#1677ff]',
        'filled-purple': 'bg-[#f9f0ff] text-[#531dab] border-transparent',
        'outlined-purple': 'bg-[#f9f0ff] text-[#531dab] border-[#d3adf7]',
        'solid-purple': 'bg-[#722ed1] text-[#fff] border-[#722ed1]',
        'filled-cyan': 'bg-[#e6fffb] text-[#08979c] border-transparent',
        'outlined-cyan': 'bg-[#e6fffb] text-[#08979c] border-[#87e8de]',
        'solid-cyan': 'bg-[#13c2c2] text-[#fff] border-[#13c2c2]',
        'filled-green': 'bg-[#f6ffed] text-[#389e0d] border-transparent',
        'outlined-green': 'bg-[#f6ffed] text-[#389e0d] border-[#b7eb8f]',
        'solid-green': 'bg-[#52c41a] text-[#fff] border-[#52c41a]',
        'filled-magenta': 'bg-[#fff0f6] text-[#c41d7f] border-transparent',
        'outlined-magenta': 'bg-[#fff0f6] text-[#c41d7f] border-[#ffadd2]',
        'solid-magenta': 'bg-[#eb2f96] text-[#fff] border-[#eb2f96]',
        'filled-pink': 'bg-[#fff0f6] text-[#c41d7f] border-transparent',
        'outlined-pink': 'bg-[#fff0f6] text-[#c41d7f] border-[#ffadd2]',
        'solid-pink': 'bg-[#eb2f96] text-[#fff] border-[#eb2f96]',
        'filled-red': 'bg-[#fff1f0] text-[#cf1322] border-transparent',
        'outlined-red': 'bg-[#fff1f0] text-[#cf1322] border-[#ffa39e]',
        'solid-red': 'bg-[#f5222d] text-[#fff] border-[#f5222d]',
        'filled-orange': 'bg-[#fff7e6] text-[#d46b08] border-transparent',
        'outlined-orange': 'bg-[#fff7e6] text-[#d46b08] border-[#ffd591]',
        'solid-orange': 'bg-[#fa8c16] text-[#fff] border-[#fa8c16]',
        'filled-yellow': 'bg-[#feffe6] text-[#d4b106] border-transparent',
        'outlined-yellow': 'bg-[#feffe6] text-[#d4b106] border-[#fffb8f]',
        'solid-yellow': 'bg-[#fadb14] text-[#fff] border-[#fadb14]',
        'filled-volcano': 'bg-[#fff2e8] text-[#d4380d] border-transparent',
        'outlined-volcano': 'bg-[#fff2e8] text-[#d4380d] border-[#ffbb96]',
        'solid-volcano': 'bg-[#fa541c] text-[#fff] border-[#fa541c]',
        'filled-geekblue': 'bg-[#f0f5ff] text-[#1d39c4] border-transparent',
        'outlined-geekblue': 'bg-[#f0f5ff] text-[#1d39c4] border-[#adc6ff]',
        'solid-geekblue': 'bg-[#2f54eb] text-[#fff] border-[#2f54eb]',
        'filled-lime': 'bg-[#fcffe6] text-[#7cb305] border-transparent',
        'outlined-lime': 'bg-[#fcffe6] text-[#7cb305] border-[#eaff8f]',
        'solid-lime': 'bg-[#a0d911] text-[#fff] border-[#a0d911]',
        'filled-gold': 'bg-[#fffbe6] text-[#d48806] border-transparent',
        'outlined-gold': 'bg-[#fffbe6] text-[#d48806] border-[#ffe58f]',
        'solid-gold': 'bg-[#faad14] text-[#fff] border-[#faad14]',
        // 自定义颜色：filled/outlined 的底色、字色、边色由内联样式给出；solid 只内联底色。
        'filled-custom': 'bg-on-surface/4 text-on-surface border-transparent',
        'outlined-custom': 'bg-on-surface/4 text-on-surface border-outline',
        'solid-custom': 'text-[#fff] border-transparent',
        // 禁用：不应用任何颜色（antd 的预设/状态/自定义样式都带 :not(-disabled)）。
        'disabled-filled': 'bg-on-surface/4 text-on-surface/25 border-transparent cursor-not-allowed',
        'disabled-outlined': 'bg-on-surface/4 text-on-surface/25 border-outline cursor-not-allowed',
        'disabled-solid': 'bg-on-surface/4 text-on-surface/25 border-transparent cursor-not-allowed',
      },
    },
    defaultVariants: { tone: 'filled-default' },
  },
)

/** 图标与文字间距 7px（antd `> .anticon + span`），图标取 1em。 */
export const tagIconClass = 'inline-flex items-center shrink-0 [&>*]:shrink-0'
export const tagContentClass = 'ms-[7px] min-w-0'

/** 关闭按钮：10px 图标、左侧 3px；原生 button 提供 Tab/Enter/Space。 */
export const tagCloseClass = cva(
  'inline-flex items-center justify-center shrink-0 ms-[3px] p-0 border-0 bg-transparent rounded-sm text-[10px] leading-none cursor-pointer transition-upthrust focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-primary focus-visible:outline-offset-1 [&>*]:shrink-0',
  {
    variants: {
      state: {
        normal: 'text-on-surface/45 hover:text-on-surface',
        // solid 底色上灰色图标对比不足：沿用文字色并以透明度区分
        solid: 'text-current opacity-75 hover:opacity-100',
        disabled: 'text-on-surface/25 cursor-not-allowed',
      },
    },
    defaultVariants: { state: 'normal' },
  },
)

export const checkableTagClass = cva(
  'relative inline-flex items-center align-middle px-[7px] text-[12px] leading-[20px] whitespace-nowrap rounded-sm border border-solid border-transparent select-none transition-upthrust outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-primary focus-visible:outline-offset-1',
  {
    variants: {
      state: {
        unchecked: 'bg-transparent text-on-surface cursor-pointer hover:bg-on-surface/6 hover:text-primary active:bg-primary active:text-on-primary',
        checked: 'bg-primary text-on-primary cursor-pointer hover:bg-primary/85 active:bg-primary',
        'disabled-unchecked': 'bg-transparent text-on-surface/25 cursor-not-allowed',
        'disabled-checked': 'bg-on-surface/4 text-on-surface/25 cursor-not-allowed',
      },
    },
    defaultVariants: { state: 'unchecked' },
  },
)

export const checkableTagGroupClass = 'flex flex-wrap gap-xs'
