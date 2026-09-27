import { createSignal } from 'solid-js'
import Divider from 'upthrust-ui/source/Divider'
import Tag, { CheckableTag } from 'upthrust-ui/source/Tag'

const brands = [
  { name: 'Twitter', icon: 'i-mdi-twitter', color: '#55acee' },
  { name: 'Youtube', icon: 'i-mdi-youtube', color: '#cd201f' },
  { name: 'Facebook', icon: 'i-mdi-facebook', color: '#3b5999' },
  { name: 'LinkedIn', icon: 'i-mdi-linkedin', color: '#55acee' },
]

export default function IconTags() {
  const [checked, setChecked] = createSignal([true, false, false, false])
  return <div>
    <Divider titlePlacement="start">带图标的标签</Divider>
    <div class="flex flex-wrap items-center gap-2">{brands.map(brand => <Tag icon={<span class={brand.icon} />} color={brand.color}>{brand.name}</Tag>)}</div>
    <Divider titlePlacement="start">带图标的可选标签</Divider>
    <div class="flex flex-wrap items-center gap-2">
      {brands.map((brand, index) => <CheckableTag icon={<span class={brand.icon} />} checked={checked()[index]} onChange={value => setChecked(checked().map((item, i) => i === index ? value : item))}>{brand.name}</CheckableTag>)}
    </div>
  </div>
}
