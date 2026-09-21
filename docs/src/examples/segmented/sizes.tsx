import Segmented from 'upthrust-ui/source/Segmented'
export default function Sizes() {
  return <div class="px-3 flex flex-col gap-3 items-start">
    <Segmented aria-label="小尺寸" size="small" options={['列表', '卡片']} defaultValue="列表" />
    <Segmented aria-label="中尺寸" options={['列表', '卡片']} defaultValue="列表" />
    <Segmented aria-label="大尺寸" size="large" options={['列表', '卡片']} defaultValue="列表" />
  </div>
}
