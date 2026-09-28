// @unocss-include
import Steps from 'upthrust-ui/source/Steps'

export default function Icon() {
  // icon 可以是图标类名字符串，也可以是任意节点。
  return <Steps items={[
    { title: '登录', status: 'finish', icon: 'i-mdi-account-outline' },
    { title: '验证', status: 'finish', icon: 'i-mdi-shield-check-outline' },
    { title: '支付', status: 'process', icon: <span class="i-mdi-loading animate-spin" /> },
    { title: '完成', status: 'wait', icon: 'i-mdi-emoticon-happy-outline' },
  ]} />
}
