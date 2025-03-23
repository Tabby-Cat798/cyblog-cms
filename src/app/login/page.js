'use client';
import React, { useEffect, useState } from 'react';
import { signIn, useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, Button, Alert, Spin } from 'antd';
import { GoogleOutlined, UserOutlined } from '@ant-design/icons';

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 如果用户已经登录，检查是否有权限
    if (status === 'authenticated' && session) {
      checkUserPermission(session.user);
    }
  }, [session, status, router]);

  const checkUserPermission = async (user) => {
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
        setError('您没有访问权限。只有管理员可以访问此系统。');
        // 登出
        signOut({ callbackUrl: '/login' });
      }
    } catch (err) {
      console.error('检查权限失败:', err);
      setError('验证权限时出错，请稍后再试。');
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <Card className="w-full max-w-md shadow-lg">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-4xl shadow-sm">
              <UserOutlined />
            </div>
          </div>
          <h1 className="text-2xl font-bold">CyBlog 管理系统</h1>
          <p className="text-gray-500 mt-2">请使用谷歌账号登录</p>
        </div>

        {error && (
          <Alert 
            message="登录失败" 
            description={error} 
            type="error" 
            className="mb-6" 
            showIcon 
            closable
          />
        )}

        <div className="flex justify-center">
          <Button
            type="primary"
            icon={<GoogleOutlined />}
            size="large"
            onClick={handleGoogleLogin}
            loading={loading}
            className="w-full h-12 flex items-center justify-center"
          >
            使用谷歌账号登录
          </Button>
        </div>
      </Card>
    </div>
  );
} 