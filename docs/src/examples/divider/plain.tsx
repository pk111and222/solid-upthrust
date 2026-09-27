import Divider from 'upthrust-ui/source/Divider'

const TEXT = '标题默认使用加大字号与中等字重；plain 让标题回到正文样式，适合作为轻量说明。'

export default function Plain() {
  return <div data-divider-plain>
    <p class="m-0">{TEXT}</p>
    <Divider plain>正文样式标题</Divider>
    <p class="m-0">{TEXT}</p>
    <Divider titlePlacement="start" plain>靠左正文样式</Divider>
    <p class="m-0">{TEXT}</p>
  </div>
}
