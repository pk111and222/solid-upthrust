import type { PageMeta } from '../../../routing'
import { ApiTable, Demo, DemoGrid, Section } from '../../../components/Content'
import basic from '../../../examples/upload/basic.tsx?raw'
import constraints from '../../../examples/upload/constraints.tsx?raw'
import dragger from '../../../examples/upload/dragger.tsx?raw'
import manual from '../../../examples/upload/manual.tsx?raw'
import form from '../../../examples/upload/form.tsx?raw'
import picture from '../../../examples/upload/picture.tsx?raw'
import pictureCard from '../../../examples/upload/picture-card.tsx?raw'
import actions from '../../../examples/upload/actions.tsx?raw'
import customRender from '../../../examples/upload/custom-render.tsx?raw'
import api from './upload-api.json'

export const meta: PageMeta = { title: 'Upload 上传', description: '选择或拖拽文件，管理异步上传队列、进度和结果。', group: '组件', order: 288 }

export default function UploadPage() {
  return <>
    <Section id="usage" title="使用方式">
      <p>Upload 以 UploadFile[] 管理文件队列。默认使用 XHR FormData 上传，也可注入 request 适配自有传输；beforeUpload 支持同步/异步校验，并可返回 Blob 替换待传文件。autoUpload=false 时可先选择文件，再手动开始上传。</p>
      <p>Upload 和 Dragger 都可放入 Form.Item，字段值是 UploadFile[]，提交后 resetFields 会恢复初始列表。Dragger 提供键盘可聚焦的拖放区；accept 对拖放文件同样校验，拒绝项通过 onDropReject 报告。</p>
    </Section>
    <Section id="examples" title="示例"><DemoGrid>
      <Demo id="upload/basic" title="基础上传与状态" source={basic} />
      <Demo id="upload/constraints" title="预处理、失败与数量限制" source={constraints} />
      <Demo id="upload/dragger" title="拖拽上传与类型拒绝" source={dragger} />
      <Demo id="upload/manual" title="手动上传" source={manual} />
      <Demo id="upload/form" title="Form.Item 提交与重置" source={form} />
      <Demo id="upload/picture" title="图片列表与缩略图" source={picture} />
      <Demo id="upload/picture-card" title="图片墙与数量限制" source={pictureCard} />
      <Demo id="upload/actions" title="下载、移除与附加信息" source={actions} />
      <Demo id="upload/custom-render" title="自定义文件项与重试" source={customRender} />
    </DemoGrid></Section>
    <Section id="api" title="UploadProps API"><ApiTable rows={api} /></Section>
    <Section id="limits" title="边界与可访问性">
      <p>上传传输由 action 或 request 提供；无后端时可用 request 在示例或测试中模拟。异步 beforeUpload 失败或返回 false 会丢弃对应文件，不影响同批其他文件。移除或 abort 后到达的迟到请求回调不会更新队列。</p>
      <p>原生文件选择器由浏览器提供，Dragger 可通过 Enter/空格打开；拖放空间与绘制需真实浏览器验证。专项覆盖 Chromium，不代表跨浏览器、消费者安装或发布验收。</p>
    </Section>
  </>
}
