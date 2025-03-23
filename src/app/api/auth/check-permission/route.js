import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

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
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db(process.env.MONGODB_DB);
    const usersCollection = db.collection('users');

    // 查询用户
    const user = await usersCollection.findOne({ email });
    await client.close();

    // 检查用户是否存在且是否为管理员
    if (user && user.permission === 'admin') {
      return NextResponse.json({ hasPermission: true });
    } else {
      return NextResponse.json({ hasPermission: false });
    }
  } catch (error) {
    console.error('验证权限时出错:', error);
    return NextResponse.json(
      { error: '服务器错误，请稍后再试' },
      { status: 500 }
    );
  }
} 