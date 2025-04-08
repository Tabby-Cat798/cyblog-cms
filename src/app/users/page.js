'use client'
import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import { Card, Table, Input, Button, Popconfirm, message, Form, Modal, Select, Avatar, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, SearchOutlined } from '@ant-design/icons';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [form] = Form.useForm();

  // 获取用户列表
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('获取用户列表失败');
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('获取用户错误:', err);
      message.error(`获取用户列表失败: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 角色选项
  const roleOptions = [
    { value: 'admin', label: '管理员' },
    { value: 'user', label: '用户' },
  ];

  // 状态选项
  const statusOptions = [
    { value: 'active', label: '正常' },
    { value: 'inactive', label: '禁用' },
  ];

  // 打开新增用户模态框
  const showAddUserModal = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // 打开编辑用户模态框
  const showEditUserModal = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    });
    setIsModalVisible(true);
  };

  // 关闭模态框
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // 保存用户
  const handleSaveUser = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();
      // 确保username字段等于name
      values.username = values.name;
      
      setFormLoading(true);

      if (editingUser) {
        // 编辑现有用户
        const response = await fetch(`/api/users/${editingUser._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        });

        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || '更新用户失败');
        }
        
        message.success('用户已更新');
      } else {
        // 添加新用户
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        });

        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || '创建用户失败');
        }
        
        message.success('用户已添加');
      }
      
      // 重新获取用户列表
      fetchUsers();
      setIsModalVisible(false);
    } catch (error) {
      console.error('保存用户失败:', error);
      message.error(`操作失败: ${error.message}`);
    } finally {
      setFormLoading(false);
    }
  };

  // 删除用户
  const handleDeleteUser = async (userId) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || '删除用户失败');
      }
      
      message.success('用户已删除');
      fetchUsers();
    } catch (error) {
      console.error('删除用户失败:', error);
      message.error(`删除失败: ${error.message}`);
    }
  };

  // 根据搜索文本过滤用户
  const filteredUsers = users.filter(user => 
    (user.name && user.name.toLowerCase().includes(searchText.toLowerCase())) ||
    (user.email && user.email.toLowerCase().includes(searchText.toLowerCase()))
  );

  // 表格列定义
  const columns = [
    {
      title: '用户名',
      dataIndex: 'name',
      key: 'name',
      render: (text) => text,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const roleMap = {
          admin: { color: 'purple', label: '管理员' },
          user: { color: 'blue', label: '用户' },
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs text-white bg-${roleMap[role]?.color || 'gray'}-500`}>
            {roleMap[role]?.label || role}
          </span>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          active: { color: 'green', label: '正常' },
          inactive: { color: 'orange', label: '禁用' },
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs text-white bg-${statusMap[status]?.color || 'gray'}-500`}>
            {statusMap[status]?.label || status}
          </span>
        );
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('zh-CN'),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <div className="flex space-x-2">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => showEditUserModal(record)}
            className="text-blue-600 hover:text-blue-800"
          />
          <Popconfirm
            title="确定要删除此用户吗?"
            description="删除后无法恢复!"
            onConfirm={() => handleDeleteUser(record._id)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              type="text" 
              icon={<DeleteOutlined />} 
              className="text-red-600 hover:text-red-800"
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

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
              title="用户管理" 
              extra={
                <div className="flex space-x-4">
                  <Input
                    placeholder="搜索用户"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    prefix={<SearchOutlined />}
                    className="w-64"
                  />
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={showAddUserModal}
                  >
                    新增用户
                  </Button>
                </div>
              }
              className="shadow-md"
            >
              {loading ? (
                <div className="flex justify-center items-center p-10">
                  <Spin size="large" tip="加载中..." />
                </div>
              ) : (
                <Table 
                  columns={columns} 
                  dataSource={filteredUsers}
                  rowKey="_id"
                  pagination={{
                    pageSize: 10,
                    showTotal: (total) => `共 ${total} 个用户`
                  }}
                />
              )}
            </Card>
          </div>
        </main>
      </div>

      {/* 用户表单模态框 */}
      <Modal
        title={editingUser ? '编辑用户' : '新增用户'}
        open={isModalVisible}
        onCancel={handleCancel}
        onOk={handleSaveUser}
        okText="保存"
        cancelText="取消"
        confirmLoading={formLoading}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: 'active',
            role: 'user',
          }}
        >
          <Form.Item
            name="name"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select options={roleOptions} placeholder="请选择角色" />
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select options={statusOptions} placeholder="请选择状态" />
          </Form.Item>
          {!editingUser && (
            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
          )}
          {editingUser && (
            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: false }]}
              help="如需修改密码，请输入新密码，否则留空"
            >
              <Input.Password placeholder="留空表示不修改密码" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
} 