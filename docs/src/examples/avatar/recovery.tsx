import { createSignal } from 'solid-js'
import Avatar from 'upthrust-ui/source/Avatar'
import Button from 'upthrust-ui/source/Button'
const good = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="#52c41a"/></svg>')
export default function Recovery() {
  const [src, setSrc] = createSignal('data:image/png;base64,broken')
  const [status, setStatus] = createSignal('加载中')
  return <div class="flex flex-wrap items-center gap-4"><Avatar src={src()} alt="可恢复头像" onError={() => { setStatus('已回退到字符') }}>备</Avatar><Button onClick={() => { setSrc(good); setStatus('已更换资源') }}>更换图片</Button><span role="status">{status()}</span></div>
}
