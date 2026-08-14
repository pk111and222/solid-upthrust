import { Component } from "solid-js";
import { Masonry, Divider } from 'upthrust-ui';

const MasonryPage: Component = () => {
  const heights = [120, 200, 150, 180, 100, 250, 160, 140, 220, 130, 190, 170]
  const colors = ['#0055ff20', '#00aa5520', '#ff550020', '#aa00ff20', '#ffaa0020', '#00ccff20']

  return (
    <div class="p-6 max-w-5xl">
      <h2 class="text-2xl font-semibold mb-4">Masonry 瀑布流</h2>

      <h3 class="text-lg font-medium mb-2">基本使用 (4列)</h3>
      <Masonry columns={4} gutter={12}>
        {heights.map((h, i) => (
          <div
            class="rounded-lg flex items-center justify-center text-sm font-medium border border-solid border-outline/20"
            style={{ height: `${h}px`, background: colors[i % colors.length] }}
          >
            Item {i + 1}
          </div>
        ))}
      </Masonry>

      <Divider />

      <h3 class="text-lg font-medium mb-2">3列 + 大间距</h3>
      <Masonry columns={3} gutter={24}>
        {heights.map((h, i) => (
          <div
            class="rounded-lg flex items-center justify-center text-sm font-medium border border-solid border-outline/20"
            style={{ height: `${h}px`, background: colors[i % colors.length] }}
          >
            Item {i + 1}
          </div>
        ))}
      </Masonry>

      <Divider />

      <h3 class="text-lg font-medium mb-2">顺序排列 (sequential)</h3>
      <Masonry columns={3} gutter={12} sequential>
        {heights.map((h, i) => (
          <div
            class="rounded-lg flex items-center justify-center text-sm font-medium border border-solid border-outline/20"
            style={{ height: `${h}px`, background: colors[i % colors.length] }}
          >
            Item {i + 1}
          </div>
        ))}
      </Masonry>

      <Divider />

      <h3 class="text-lg font-medium mb-2">不同行列间距 gutter=[16, 8]</h3>
      <Masonry columns={4} gutter={[16, 8]}>
        {heights.slice(0, 8).map((h, i) => (
          <div
            class="rounded-lg flex items-center justify-center text-sm font-medium border border-solid border-outline/20"
            style={{ height: `${h}px`, background: colors[i % colors.length] }}
          >
            Item {i + 1}
          </div>
        ))}
      </Masonry>
    </div>
  )
}

export default MasonryPage
