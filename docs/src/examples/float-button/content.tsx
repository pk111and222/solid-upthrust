import FloatButton from 'upthrust-ui/source/FloatButton'
import Icon from 'upthrust-ui/source/Icon'

// content 可以放置文字（建议 square 形状、短文本）；icon 与 content 都不传时显示默认的文档图标。
export default function Content() {
  return <div style={{ position: 'relative', height: '160px', transform: 'translateZ(0)' }}>
    <FloatButton icon={<Icon name="file-document-outline" />} content="HELP" shape="square" style={{ right: '24px' }} />
    <FloatButton content="HELP INFO" shape="square" style={{ right: '94px' }} />
    <FloatButton icon={<Icon name="file-document-outline" />} content="文档" shape="square" style={{ right: '164px' }} />
  </div>
}
