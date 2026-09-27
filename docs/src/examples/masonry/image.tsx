import Masonry from 'upthrust-ui/source/Masonry'

/** 生成不同宽高比的占位图（SVG data URI），模拟真实图片加载后才确定高度。 */
const picture = (width: number, height: number, hue: number) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">`
    + `<rect width="100%" height="100%" fill="hsl(${hue} 60% 78%)"/>`
    + `<text x="50%" y="50%" font-size="20" fill="hsl(${hue} 40% 30%)" text-anchor="middle" dominant-baseline="middle">${width}×${height}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}
const sizes: [number, number][] = [[400, 300], [400, 560], [400, 400], [400, 240], [400, 500], [400, 320], [400, 460], [400, 280]]
const items = sizes.map(([width, height], index) => ({ key: index, data: picture(width, height, index * 40) }))

export default function Image() {
  return <Masonry
    columns={{ xs: 2, md: 4 }}
    gutter={12}
    items={items}
    // 图片的 load / error 事件在捕获阶段被监听，加载完成后自动重新排布，无需开启 fresh。
    itemRender={({ data, index }) => (
      <img class="block w-full rounded-lg" src={data} alt={`图片 ${index + 1}`} />
    )}
    data-masonry-image
  />
}
