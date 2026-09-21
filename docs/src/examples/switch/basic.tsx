import Switch from 'upthrust-ui/source/Switch'
export default function Basic() {
 return <div class="flex flex-wrap items-center gap-4">
  <label for="switch-basic-off">默认关闭</label><Switch id="switch-basic-off"/>
  <label for="switch-basic-on">默认开启</label><Switch id="switch-basic-on" defaultChecked/>
  <Switch checkedChildren="开" unCheckedChildren="关" defaultChecked/>
  <Switch checkedChildren={<b>是</b>} unCheckedChildren={0}/>
 </div>
}
