'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { signIn, useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, Button, Alert, Spin, Form, Input, Divider } from 'antd';
import { GoogleOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import Image from 'next/image';

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // 使用useCallback包装checkUserPermission函数
  const checkUserPermission = useCallback(async (user) => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/check-permission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user.email }),
      });

      const data = await response.json();

      if (response.ok && data.hasPermission) {
        // 有权限，重定向到主页
        router.push('/');
      } else {
        // 无权限，显示错误信息
        setError(data.message || '您没有访问权限。只有管理员可以访问此系统。');
        // 登出
        signOut({ callbackUrl: '/login' });
      }
    } catch (err) {
      console.error('检查权限失败:', err);
      setError('验证权限时出错，请稍后再试。');
    } finally {
      setLoading(false);
    }
  }, [router, setError, setLoading]);

  useEffect(() => {
    // 如果用户已经登录，检查是否有权限
    if (status === 'authenticated' && session) {
      checkUserPermission(session.user);
    }
  }, [session, status, checkUserPermission]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signIn('google', { callbackUrl: '/login' });
    } catch (err) {
      console.error('登录失败:', err);
      setError('登录失败，请稍后再试。');
      setLoading(false);
    }
  };

  const handleCredentialsLogin = async (values) => {
    setLoading(true);
    setError('');
    
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: values.email,
        password: values.password,
      });

      if (result.error) {
        setError(result.error);
        setLoading(false);
      } else {
        // 登录成功
        router.push('/login'); // 触发重定向检查
      }
    } catch (err) {
      console.error('登录失败:', err);
      setError('登录失败，请稍后再试。');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <Card className="w-full max-w-md shadow-lg">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <Image
              src="/logo.png"  // 您需要添加您的徽标图片
              alt="CyBlog Logo"
              width={80}
              height={80}
              className="rounded-full shadow-sm"
            />
          </div>
          <h1 className="text-2xl font-bold">CyBlog 管理系统</h1>
          <p className="text-gray-500 mt-2">请登录以继续</p>
        </div>

        {error && (
          <Alert 
            message="登录失败" 
            description={error} 
            type="error" 
            className="mb-6" 
            showIcon 
            closable
            onClose={() => setError('')}
          />
        )}

        <Form
          form={form}
          name="login-form"
          initialValues={{ remember: true }}
          onFinish={handleCredentialsLogin}
          layout="vertical"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入您的邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="邮箱" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入您的密码' },
              { min: 6, message: '密码长度不能少于6个字符' }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="密码" 
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full h-10"
              size="large"
            >
              登录
            </Button>
          </Form.Item>
        </Form>

        <Divider>或</Divider>

        <Button
          type="default"
          icon={<GoogleOutlined />}
          size="large"
          onClick={handleGoogleLogin}
          loading={loading}
          className="w-full h-10 flex items-center justify-center mb-4"
        >
          使用谷歌账号登录
        </Button>
      </Card>
    </div>
  );
}