import Segmented from 'upthrust-ui/source/Segmented'
export default function Icons() {
  return <Segmented aria-label="带图标视图" defaultValue="list" options={[
    { label: '列表', value: 'list', icon: <span class="i-mdi-format-list-bulleted" /> },
    { label: '卡片', value: 'card', icon: <span class="i-mdi-card-outline" /> },
  ]} />
}
