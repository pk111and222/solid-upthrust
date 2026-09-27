import { createSignal } from 'solid-js'
import { Paragraph, Text } from 'upthrust-ui/source/Typography'
export default function Copyable() {
  const [result, setResult] = createSignal('等待复制')
  return <><Paragraph copyable>这段内容可以复制</Paragraph><Paragraph copyable={{ text: '项目编号 UT-2026', icon: <span class="i-mdi-content-copy" />, tooltips: '复制项目编号', onCopy: value => setResult(`已复制：${value}`), onError: () => setResult('复制失败，请检查浏览器权限') }}>复制指定内容</Paragraph><Text copyable={{ text: async () => '异步生成的分享文案' }}>异步复制</Text><p role="status">{result()}</p></>
}
