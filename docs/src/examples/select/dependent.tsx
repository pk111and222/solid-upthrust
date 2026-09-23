import { createSignal } from 'solid-js'
import Select from 'upthrust-ui/source/Select'

const cities = {
  china: [{ label: '北京', value: 'beijing' }, { label: '上海', value: 'shanghai' }],
  japan: [{ label: '东京', value: 'tokyo' }, { label: '大阪', value: 'osaka' }],
}
export default function Dependent() {
  const [country, setCountry] = createSignal<string | undefined>()
  const [city, setCity] = createSignal<string | undefined>()
  return <div class="px-3 flex flex-col gap-3">
    <Select aria-label="国家" options={[{ label: '中国', value: 'china' }, { label: '日本', value: 'japan' }]}
      value={country()} onChange={next => { setCountry(next as string | undefined); setCity(undefined) }} placeholder="国家" />
    <Select aria-label="城市" options={cities[country() as keyof typeof cities] ?? []} value={city()}
      onChange={next => setCity(next as string | undefined)} disabled={!country()} placeholder="城市" />
    <output>{country() ?? '未选国家'} / {city() ?? '未选城市'}</output>
  </div>
}
