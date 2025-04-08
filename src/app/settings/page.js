'use client'
import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import '@ant-design/v5-patch-for-react-19';
import { Switch, Card, Spin, message, Typography, Space, Divider } from 'antd';
import { EyeOutlined, CommentOutlined, MessageOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    articles: {
      defaultShowViewCount: true,
      defaultShowCommentCount: true,
      defaultAllowComments: true
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 获取系统设置
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/settings');
      if (!response.ok) {
        throw new Error('获取系统设置失败');
      }
      const data = await response.json();
      setSettings(data);
    } catch (err) {
      console.error('获取系统设置错误:', err);
      message.error('获取系统设置失败: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 更新设置
  const updateSetting = async (key, value) => {
    // 构建更新对象
    let updateData = { ...settings };
    
    // 更新特定字段
    if (key === 'defaultShowViewCount' || key === 'defaultShowCommentCount' || key === 'defaultAllowComments') {
      updateData.articles[key] = value;
    }
    
    try {
      setSaving(true);
      
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        throw new Error('更新系统设置失败');
      }
      
      setSettings(updateData);
      message.success('系统设置已更新');
    } catch (err) {
      console.error('更新系统设置错误:', err);
      message.error('更新系统设置失败: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSwitchChange = (key, checked) => {
    updateSetting(key, checked);
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
          <div className="max-w-3xl mx-auto">
            <Title level={2}>系统设置</Title>
            <Divider />
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Spin size="large" tip="加载中..." />
              </div>
            ) : (
              <Card title="文章显示设置" className="mb-6 shadow-md">
                <Space direction="vertical" className="w-full">
                  <div className="flex justify-between items-center py-2">
                    <Space>
                      <EyeOutlined className="text-blue-500 text-lg" />
                      <Text strong>显示文章浏览量</Text>
                    </Space>
                    <Switch 
                      checked={settings.articles.defaultShowViewCount} 
                      onChange={(checked) => handleSwitchChange('defaultShowViewCount', checked)}
                      loading={saving}
                    />
                  </div>
                  <Divider style={{ margin: '12px 0' }} />
                  
                  <div className="flex justify-between items-center py-2">
                    <Space>
                      <CommentOutlined className="text-green-500 text-lg" />
                      <Text strong>显示文章评论数</Text>
                    </Space>
                    <Switch 
                      checked={settings.articles.defaultShowCommentCount} 
                      onChange={(checked) => handleSwitchChange('defaultShowCommentCount', checked)}
                      loading={saving}
                    />
                  </div>
                  <Divider style={{ margin: '12px 0' }} />
                  
                  <div className="flex justify-between items-center py-2">
                    <Space>
                      <MessageOutlined className="text-purple-500 text-lg" />
                      <Text strong>允许文章评论</Text>
                    </Space>
                    <Switch 
                      checked={settings.articles.defaultAllowComments} 
                      onChange={(checked) => handleSwitchChange('defaultAllowComments', checked)}
                      loading={saving}
                    />
                  </div>
                </Space>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
} 