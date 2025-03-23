'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { message } from 'antd';

// 创建用户上下文
const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 初始化时，从 localStorage 中获取用户信息
  useEffect(() => {
    const initUserData = () => {
      try {
        const storedUser = localStorage.getItem('userInfo');
        const storedPermission = localStorage.getItem('userPermission');
        
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        
        if (storedPermission === 'admin') {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error('读取本地存储失败:', error);
      } finally {
        setLoading(false);
      }
    };

    initUserData();
  }, []);

  // 验证用户权限
  const verifyPermission = async (email) => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/check-permission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (response.ok && data.hasPermission) {
        setIsAdmin(true);
        localStorage.setItem('userPermission', 'admin');
        return true;
      } else {
        setIsAdmin(false);
        localStorage.removeItem('userPermission');
        message.error('您没有管理员权限');
        await signOut({ callbackUrl: '/login' });
        return false;
      }
    } catch (error) {
      console.error('验证权限失败:', error);
      message.error('验证权限失败，请稍后重试');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 监听会话状态变化
  useEffect(() => {
    const handleSessionChange = async () => {
      if (status === 'authenticated' && session) {
        // 用户已登录，更新用户信息
        const userInfo = {
          id: session.user.id || '',
          name: session.user.name || '',
          email: session.user.email || '',
          image: session.user.image || '',
          provider: session.user.provider || 'google',
        };
        
        // 更新状态和 localStorage
        setUser(userInfo);
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        
        // 验证用户权限
        if (!isAdmin) {
          await verifyPermission(userInfo.email);
        }
      } else if (status === 'unauthenticated') {
        // 用户未登录，清除用户信息
        setUser(null);
        setIsAdmin(false);
        localStorage.removeItem('userInfo');
        localStorage.removeItem('userPermission');
        
        // 重定向到登录页
        if (window.location.pathname !== '/login') {
          router.push('/login');
        }
      }
    };

    handleSessionChange();
  }, [session, status, isAdmin, router]);

  // 登录方法
  const login = async (provider = 'google') => {
    try {
      await signIn(provider, { callbackUrl: '/login' });
    } catch (error) {
      console.error('登录失败:', error);
      message.error('登录失败，请稍后重试');
    }
  };

  // 登出方法
  const logout = async () => {
    try {
      // 清除本地存储的用户信息
      localStorage.removeItem('userInfo');
      localStorage.removeItem('userPermission');
      setUser(null);
      setIsAdmin(false);
      
      // 退出登录
      await signOut({ callbackUrl: '/login' });
    } catch (error) {
      console.error('登出失败:', error);
      message.error('登出失败，请稍后重试');
    }
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      isAdmin, 
      login, 
      logout, 
      loading, 
      status 
    }}>
      {children}
    </UserContext.Provider>
  );
};

// 自定义钩子，用于访问用户上下文
export const useUser = () => useContext(UserContext); 