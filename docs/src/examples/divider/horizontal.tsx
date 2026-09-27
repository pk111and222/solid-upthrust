import Divider from 'upthrust-ui/source/Divider'

const TEXT = '桃李不言，下自成蹊。好的分割线应当安静地区隔内容，而不喧宾夺主。'

export default function Horizontal() {
  return <div data-divider-horizontal>
    <p class="m-0">{TEXT}</p>
    <Divider />
    <p class="m-0">{TEXT}</p>
    <Divider variant="dashed" />
    <p class="m-0">{TEXT}</p>
    <Divider variant="dotted" />
    <p class="m-0">{TEXT}</p>
  </div>
}
