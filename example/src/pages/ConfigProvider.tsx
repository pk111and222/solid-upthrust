import { createSignal } from 'solid-js'
import Button from 'upthrust-ui/source/Button'
import ConfigProvider from 'upthrust-ui/source/ConfigProvider'
import Divider from 'upthrust-ui/source/Divider'
import Form from 'upthrust-ui/source/Form'
import Input from 'upthrust-ui/source/Input'
import Modal from 'upthrust-ui/source/Modal'
import Popover from 'upthrust-ui/source/Popover'
import Select from 'upthrust-ui/source/Select'
import Switch from 'upthrust-ui/source/Switch'
import { FormItem } from 'upthrust-ui/source/Form'
export default function ConfigProviderPage() {
  const [purple, setPurple] = createSignal(true)
  const [disabled, setDisabled] = createSignal(false)
  const [small, setSmall] = createSignal(false)
  const [modal, setModal] = createSignal(false)
  return <div class="p-6 max-w-4xl">
    <h2 class="text-2xl font-bold mb-3">ConfigProvider 配置作用域</h2>
    <p class="text-on-surface-variant mb-6">UnoCSS 负责生成主题规则；ConfigProvider 为局部区域提供默认属性和颜色变量，嵌套区域只覆盖自己需要修改的部分。</p>
    <div class="flex gap-4 items-center flex-wrap mb-4">
      <label class="flex gap-2 items-center"><Switch checked={purple()} onChange={setPurple} />紫色品牌</label>
      <label class="flex gap-2 items-center"><Switch checked={small()} onChange={setSmall} />小尺寸</label>
      <label class="flex gap-2 items-center"><Switch checked={disabled()} onChange={setDisabled} />默认禁用</label>
    </div>
    <ConfigProvider componentSize={small() ? 'small' : 'large'} componentDisabled={disabled()}
      components={{ Button: { type: 'primary' }, Input: { allowClear: true, placeholder: '继承默认提示' }, Select: { placeholder: '请选择项目' } }}
      theme={{ colors: { primary: purple() ? '#722ed1' : '#1677ff', onPrimary: '#ffffff', primaryContainer: purple() ? '#f0e5ff' : '#e6f4ff', onPrimaryContainer: purple() ? '#391085' : '#003a8c' } }}
      class="p-4 rounded border border-solid border-outline-variant">
      <h3 class="text-lg font-semibold mb-3">外层品牌配置</h3>
      <div class="flex gap-3 items-center flex-wrap"><Button>继承默认值</Button><Button disabled={false} size="middle" type="default">显式属性优先</Button><Input defaultValue="输入内容保留" /><Select options={[{ label: '设计系统', value: 'design' }, { label: '运营工作台', value: 'operations' }]} /></div>
      <ConfigProvider componentSize="small" componentDisabled={false} theme={{ colors: { primary: '#08979c' } }} components={{ Input: { placeholder: '内层覆盖提示' } }} class="mt-4 p-4 rounded bg-surface-container-low">
        <h3 class="font-semibold mb-3">嵌套区域 · 青色、小尺寸、可操作</h3>
        <div class="flex gap-3 items-center flex-wrap"><Button>内层按钮</Button><Input /><Popover trigger="click" title="局部弹层" content={<div class="text-primary">弹层仍在青色主题范围内。</div>}><Button>查看局部 Popover</Button></Popover><Button onClick={() => setModal(true)}>打开局部 Modal</Button></div>
        <Modal open={modal()} title="局部主题对话框" onCancel={() => { setModal(false) }} onOk={() => { setModal(false) }}><p class="text-primary">对话框、内容与按钮继承内层配置。</p><Input placeholder="弹层内的输入框" /></Modal>
      </ConfigProvider>
      <ConfigProvider inherit={false} class="mt-4 p-4 rounded border border-solid border-outline-variant">
        <h3 class="font-semibold mb-3">重置默认属性</h3><p class="text-sm mb-3">inherit=false 隔离组件配置；颜色仍遵循 CSS 继承，可通过新的 theme 或外部样式覆盖。</p><Button>恢复默认按钮</Button>
      </ConfigProvider>
      <Form size="middle" disabled={false} class="mt-4"><FormItem label="Form 优先级"><Input placeholder="Form 的尺寸和禁用优先于外层配置" /></FormItem></Form>
    </ConfigProvider>
    <Divider />
    <h3 class="text-lg font-semibold mb-3">无容器配置</h3>
    <div class="flex gap-3"><ConfigProvider wrapper={false} componentSize="small"><Button>直接子元素 A</Button><Button>直接子元素 B</Button></ConfigProvider></div>
    <Divider />
    <h3 class="text-lg font-semibold mb-3">并列区域不受影响</h3><Button type="primary">库默认主题</Button>
    <Divider />
    <h3 class="text-lg font-semibold mb-3">外部 CSS 变量兼容</h3>
    <p class="text-sm text-on-surface-variant mb-3">这里直接注入已有 UnoCSS 变量，没有传入 theme。自定义 UnoCSS 类也可以设置同样的变量。</p>
    <ConfigProvider style={{ '--upthrust-colors-primary': '212 107 8', '--upthrust-colors-on-primary': '255 255 255' }} class="p-4 border border-solid border-outline-variant rounded">
      <Popover trigger="click" title="外部配色" content={<span class="text-primary">外部注入的橙色在弹层中也生效。</span>}><Button type="primary">外部配色弹层</Button></Popover>
    </ConfigProvider>
  </div>
}
