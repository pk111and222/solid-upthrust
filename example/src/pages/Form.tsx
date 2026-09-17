import { type Component, createSignal, Show, For } from 'solid-js'
import { Form, FormItem, FormList, Input, Button, Space, Divider, Typography, Alert } from 'upthrust-ui'
import { createForm, createFormField, type FormInstance, type Store } from 'upthrust-competence'

const { Text, Title } = Typography

/** A common async validator demo (server-side style check). */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const FormPage: Component = () => {
  // Form 实例由 ref 暴露出来，供命令式调用（校验 / 重置 / 取值）
  let formRef: FormInstance | undefined
  let listFormRef: FormInstance | undefined
  let depFormRef: FormInstance | undefined
  const [submitResult, setSubmitResult] = createSignal<string>('')
  const [failInfo, setFailInfo] = createSignal<string>('')
  const [nicknameEcho, setNicknameEcho] = createSignal('')

  const handleFinish = (values: Store) => {
    setFailInfo('')
    setSubmitResult(JSON.stringify(values, null, 2))
  }

  const handleFinishFailed = (errorInfo: any) => {
    setSubmitResult('')
    setFailInfo(`校验失败：${errorInfo.errorFields.map((f: any) => f.name.join('.')).join('、')}`)
  }

  return (
    <div class="p-6 max-w-3xl">
      <h2 class="text-2xl font-bold mb-4">Form 表单</h2>
      <p class="text-on-surface-variant mb-6">
        表单系统 = headless 数据引擎（upthrust-competence 的 createForm / createFormField）+ UI 层（Form / Form.Item / 物料）。
        校验引擎为 async-validator；Input 通过 FormItemContext 协议自动注入 value / onChange / 校验状态。
      </p>

      <h3 class="text-lg font-semibold mb-3">基础表单：注册（水平布局）</h3>
      <Form
        ref={f => { formRef = f }}
        labelAlign="right"
        labelWidth="96px"
        initialValues={{ nickname: '水滴' }}
        onFinish={handleFinish}
        onFinishFailed={handleFinishFailed}
      >
        <FormItem
          name="username"
          label="用户名"
          required
          tooltip="登录账号，创建后不可修改"
          rules={[
            { required: true, message: '请输入用户名' },
            { min: 3, max: 20, message: '用户名长度 3-20 个字符' },
          ]}
        >
          <Input placeholder="3-20 个字符" allowClear />
        </FormItem>

        <FormItem
          name="nickname"
          label="昵称"
          rules={[{ required: true, message: '请输入昵称' }]}
          extra="支持 form.watch 联动展示（下方实时回显）"
        >
          <Input
            placeholder="请输入昵称"
            onChange={v => setNicknameEcho(v)}
          />
        </FormItem>

        <FormItem
          name="email"
          label="邮箱"
          hasFeedback
          rules={[
            { required: true, message: '请输入邮箱' },
            { type: 'email', message: '邮箱格式不正确' },
          ]}
        >
          <Input placeholder="name@example.com" />
        </FormItem>

        <FormItem
          name="inviteCode"
          label="邀请码"
          hasFeedback
          validateDebounce={300}
          rules={[
            {
              validator: async (_rule, value) => {
                if (!value) return
                await sleep(600)
                if (String(value).toUpperCase() !== 'UPTHRUST') {
                  throw new Error('邀请码无效（试试 UPTHRUST）')
                }
              },
            },
          ]}
        >
          <Input placeholder="异步校验，输入 UPTHRUST" allowClear />
        </FormItem>

        <FormItem label="">
          <Space size="middle">
            <Button variant="solid" onClick={() => { void formRef?.submit().catch(() => {}) }}>提交</Button>
            <Button onClick={() => { formRef?.resetFields(); setNicknameEcho(''); setSubmitResult(''); setFailInfo('') }}>重置</Button>
            <Button variant="text" onClick={() => {
              const values = formRef?.getFieldsValue(true)
              setSubmitResult(JSON.stringify(values, null, 2))
            }}>只取值（不校验）</Button>
          </Space>
        </FormItem>
      </Form>

      <Show when={nicknameEcho()}>
        <p class="mt-2"><Text type="secondary">昵称实时回显：{nicknameEcho()}</Text></p>
      </Show>

      <Show when={failInfo()}>
        <div class="mt-4">
          <Alert type="error" message={failInfo()} closable />
        </div>
      </Show>

      <Show when={submitResult()}>
        <div class="mt-4">
          <Alert type="success" message="提交成功" description={<pre class="text-[12px] whitespace-pre-wrap">{submitResult()}</pre>} />
        </div>
      </Show>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">垂直布局 / 尺寸 / requiredMark</h3>
      <div class="flex flex-col gap-lg">
        <div>
          <Text type="secondary">layout="vertical"（label 在上方，无冒号） + size="small"</Text>
          <Form layout="vertical" size="small">
            <FormItem name="v-name" label="名称" required rules={[{ required: true, message: '请输入名称' }]}>
              <Input placeholder="small 尺寸" allowClear />
            </FormItem>
            <FormItem name="v-desc" label="描述">
              <Input placeholder="控件与 label 都随 size 缩放" />
            </FormItem>
          </Form>
        </div>
        <div>
          <Text type="secondary">requiredMark="optional"（必填无星号，可选项标注「可选」） + size="large"</Text>
          <Form requiredMark="optional" size="large" labelWidth="96px">
            <FormItem name="o-name" label="名称" rules={[{ required: true, message: '请输入名称' }]}>
              <Input placeholder="large 尺寸" />
            </FormItem>
            <FormItem name="o-remark" label="备注">
              <Input placeholder="可选项" />
            </FormItem>
          </Form>
        </div>
        <div>
          <Text type="secondary">requiredMark=false（完全隐藏星号） + labelAlign="left" + labelWrap</Text>
          <Form requiredMark={false} labelAlign="left" labelWrap labelWidth="96px">
            <FormItem name="h-long" label="一个特别长的标签文本用于演示换行">
              <Input placeholder="label 自动换行而不是省略" />
            </FormItem>
          </Form>
        </div>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">warningOnly 与 validateStatus</h3>
      <Form>
        <FormItem
          name="weakPassword"
          label="密码强度"
          hasFeedback
          rules={[
            { required: true, message: '请输入密码' },
            { min: 6, message: '至少 6 位' },
            { warningOnly: true, min: 10, message: '建议 10 位以上（警告，不阻断提交）' },
          ]}
        >
          <Input type="password" placeholder="6-9 位会警告，但不阻断" allowClear />
        </FormItem>
      </Form>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">form.watch 响应式监听</h3>
      <WatchDemo />

      <Divider />

      <h3 class="text-lg font-semibold mb-3">headless 直用（无 Form 组件）</h3>
      <p class="text-on-surface-variant mb-3">
        createForm 可脱离 UI 层独立使用（TanStack Form 定位）。下面的演示用纯信号渲染一个受控输入框 + 校验按钮：
      </p>
      <HeadlessDemo />

      <Divider />

      <h3 class="text-lg font-semibold mb-3">Form.List 动态行</h3>
      <p class="text-on-surface-variant mb-3">
        行 key 由 keyManager 管理：增删/移动行时已有行不会重挂载（输入焦点保持）。
      </p>
      <Form
        ref={f => { listFormRef = f }}
        initialValues={{ users: [{ name: '预置行' }] }}
        onFinish={values => setSubmitResult(JSON.stringify(values, null, 2))}
      >
        <FormList name="users">
          {(fields: () => { name: number; key: number; isListField: true }[], operations: { add: (v?: unknown, i?: number) => void; remove: (i: number | number[]) => void; move: (f: number, t: number) => void }) => (
            <div class="flex flex-col gap-xs">
              <For each={fields()}>
                {field => (
                  <div class="flex items-start gap-xs w-full">
                    <div class="flex-1">
                      <FormItem
                        name={[field.name, 'name']}
                        rules={[{ required: true, message: `第 ${field.name + 1} 行不能为空` }]}
                      >
                        <Input placeholder={`第 ${field.name + 1} 行`} allowClear />
                      </FormItem>
                    </div>
                    <span class="mt-[2px]">
                      <Button
                        variant="text"
                        color="danger"
                        size="small"
                        onClick={() => operations.remove(field.name)}
                      >
                        删除
                      </Button>
                    </span>
                  </div>
                )}
              </For>
              <Button
                variant="dashed"
                block
                onClick={() => operations.add()}
              >
                + 添加一行
              </Button>
            </div>
          )}
        </FormList>
        <FormItem label="">
          <Button variant="solid" onClick={() => { void listFormRef?.submit().catch(() => {}) }}>提交列表</Button>
        </FormItem>
      </Form>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">dependencies 依赖联动</h3>
      <p class="text-on-surface-variant mb-3">
        确认密码依赖密码字段：密码变更后，已输入（dirty）的确认密码自动重新校验。
      </p>
      <Form ref={f => { depFormRef = f }}>
        <FormItem name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
          <Input type="password" placeholder="请输入" allowClear />
        </FormItem>
        <FormItem
          name="confirm"
          label="确认密码"
          dependencies={['password']}
          hasFeedback
          rules={[
            { required: true, message: '请再次输入密码' },
            {
              validator: (_rule, value) => {
                if (value && value !== depFormRef?.getFieldValue('password')) {
                  return Promise.reject(new Error('两次密码不一致'))
                }
                return Promise.resolve()
              },
            },
          ]}
        >
          <Input type="password" placeholder="与密码保持一致" />
        </FormItem>
      </Form>

      <Divider />

      <Title level={5}>API 说明</Title>
      <div class="text-on-surface-variant text-[13px] leading-6">
        <p>· <Text code>Form</Text>：form / initialValues / validateTrigger / validateMessages / preserve / layout / size / disabled / labelAlign / labelWidth / labelWrap / requiredMark / colon / onFinish / onFinishFailed / onValuesChange / onFieldsChange / component=false</p>
        <p>· <Text code>Form.Item</Text>：name / label / labelAlign / labelWidth / labelWrap / rules / required / colon / tooltip / extra / help / hasFeedback / validateStatus / validateFirst / validateDebounce / dependencies / normalize / getValueFromEvent / preserve / hidden</p>
        <p>· <Text code>Input</Text>：value / defaultValue / onChange(value) / prefix / suffix / allowClear / status / size / disabled / onPressEnter</p>
        <p>· <Text code>form 实例</Text>：getFieldValue / getFieldsValue / setFieldValue / setFieldsValue / resetFields / validateFields / submit / getFieldError / isFieldTouched</p>
        <p>· 与 antd 的差异：onChange 传 <Text code>value</Text> 而非 event（Solid 生态惯例）；物料注入用 <Text code>FormItemContext + useFormItem</Text> 而非 cloneElement；默认校验文案为中文。</p>
      </div>
    </div>
  )
}

/** Pure headless demo: createForm + createFormField, no <Form> component. */
const HeadlessDemo: Component = () => {
  const form = createForm()
  const [echo, setEcho] = createSignal('')
  const [errors, setErrors] = createSignal<string[]>([])

  const runValidate = async () => {
    try {
      await form.validateFields(['code'])
      setErrors([])
    } catch (e: any) {
      setErrors(e.errorFields?.[0]?.errors ?? [])
    }
  }

  return (
    <div class="max-w-xs">
      <HeadlessFieldRenderer
        form={form}
        onEcho={v => { setEcho(v); setErrors([]) }}
        onError={errs => setErrors(errs)}
      />
      <div class="mt-2"><Text type="secondary">当前值：{echo() || '（空）'}</Text></div>
      <Show when={errors().length}>
        <div class="text-error text-[14px] mt-1">{errors()[0]}</div>
      </Show>
      <Space size="small" class="mt-2">
        <Button size="small" onClick={runValidate}>校验</Button>
        <Button size="small" variant="text" onClick={() => { form.resetFields(); setEcho(''); setErrors([]) }}>重置</Button>
      </Space>
    </div>
  )
}

// The headless field must be created inside a component body (owner), so the
// renderer component owns it and forwards value/echo to the parent.
const HeadlessFieldRenderer: Component<{
  form: FormInstance
  onEcho: (v: string) => void
  onError: (errors: string[]) => void
}> = (p) => {
  const field = createFormField(p.form, {
    get name() { return 'code' },
    get rules() {
      return [
        { required: true, message: '请输入代码' },
        { pattern: /^abc$/, message: '只接受 abc' },
      ]
    },
    get initialValue() { return undefined },
    get dependencies() { return undefined },
    get validateTrigger() { return undefined },
    get validateFirst() { return undefined },
    get validateDebounce() { return undefined },
    get messageVariables() { return undefined },
    get normalize() { return undefined },
    get getValueFromEvent() { return undefined },
    get preserve() { return undefined },
    get disabled() { return undefined },
  })
  return (
    <Input
      value={(field.value() ?? '') as string}
      onChange={v => { field.onChange(v); p.onEcho(String(v)) }}
      status={field.errors().length ? 'error' : undefined}
      placeholder="输入 abc 之外的值再点校验"
      allowClear
    />
  )
}

/** form.watch demo: reactive derived state without any props plumbing. */
const WatchDemo: Component = () => {
  const form = createForm({
    get initialValues() { return { price: 100, count: 3 } },
    get preserve() { return undefined },
    get validateMessages() { return undefined },
    get callbacks() { return undefined },
  })
  const total = form.watch((values: any) => (values.price ?? 0) * (values.count ?? 0))
  const price = form.watch('price')
  const count = form.watch('count')

  return (
    <Form form={form}>
      <FormItem name="price" label="单价" initialValue={100}>
        <Input type="number" />
      </FormItem>
      <FormItem name="count" label="数量" initialValue={3}>
        <Input type="number" />
      </FormItem>
      <p class="text-on-surface">
        总价（watch 派生）：{total()}（单价 {String(price())} × 数量 {String(count())}）
      </p>
    </Form>
  )
}

export default FormPage
