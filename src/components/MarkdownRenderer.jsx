"use client";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import "highlight.js/styles/github-dark.css"; // 代码高亮主题
import "../../styles/markdown-styles.css"; // 自定义 Markdown 样式

const MarkdownRenderer = ({ content }) => {
  return (
    <div className="prose prose-lg prose-gray max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeRaw,
          rehypeHighlight,
          rehypeSlug,
          rehypeAutolinkHeadings,
        ]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
