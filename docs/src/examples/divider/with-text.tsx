import Divider from 'upthrust-ui/source/Divider'

const TEXT = '桃李不言，下自成蹊。好的分割线应当安静地区隔内容，而不喧宾夺主。'

export default function WithText() {
  return <div data-divider-with-text>
    <Divider data-placement="center">居中标题</Divider>
    <p class="m-0">{TEXT}</p>
    <Divider titlePlacement="start" data-placement="start">靠左标题</Divider>
    <p class="m-0">{TEXT}</p>
    <Divider titlePlacement="end" data-placement="end">靠右标题</Divider>
    <p class="m-0">{TEXT}</p>
    <Divider titlePlacement="start" variant="dashed">虚线 + 靠左</Divider>
  </div>
}
