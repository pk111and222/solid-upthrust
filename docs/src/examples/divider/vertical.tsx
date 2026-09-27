import Divider from 'upthrust-ui/source/Divider'

export default function Vertical() {
  return <div data-divider-vertical>
    文本
    <Divider orientation="vertical" />
    <a href="#divider-vertical">链接</a>
    <Divider orientation="vertical" variant="dashed" />
    <a href="#divider-vertical">链接</a>
    <Divider orientation="vertical" variant="dotted" />
    <span>结束</span>
  </div>
}
