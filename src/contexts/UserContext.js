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

  // 从数据库获取完整的用户信息
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users/profile');
      
      if (!response.ok) {
        throw new Error('获取用户资料失败');
      }
      
      const userProfile = await response.json();
      
      // 更新状态和 localStorage
      setUser(userProfile);
      localStorage.setItem('userInfo', JSON.stringify(userProfile));
      
      // 设置管理员权限
      if (userProfile.role === 'admin') {
        setIsAdmin(true);
        localStorage.setItem('userPermission', 'admin');
      } else {
        setIsAdmin(false);
        localStorage.removeItem('userPermission');
      }
      
      return userProfile;
    } catch (error) {
      console.error('获取用户资料失败:', error);
      message.error('获取用户资料失败，请重新登录');
      return null;
    } finally {
      setLoading(false);
    }
  };

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
        // 用户已登录，使用会话中的基本用户信息
        const sessionUserInfo = {
          id: session.user.id || '',
          name: session.user.name || '',
          email: session.user.email || '',
          image: session.user.image || '',
          provider: session.user.provider || 'google',
        };
        
        // 设置会话中的基本信息
        setUser(sessionUserInfo);
        localStorage.setItem('userInfo', JSON.stringify(sessionUserInfo));
        
        // 设置管理员权限
        if (session.user.role === 'admin') {
          setIsAdmin(true);
          localStorage.setItem('userPermission', 'admin');
        } else {
          // 如果会话中没有角色信息，尝试验证权限
          if (!isAdmin) {
            await verifyPermission(sessionUserInfo.email);
          }
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
      status,
      refreshUserProfile: fetchUserProfile
    }}>
      {children}
    </UserContext.Provider>
  );
};

// 自定义钩子，用于访问用户上下文
export const useUser = () => useContext(UserContext); 