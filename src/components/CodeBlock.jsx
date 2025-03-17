// CodeBlock.js
import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow as tomorrowStyle, coy as coyStyle } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CodeBlock = ({ inline, className, children, ...props }) => {
  // 从 className 中提取语言，如 language-js 或 language-html
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';

  // 根据语言选择不同的样式，你可以自行调整选择逻辑
  let style;
  if (language === 'js' || language === 'javascript') {
    style = tomorrowStyle;
  } else if (language === 'html') {
    style = coyStyle;
  } else {
    style = tomorrowStyle;
  }

  return !inline && match ? (
    <SyntaxHighlighter
      style={style}
      language={language}
      PreTag="div"
      {...props}
    >
      {String(children).replace(/\n$/, '')}
    </SyntaxHighlighter>
  ) : (
    <code className={className} {...props}>
      {children}
    </code>
  );
};

export default CodeBlock;
