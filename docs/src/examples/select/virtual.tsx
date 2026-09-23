import Select from 'upthrust-ui/source/Select'

const options = Array.from({ length: 1000 }, (_, index) => ({ label: `项目 ${index}`, value: index }))
export default function Virtual() {
  return <div class="px-3 flex flex-col gap-3">
    <Select aria-label="千条项目" showSearch options={options} listHeight={160} listItemHeight={32} placeholder="滚动或搜索项目" />
    <p>默认只挂载视口附近的选项；可传 virtual=false 完整渲染。</p>
  </div>
}
