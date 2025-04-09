'use client';
import React from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import VisitorManager from '@/components/VisitorManager';

export default function VisitorsPage() {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* 侧边栏 */}
      <Sidebar />
      
      {/* 主内容区 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部栏 */}
        <TopBar />
        
        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto p-6">
          <VisitorManager />
        </div>
      </div>
    </div>
  );
} 