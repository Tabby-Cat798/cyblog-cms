import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { hash } from 'bcrypt';

// 获取单个用户
export async function GET(request, { params }) {
  try {
    const id = params.id;
    
    // 验证ObjectId格式
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: '无效的用户ID格式' },
        { status: 400 }
      );
    }
    
    // 连接到MongoDB
    const client = await clientPromise;
    const db = client.db('blogs');
    
    // 查找用户
    const user = await db.collection('users').findOne({
      _id: new ObjectId(id)
    });
    
    // 如果用户不存在
    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }
    
    // 返回用户信息（不包括密码）
    const { password, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
    
  } catch (error) {
    console.error('获取用户详情失败:', error);
    return NextResponse.json(
      { error: '获取用户详情失败', message: error.message },
      { status: 500 }
    );
  }
}

// 更新用户
export async function PUT(request, { params }) {
  try {
    const id = params.id;
    
    // 验证ObjectId格式
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: '无效的用户ID格式' },
        { status: 400 }
      );
    }
    
    // 解析请求体
    const body = await request.json();
    
    // 验证必填字段
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: '用户名和邮箱不能为空' },
        { status: 400 }
      );
    }
    
    // 连接到MongoDB
    const client = await clientPromise;
    const db = client.db('blogs');
    
    // 检查是否有其他用户使用相同的用户名或邮箱
    const existingUser = await db.collection('users').findOne({
      _id: { $ne: new ObjectId(id) },
      $or: [
        { name: body.name },
        { email: body.email }
      ]
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: '用户名或邮箱已被其他用户使用' },
        { status: 400 }
      );
    }
    
    // 准备更新数据
    const updateData = {
      name: body.name,
      username: body.name, // 保持兼容性
      email: body.email,
      role: body.role || 'user',
      status: body.status || 'active',
      permission: body.role === 'admin' ? 'admin' : 'user',
      updatedAt: new Date()
    };
    
    // 如果提供了新密码，则更新密码
    if (body.password) {
      updateData.password = await hash(body.password, 10);
    }
    
    // 查找并更新用户
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    // 如果用户不存在
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }
    
    // 返回成功响应
    return NextResponse.json({
      success: true,
      message: '用户更新成功'
    });
    
  } catch (error) {
    console.error('更新用户失败:', error);
    return NextResponse.json(
      { error: '更新用户失败', message: error.message },
      { status: 500 }
    );
  }
}

// 删除用户
export async function DELETE(request, { params }) {
  try {
    const id = params.id;
    
    // 验证ObjectId格式
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: '无效的用户ID格式' },
        { status: 400 }
      );
    }
    
    // 连接到MongoDB
    const client = await clientPromise;
    const db = client.db('blogs');
    
    // 删除用户
    const result = await db.collection('users').deleteOne({
      _id: new ObjectId(id)
    });
    
    // 如果用户不存在
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }
    
    // 返回成功响应
    return NextResponse.json({
      success: true,
      message: '用户删除成功'
    });
    
  } catch (error) {
    console.error('删除用户失败:', error);
    return NextResponse.json(
      { error: '删除用户失败', message: error.message },
      { status: 500 }
    );
  }
} 