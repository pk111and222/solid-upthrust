import Breadcrumb from 'upthrust-ui/source/Breadcrumb'

export default function Params() {
  const params = { id: '1' }
  return (
    <div class="flex flex-col gap-3">
      {/* path 依次累积成 #/users/1/detail；path 与字符串 title 中的 :id 由 params 替换。 */}
      <Breadcrumb params={params} items={[{ title: '用户', path: '/users' }, { title: ':id', path: ':id' }, { title: '详情 :id', path: 'detail' }]} />
      <output class="text-[12px] text-on-surface/45">params = {JSON.stringify(params)}</output>
    </div>
  )
}
