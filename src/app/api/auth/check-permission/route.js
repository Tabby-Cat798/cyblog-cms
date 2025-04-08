import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: '需要提供电子邮件地址' },
        { status: 400 }
      );
    }

    // 连接到 MongoDB
    const client = await clientPromise;
    const db = client.db('blogs');
    const usersCollection = db.collection('users');

    // 查询用户
    const user = await usersCollection.findOne({ email });
    
    console.log('权限检查:', email, '角色:', user?.role);

    // 检查用户是否存在且是否为管理员 (role === 'admin')
    if (user && user.role === 'admin') {
      return NextResponse.json({ hasPermission: true });
    } else {
      return NextResponse.json({ 
        hasPermission: false,
        message: '您没有管理员权限' 
      });
    }
  } catch (error) {
    console.error('验证权限时出错:', error);
    return NextResponse.json(
      { error: '服务器错误，请稍后再试' },
      { status: 500 }
    );
  }
} 