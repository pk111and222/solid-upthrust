import Icon from 'upthrust-ui/source/Icon'
export default function Rotate() {
  return <div class="flex gap-6">
    <Icon name="mdi:arrow-right" size="large" />
    <Icon name="mdi:arrow-right" size="large" rotate={90} />
    <Icon name="mdi:arrow-right" size="large" rotate={180} />
    <Icon name="mdi:arrow-right" size="large" rotate={270} />
  </div>
}
