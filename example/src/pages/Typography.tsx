import { Component } from "solid-js";
import { Typography, Text, Title, Paragraph, Link } from 'upthrust-ui';

const TypographyPage: Component = () => {
  return <>
    <h3>标题 Title</h3>
    <Title level={1}>h1. Upthrust UI</Title>
    <Title level={2}>h2. Upthrust UI</Title>
    <Title level={3}>h3. Upthrust UI</Title>
    <Title level={4}>h4. Upthrust UI</Title>
    <Title level={5}>h5. Upthrust UI</Title>

    <h3 class="mt-4">文本类型 Text Types</h3>
    <div class="flex flex-col gap-2">
      <Text>Upthrust UI (default)</Text>
      <Text type="secondary">Upthrust UI (secondary)</Text>
      <Text type="success">Upthrust UI (success)</Text>
      <Text type="warning">Upthrust UI (warning)</Text>
      <Text type="danger">Upthrust UI (danger)</Text>
      <Text disabled>Upthrust UI (disabled)</Text>
    </div>

    <h3 class="mt-4">文字装饰 Decorations</h3>
    <div class="flex flex-col gap-2">
      <Text strong>Bold 粗体</Text>
      <Text italic>Italic 斜体</Text>
      <Text underline>Underline 下划线</Text>
      <Text delete>Strikethrough 删除线</Text>
      <Text code>Code 代码</Text>
      <Text mark>Mark 标记</Text>
      <Text keyboard>Keyboard 键盘</Text>
    </div>

    <h3 class="mt-4">组合装饰</h3>
    <div class="flex flex-col gap-2">
      <Text strong italic type="danger">Bold + Italic + Danger</Text>
      <Text underline code>Underline + Code</Text>
      <Text strong keyboard>Bold + Keyboard</Text>
    </div>

    <h3 class="mt-4">段落 Paragraph</h3>
    <Paragraph>
      Upthrust UI, a design language for background applications, is refined by the Upthrust team.
      Upthrust UI, a design language for background applications, is refined by the Upthrust team.
    </Paragraph>
    <Paragraph type="secondary">
      Upthrust UI, a design language for background applications, is refined by the Upthrust team.
    </Paragraph>

    <h3 class="mt-4">省略号 Ellipsis</h3>
    <div class="w-md">
      <Paragraph ellipsis>
        Upthrust UI, a design language for background applications, is refined by the Upthrust team. Upthrust UI, a design language for background applications, is refined by the Upthrust team. Upthrust UI, a design language for background applications, is refined by the Upthrust team.
      </Paragraph>
      <Paragraph ellipsis={{ rows: 2 }}>
        Upthrust UI, a design language for background applications, is refined by the Upthrust team. Upthrust UI, a design language for background applications, is refined by the Upthrust team. Upthrust UI, a design language for background applications, is refined by the Upthrust team. Upthrust UI, a design language for background applications.
      </Paragraph>
    </div>

    <h3 class="mt-4">链接 Link</h3>
    <div class="flex gap-4">
      <Link href="https://github.com">GitHub</Link>
      <Link href="https://github.com" target="_blank">新窗口打开</Link>
      <Link disabled>禁用链接</Link>
    </div>
  </>
};

export default TypographyPage;
