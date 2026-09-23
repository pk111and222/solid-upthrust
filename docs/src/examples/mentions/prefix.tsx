import Mentions from 'upthrust-ui/source/Mentions'

export default function Prefix() {
  return <div class="flex flex-col gap-3 max-w-sm">
    <Mentions aria-label="话题提及" prefix="#" split=" ," rows={2}
      options={[{ value: '设计' }, { value: '研发' }, { value: '测试' }]}
      placeholder="输入 # 选择话题" />
    <Mentions aria-label="预填提及" defaultValue="请 @alice 看一下"
      options={[{ value: 'alice' }, { value: 'bob' }]} rows={2} />
  </div>
}
