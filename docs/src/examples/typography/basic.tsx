import { Title, Paragraph, Text, Link } from 'upthrust-ui/source/Typography'
export default function Basic() {
  return <article><Title level={3}>设计让协作更简单</Title><Paragraph>在企业应用中，清晰的文字层级帮助使用者理解信息、完成操作。</Paragraph><Paragraph>用 <Text strong>标题</Text> 概括主题，用 <Text mark>重点标记</Text> 突出结论，再以 <Link href="https://ant.design/components/typography-cn/" target="_blank">排版指南</Link> 补充背景。</Paragraph></article>
}
