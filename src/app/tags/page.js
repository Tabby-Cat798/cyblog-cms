'use client'
import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import { Card, Table, Input, Button, Popconfirm, message, Form, Modal, Select, Avatar } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, SearchOutlined } from '@ant-design/icons';

export default function UsersPage() {
  // 模拟用户数据
  const initialUsers = [
    { id: 1, username: 'admin', name: '管理员', email: 'admin@example.com', role: 'admin', status: 'active', avatar: null, createdAt: '2023-03-01' },
    { id: 2, username: 'editor', name: '小明', email: 'editor@example.com', role: 'editor', status: 'active', avatar: null, createdAt: '2023-03-10' },
    { id: 3, username: 'user1', name: '张三', email: 'user1@example.com', role: 'user', status: 'active', avatar: null, createdAt: '2023-03-15' },
    { id: 4, username: 'user2', name: '李四', email: 'user2@example.com', role: 'user', status: 'inactive', avatar: null, createdAt: '2023-03-20' },
    { id: 5, username: 'guest', name: '访客', email: 'guest@example.com', role: 'guest', status: 'active', avatar: null, createdAt: '2023-03-25' },
  ];

  const [users, setUsers] = useState(initialUsers);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  // 角色选项
  const roleOptions = [
    { value: 'admin', label: '管理员' },
    { value: 'editor', label: '编辑' },
    { value: 'user', label: '普通用户' },
    { value: 'guest', label: '访客' },
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
      username: user.username,
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
  const handleSaveUser = () => {
    form.validateFields().then(values => {
      if (editingUser) {
        // 编辑现有用户
        const updatedUsers = users.map(user => 
          user.id === editingUser.id ? { ...user, ...values } : user
        );
        setUsers(updatedUsers);
        message.success('用户已更新');
      } else {
        // 添加新用户
        const newUser = {
          id: users.length + 1,
          ...values,
          avatar: null,
          createdAt: new Date().toISOString().split('T')[0]
        };
        setUsers([...users, newUser]);
        message.success('用户已添加');
      }
      setIsModalVisible(false);
    });
  };

  // 删除用户
  const handleDeleteUser = (userId) => {
    const updatedUsers = users.filter(user => user.id !== userId);
    setUsers(updatedUsers);
    message.success('用户已删除');
  };

  // 根据搜索文本过滤用户
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchText.toLowerCase()) ||
    user.name.toLowerCase().includes(searchText.toLowerCase()) ||
    user.email.toLowerCase().includes(searchText.toLowerCase())
  );

  // 表格列定义
  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      render: (text, record) => (
        <div className="flex items-center">
          <Avatar 
            icon={<UserOutlined />} 
            className="mr-2"
            src={record.avatar}
          />
          {text}
        </div>
      ),
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
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
          admin: { color: 'blue', label: '管理员' },
          editor: { color: 'green', label: '编辑' },
          user: { color: 'cyan', label: '普通用户' },
          guest: { color: 'orange', label: '访客' },
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
          inactive: { color: 'red', label: '禁用' },
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
            onConfirm={() => handleDeleteUser(record.id)}
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
              <Table 
                columns={columns} 
                dataSource={filteredUsers}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showTotal: (total) => `共 ${total} 个用户`
                }}
              />
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
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
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
        </Form>
      </Modal>
    </div>
  );
}