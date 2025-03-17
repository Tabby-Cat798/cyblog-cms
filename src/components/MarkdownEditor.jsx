"use client";
import React, { useState, useEffect } from "react";
import { Input } from "antd";
import MarkdownRenderer from "./MarkdownRenderer"; // ✅ 直接复用 Markdown 解析组件
const { TextArea } = Input;

const MarkdownEditor = ({ className = "" }) => {
  const [markdown, setMarkdown] = useState("");
  useEffect(()=>{
    const savedMarkdown = sessionStorage.getItem("markdownContent")
    if(savedMarkdown){
      setMarkdown(savedMarkdown)
      console.log("已从缓存中读取内容")
    }
  }, [])
  useEffect(()=>{
    sessionStorage.setItem("markdownContent", markdown)
    console.log("内容更新")
  }, [markdown])

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex flex-col md:flex-row md:space-x-4">
        {/* 📌 编辑区 */}
        <div className="basis-1/2 min-w-0 overflow-auto">
          <h3 className="text-xl font-semibold mb-2">Markdown</h3>
          <TextArea
            rows={20}
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="请输入 Markdown 格式的文章内容"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        {/* 📌 预览区（使用 MarkdownRenderer 组件） */}
        <div className="basis-1/2 min-w-0 flex flex-col">
          <h3 className="text-xl font-semibold mb-2 flex-shrink-0">Preview</h3>
          <div className="h-[450px] overflow-auto bg-white border border-gray-300 rounded p-4">
            <MarkdownRenderer content={markdown} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkdownEditor;
