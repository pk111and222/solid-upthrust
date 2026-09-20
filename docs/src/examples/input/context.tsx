import { createSignal } from 'solid-js'
import Input from 'upthrust-ui/source/Input'
import { InputSearch as Search } from 'upthrust-ui/source/Input'
import ConfigProvider from 'upthrust-ui/source/ConfigProvider'
import Form, { FormItem } from 'upthrust-ui/source/Form'
export default function Demo() {
  const [result, setResult] = createSignal('')
  return <ConfigProvider componentSize="large"><Form initialValues={{ name: '字段默认值', query: '字段搜索' }}><FormItem name="name" label="姓名"><Input allowClear /></FormItem><FormItem name="query" label="关键词"><Search onSearch={setResult} /></FormItem></Form><output>搜索字段：{result()}</output></ConfigProvider>
}
