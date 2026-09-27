import Divider from 'upthrust-ui/source/Divider'

export default function Size() {
  return <div data-divider-size>
    <p class="m-0">small：上下 8px</p>
    <Divider size="small" data-size="small" />
    <p class="m-0">middle：上下 16px</p>
    <Divider size="middle" data-size="middle" />
    <p class="m-0">large（默认）：上下 24px</p>
    <Divider size="large" data-size="large" />
    <p class="m-0">结束</p>
  </div>
}
