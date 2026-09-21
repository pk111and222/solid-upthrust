import Segmented from 'upthrust-ui/source/Segmented'
export default function Status() {
  return <div class="px-3 flex flex-col gap-3 items-start">
    <Segmented aria-label="错误状态" status="error" options={['个人', '团队']} defaultValue="个人" />
    <Segmented aria-label="警告状态" status="warning" options={['个人', '团队']} defaultValue="团队" />
  </div>
}
