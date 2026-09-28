import { For } from 'solid-js'

/** 示例共用的长内容区块：每块高 360px，id 由前缀 + 序号组成（全页唯一）。 */
export function Sections(props: { prefix: string; count?: number; height?: number }) {
  const list = () => Array.from({ length: props.count ?? 3 }, (_, i) => i + 1)
  return <div class="flex flex-col gap-md">
    <For each={list()}>{index => (
      <div id={`${props.prefix}-${index}`} data-section={index}
        class="rounded-lg bg-primary-container/40 p-md text-on-surface"
        style={{ height: `${props.height ?? 360}px` }}>
        Part {index}
      </div>
    )}</For>
  </div>
}
