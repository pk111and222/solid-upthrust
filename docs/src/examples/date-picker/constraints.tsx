import DatePicker from 'upthrust-ui/source/DatePicker'

export default function Constraints() {
  return <div class="flex flex-col gap-3 max-w-sm">
    <DatePicker min="2026-09-01" max="2026-09-30" disabledDate={date => date.endsWith('-20')} defaultValue="2026-09-15" />
    <DatePicker disabled defaultValue="2026-09-15" />
    <DatePicker status="error" placeholder="校验错误" />
  </div>
}
