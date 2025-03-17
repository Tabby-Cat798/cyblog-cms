'use client'
import React from 'react';
import MarkdownEditor from "../../components/MarkdownEditor";
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';

export default function EditorPage() {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* 侧边栏 */}
      <Sidebar />
      
      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部信息栏 */}
        <TopBar />
        
        {/* 主要内容 */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">创建新文章</h1>
            <MarkdownEditor />
          </div>
        </main>
      </div>
    </div>
  );
} 