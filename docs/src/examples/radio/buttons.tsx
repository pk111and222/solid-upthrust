import { RadioGroup } from 'upthrust-ui/source/Radio'
export default function Buttons() {
 return <div class="flex flex-col items-start gap-4">
  <RadioGroup optionType="button" defaultValue="sh" options={[{label:'北京',value:'bj'},{label:'上海',value:'sh'},{label:'广州',value:'gz',disabled:true},{label:'深圳',value:'sz'}]}/>
  <RadioGroup optionType="button" options={[{label:'唯一选项',value:'only'}]}/>
  <RadioGroup optionType="button" disabled defaultValue="a" options={[{label:'禁用 A',value:'a'},{label:'禁用 B',value:'b',disabled:false}]}/>
 </div>
}
