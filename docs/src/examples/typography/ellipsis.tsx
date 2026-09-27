import { Paragraph, Text, Link } from 'upthrust-ui/source/Typography'
const text = '这是一段用于演示溢出省略的长文本。随着容器宽度变化，文本会自动折行或截断，保留清晰的页面布局。'.repeat(3)
export default function Ellipsis() {
  return <div class="w-full max-w-[320px]"><Text class="single" ellipsis style={{ width: '100%' }}>{text}</Text><Paragraph class="multi mt-4" ellipsis={{ rows: 2 }}>{text}</Paragraph><Paragraph class="actions" ellipsis={{ rows: 2 }} copyable editable>{text}</Paragraph><Text class="inline-actions" type="danger" ellipsis copyable style={{ width: '180px' }}>{text}</Text><Link class="link-actions" href="https://ant.design" ellipsis copyable style={{ width: '180px' }}>{text}</Link></div>
}
