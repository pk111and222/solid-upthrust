import { type Component } from 'solid-js'
import { Result, Divider, Button, Space } from 'upthrust-ui'

const ResultPage: Component = () => {
  return (
    <div class="p-6 max-w-4xl">
      <h2 class="text-2xl font-bold mb-4">Result 结果页</h2>
      <p class="text-on-surface-variant mb-6">用于反馈一系列操作任务的处理结果。成功、失败、警告等状态与内置的 404/403/500 页面。</p>

      <h3 class="text-lg font-semibold mb-3">四种状态</h3>
      <div class="grid grid-cols-2 gap-4">
        <div class="rounded-lg border border-outline-variant">
          <Result
            status="success"
            title="操作成功"
            subTitle="订单已提交，预计 3 个工作日内发货。"
            extra={<Button variant="solid">查看订单</Button>}
          />
        </div>
        <div class="rounded-lg border border-outline-variant">
          <Result
            status="error"
            title="提交失败"
            subTitle="请检查网络连接后重试，或联系客服处理。"
            extra={
              <>
                <Button variant="solid" color="danger">重试</Button>
                <Button variant="outlined">返回</Button>
              </>
            }
          />
        </div>
        <div class="rounded-lg border border-outline-variant">
          <Result
            status="warning"
            title="注意"
            subTitle="当前操作存在风险，请确认后继续。"
            extra={<Button variant="solid" color="danger">仍然继续</Button>}
          />
        </div>
        <div class="rounded-lg border border-outline-variant">
          <Result
            status="info"
            title="提示"
            subTitle="当前版本已是最新的 v2.4.0。"
            extra={<Button variant="outlined">查看更新日志</Button>}
          />
        </div>
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">内置状态页</h3>
      <div class="rounded-lg border border-outline-variant">
        <Result
          status="404"
          extra={<Button variant="solid" onClick={() => history.back()}>返回首页</Button>}
        />
      </div>

      <Divider />

      <div class="rounded-lg border border-outline-variant">
        <Result status="403" />
      </div>

      <Divider />

      <div class="rounded-lg border border-outline-variant">
        <Result status="500" />
      </div>

      <Divider />

      <h3 class="text-lg font-semibold mb-3">自定义图标与内容</h3>
      <div class="rounded-lg border border-outline-variant">
        <Result
          icon={<span class="i-mdi-rocket-launch text-[40px] text-primary" />}
          title="部署完成"
          subTitle="应用已成功部署到生产环境。"
          extra={
            <Space size="middle">
              <Button variant="solid">访问应用</Button>
              <Button variant="outlined">查看日志</Button>
            </Space>
          }
        >
          <div class="text-[13px] text-on-surface-variant bg-surface-variant/50 rounded p-3 font-mono">
            部署地址：https://app.example.com<br />
            版本：v2.4.0 · 耗时：1 分 32 秒
          </div>
        </Result>
      </div>
    </div>
  )
}

export default ResultPage
