import Affix from 'upthrust-ui/source/Affix'
import Button from 'upthrust-ui/source/Button'

export default function Bottom() {
  // offsetBottom：原位置在视口下方时固定在窗口底部 20px，滚到原位置后回到文档流。
  return <Affix offsetBottom={20}>
    <Button type="primary">固定在底部 20px</Button>
  </Affix>
}
