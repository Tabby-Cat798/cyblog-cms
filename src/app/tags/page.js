'use client'
import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import { Card, Tag, Input, Button, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';

export default function TagsPage() {
  // 模拟标签数据
  const initialTags = [
    { id: 1, name: 'Next.js', count: 5, color: 'blue' },
    { id: 2, name: 'React', count: 8, color: 'cyan' },
    { id: 3, name: 'JavaScript', count: 12, color: 'orange' },
    { id: 4, name: 'CSS', count: 6, color: 'green' },
    { id: 5, name: 'Tailwind', count: 4, color: 'purple' },
    { id: 6, name: '博客', count: 7, color: 'magenta' },
    { id: 7, name: '教程', count: 9, color: 'red' },
    { id: 8, name: '前端', count: 15, color: 'volcano' },
    { id: 9, name: '后端', count: 3, color: 'geekblue' },
    { id: 10, name: '数据库', count: 2, color: 'lime' },
  ];

  const [tags, setTags] = useState(initialTags);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [editInputIndex, setEditInputIndex] = useState(-1);
  const [editInputValue, setEditInputValue] = useState('');

  // 添加新标签
  const handleAddTag = () => {
    if (inputValue && !tags.some(tag => tag.name === inputValue)) {
      const colors = ['blue', 'cyan', 'orange', 'green', 'purple', 'magenta', 'red', 'volcano', 'geekblue', 'lime'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
      const newTag = {
        id: tags.length + 1,
        name: inputValue,
        count: 0,
        color: randomColor
      };
      
      setTags([...tags, newTag]);
      setInputVisible(false);
      setInputValue('');
      message.success(`标签 "${inputValue}" 已添加`);
    }
  };

  // 编辑标签
  const handleEditTag = (index) => {
    setEditInputIndex(index);
    setEditInputValue(tags[index].name);
  };

  // 保存编辑的标签
  const handleEditInputConfirm = (index) => {
    const newTags = [...tags];
    newTags[index].name = editInputValue;
    setTags(newTags);
    setEditInputIndex(-1);
    setEditInputValue('');
    message.success('标签已更新');
  };

  // 删除标签
  const handleDeleteTag = (index) => {
    const newTags = [...tags];
    newTags.splice(index, 1);
    setTags(newTags);
    message.success('标签已删除');
  };

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
            <Card 
              title="标签管理" 
              extra={
                !inputVisible ? (
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={() => setInputVisible(true)}
                  >
                    新建标签
                  </Button>
                ) : null
              }
              className="shadow-md"
            >
              {/* 添加标签输入框 */}
              {inputVisible && (
                <div className="mb-4 flex">
                  <Input
                    type="text"
                    size="middle"
                    className="w-64"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onPressEnter={handleAddTag}
                    placeholder="输入标签名称"
                    autoFocus
                  />
                  <Button 
                    type="primary" 
                    icon={<SaveOutlined />} 
                    onClick={handleAddTag}
                    className="ml-2"
                  >
                    保存
                  </Button>
                  <Button 
                    icon={<CloseOutlined />} 
                    onClick={() => setInputVisible(false)}
                    className="ml-2"
                  >
                    取消
                  </Button>
                </div>
              )}

              {/* 标签列表 */}
              <div className="flex flex-wrap gap-3">
                {tags.map((tag, index) => {
                  if (editInputIndex === index) {
                    // 编辑状态
                    return (
                      <div key={tag.id} className="flex items-center">
                        <Input
                          size="small"
                          className="w-24 mr-1"
                          value={editInputValue}
                          onChange={(e) => setEditInputValue(e.target.value)}
                          onPressEnter={() => handleEditInputConfirm(index)}
                          autoFocus
                        />
                        <Button 
                          size="small" 
                          icon={<SaveOutlined />} 
                          onClick={() => handleEditInputConfirm(index)}
                          className="mr-1"
                        />
                        <Button 
                          size="small" 
                          icon={<CloseOutlined />} 
                          onClick={() => setEditInputIndex(-1)}
                        />
                      </div>
                    );
                  }
                  
                  // 显示状态
                  return (
                    <div key={tag.id} className="group relative">
                      <Tag 
                        color={tag.color} 
                        className="px-3 py-1 text-sm"
                      >
                        {tag.name} ({tag.count})
                      </Tag>
                      <div className="absolute top-0 right-0 -mt-2 -mr-2 hidden group-hover:flex">
                        <Button 
                          size="small" 
                          type="text" 
                          icon={<EditOutlined />} 
                          onClick={() => handleEditTag(index)}
                          className="bg-white shadow-sm rounded-full p-1 text-blue-600 hover:text-blue-800 mr-1"
                        />
                        <Popconfirm
                          title="确定要删除这个标签吗?"
                          onConfirm={() => handleDeleteTag(index)}
                          okText="是"
                          cancelText="否"
                        >
                          <Button 
                            size="small" 
                            type="text" 
                            icon={<DeleteOutlined />} 
                            className="bg-white shadow-sm rounded-full p-1 text-red-600 hover:text-red-800"
                          />
                        </Popconfirm>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
} 