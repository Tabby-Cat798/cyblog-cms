import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { hash } from 'bcrypt';

// 获取所有用户
export async function GET() {
  try {
    // 连接到MongoDB
    const client = await clientPromise;
    const db = client.db('blogs');
    
    // 获取所有用户
    const users = await db
      .collection('users')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    // 返回用户列表
    return NextResponse.json(users);
    
  } catch (error) {
    console.error('获取用户列表失败:', error);
    return NextResponse.json(
      { error: '获取用户列表失败', message: error.message },
      { status: 500 }
    );
  }
}

// 创建新用户
export async function POST(request) {
  try {
    // 解析请求体
    const body = await request.json();
    
    // 验证必填字段
    if (!body.name || !body.email || !body.password) {
      return NextResponse.json(
        { error: '用户名、邮箱和密码不能为空' },
        { status: 400 }
      );
    }
    
    // 连接到MongoDB
    const client = await clientPromise;
    const db = client.db('blogs');
    
    // 检查用户名或邮箱是否已存在
    const existingUser = await db.collection('users').findOne({
      $or: [
        { name: body.name },
        { email: body.email }
      ]
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: '用户名或邮箱已存在' },
        { status: 400 }
      );
    }
    
    // 获取当前时间
    const now = new Date();
    
    // 密码加密
    const hashedPassword = await hash(body.password, 10);
    
    // 准备用户数据
    const user = {
      name: body.name,
      username: body.name, // 保持兼容性
      email: body.email,
      password: hashedPassword,
      role: body.role || 'user',
      status: body.status || 'active',
      avatar: body.avatar || null,
      permission: body.role === 'admin' ? 'admin' : 'user',
      createdAt: now
    };
    
    // 插入用户
    const result = await db.collection('users').insertOne(user);
    
    // 返回成功响应
    return NextResponse.json({
      success: true,
      message: '用户创建成功',
      userId: result.insertedId
    }, { status: 201 });
    
  } catch (error) {
    console.error('创建用户失败:', error);
    return NextResponse.json(
      { error: '创建用户失败', message: error.message },
      { status: 500 }
    );
  }
} 