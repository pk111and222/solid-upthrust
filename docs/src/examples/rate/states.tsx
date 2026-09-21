import Rate from 'upthrust-ui/source/Rate'
export default function States() {
 return <div class="px-3 flex flex-col gap-4"><div><p>可清空</p><Rate aria-label="可清空评分" defaultValue={4} allowClear/></div><div><p>禁用</p><Rate aria-label="禁用评分" defaultValue={3} disabled/></div><div><p>自定义字符与数量</p><Rate aria-label="十级评分" defaultValue={6} count={10} character={<span class="text-sm">◆</span>}/></div></div>
}
