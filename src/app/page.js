import MarkdownEditor from "../components/MarkdownEditor";
import MarkdownRenderer from "../components/MarkdownRenderer";
const markdownContent = `
# 自定义 Markdown 渲染

## 这里是二级标题

- 这是一个列表项
- 这是另一个列表项

**加粗文本**
_斜体文本_
~~删除线~~

\`\`\`js
console.log("代码高亮测试");
\`\`\`
`;
export default function Home() {
  return (
    // 父容器设置为 flex 布局，外层样式根据需要调整
    <div className="flex h-screen ">
      <MarkdownEditor className="max-w-4xl mx-auto my-4 p-4 bg-gray-100 rounded flex-1" />
    </div>
    // <div className="container mx-auto p-6">
    //   <MarkdownRenderer content={markdownContent} />
    // </div>
  );
}
