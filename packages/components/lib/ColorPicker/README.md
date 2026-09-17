# ColorPicker

```tsx
import { ColorPicker } from 'upthrust-ui'
<ColorPicker defaultValue="#1677ff" showText allowClear
  onChange={(color, css) => console.log(color?.toHexString(), css)} />
```

单色选择器，无第三方颜色或 UI 依赖。支持二维饱和度/亮度取色、色相与透明度滑块、颜色文本输入和分组预设色。所有滑块可通过键盘调整，Escape 关闭弹层；颜色输入中的 Escape 撤销未提交文本。

- `value/defaultValue`：颜色字符串、`Color`、`{r,g,b,a?}`、`{h,s,b,a?}`；`null` 清空。HSB 的 s/b 为 0–100，RGB 为 0–255，alpha 为 0–1。输入支持 HEX 3/4/6/8 位、RGB(A)、HSL(A)、HSB(A) 和 transparent；暂不支持其他命名色、CSS 变量、色域函数或渐变色。
- `format/defaultFormat`：hex/rgb/hsb。格式只影响显示文本，`onChange(color, css)` 的第二个参数始终是有效 RGB(A) CSS。`Color` 提供 `toRgb/toHsb/toHexString/toRgbString/toHsbString/toCssString`。
- `onChange` 在取色过程中实时触发；`onChangeComplete` 在拖动/滑块操作结束、提交文本或选择预设时触发。受控值由父级接收后更新显示；回调携带候选颜色。非法文本保留并展示错误，不覆盖已有颜色。
- `allowClear` 开启清除，触发 `onChange(null, '')`、`onClear` 和 `onChangeComplete(null)`。透明色仍是一个颜色，与清除区分。
- `disabledAlpha` 隐藏透明度并强制输出不透明颜色；`disabledFormat` 锁定格式；`disabled` 禁用交互。
- `open/defaultOpen/onOpenChange` 控制弹层；`placement` 复用 Popover 位置。`inline` 直接渲染面板。
- `showText` 支持布尔值或 `(color) => JSX`；`size` 支持 small/middle/large；`status` 支持 error/warning；`class/style/panelClass` 调整外观。
- `presets` 为 `{ label, colors: ColorInput[] }[]`，非法预设会被忽略。
- `id/aria-label` 标注触发按钮；`name` 输出隐藏表单字段（HEX 或空字符串）。接入 FormItem 后字段值是 HEX 字符串或 null，公开 onChange 仍收到 Color 对象。

示例：`example/src/pages/ColorPicker.tsx`。headless 入口是 `upthrust-competence` 的 `createColorPicker`，也可通过 `upthrust-competence/es/colorPicker` 导入。
