import Affix from 'upthrust-ui/source/Affix'
import Button from 'upthrust-ui/source/Button'

export default function Basic() {
  // 窗口为目标：文档顶栏高 64px，offsetTop 取 80 让按钮停在顶栏下方。
  return <div class="flex flex-wrap gap-md">
    <Affix offsetTop={80}>
      <Button type="primary">固定在顶部 80px</Button>
    </Affix>
  </div>
}
