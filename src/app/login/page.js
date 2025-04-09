'use client';
import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { signIn, useSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, Button, Alert, Spin, Form, Input, Divider, Modal } from 'antd';
import { GoogleOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import Image from 'next/image';

// 创建一个专门用于获取搜索参数的组件
function LoginErrorHandler({ setError, setNoPermissionModal }) {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
      // 如果错误信息是权限相关的，显示无权限弹窗
      if (errorParam.includes('权限') || errorParam.includes('admin')) {
        setNoPermissionModal(true);
      }
    }
  }, [searchParams, setError, setNoPermissionModal]);
  
  return null;
}

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [noPermissionModal, setNoPermissionModal] = useState(false);
  const [form] = Form.useForm();

  // 使用useCallback包装checkUserPermission函数
  const checkUserPermission = useCallback(async (user) => {
    try {
      setLoading(true);
      
      // 此时用户已通过NextAuth验证，直接跳转到首页
      console.log('验证通过，跳转到首页');
      router.push('/');
    } catch (err) {
      console.error('权限检查出错:', err);
      setError('验证权限时出错，请稍后再试。');
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
    try {
      // 清除之前的错误信息
      setError('');
      setLoading(true);
      
      console.log('开始Google登录流程');
      
      // 直接使用重定向模式，不等待结果
      signIn('google', {
        callbackUrl: '/login'
      }).catch(err => {
        console.error('Google登录重定向失败:', err);
      });
      
      // 不要设置错误信息，因为页面会重定向
    } catch (err) {
      console.error('Google登录初始化失败:', err);
      setError('登录初始化失败，请刷新页面重试');
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
        // 如果错误信息是权限相关的，显示无权限弹窗
        if (result.error.includes('权限') || result.error.includes('admin')) {
          setNoPermissionModal(true);
        }
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
      {/* 使用Suspense包装搜索参数处理组件 */}
      <Suspense fallback={null}>
        <LoginErrorHandler 
          setError={setError}
          setNoPermissionModal={setNoPermissionModal}
        />
      </Suspense>

      <Card className="w-full max-w-md shadow-lg">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <Image
              src="/logo.png"  // 您需要添加您的徽标图片
              alt="CyBlog Logo"
              width={80}
              height={80}
              className="rounded-full"
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

      {/* 无权限提示弹窗 */}
      <Modal
        title="无权限访问"
        open={noPermissionModal}
        onOk={() => setNoPermissionModal(false)}
        onCancel={() => setNoPermissionModal(false)}
        footer={[
          <Button key="ok" type="primary" onClick={() => setNoPermissionModal(false)}>
            我知道了
          </Button>
        ]}
      >
        <div className="py-4">
          <p className="text-red-500 font-bold mb-2">您没有权限访问此系统</p>
          <p>CyBlog管理系统仅限管理员访问。</p>
          <p className="mt-2">如需访问权限，请联系系统管理员将您的账号升级为管理员权限。</p>
        </div>
      </Modal>
    </div>
  );
}