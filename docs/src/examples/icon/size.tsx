import Icon from 'upthrust-ui/source/Icon'
export default function Size() {
  return <div class="flex items-center gap-6">
    <Icon name="mdi:home" size="small" />
    <Icon name="mdi:home" size="middle" />
    <Icon name="mdi:home" size="large" />
    <Icon name="mdi:home" size={32} />
    <Icon name="mdi:home" size="3rem" />
  </div>
}
