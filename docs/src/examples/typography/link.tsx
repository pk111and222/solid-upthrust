import { Link } from 'upthrust-ui/source/Typography'
export default function Links() {
  return <div class="flex flex-col items-start gap-3"><Link href="https://ant.design" target="_blank">设计参考</Link><Link href="https://ant.design" type="danger" underline>强调链接</Link><Link href="https://ant.design" disabled>禁用链接</Link><Link href="https://ant.design" copyable={{ text: 'https://ant.design' }}>复制链接地址</Link></div>
}
