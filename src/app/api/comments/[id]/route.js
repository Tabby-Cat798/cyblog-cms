import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// 获取单条评论
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    // 验证ID格式
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: '无效的评论ID格式' },
        { status: 400 }
      );
    }
    
    // 连接到MongoDB
    const client = await clientPromise;
    const db = client.db('blogs');
    
    // 查询评论
    const comment = await db.collection('comments').findOne({ _id: new ObjectId(id) });
    
    // 如果未找到评论
    if (!comment) {
      return NextResponse.json(
        { error: '评论不存在' },
        { status: 404 }
      );
    }
    
    // 返回评论数据
    return NextResponse.json(comment);
    
  } catch (error) {
    console.error('获取评论失败:', error);
    return NextResponse.json(
      { error: '获取评论失败', message: error.message },
      { status: 500 }
    );
  }
}

// 更新评论内容
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // 验证ID格式
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: '无效的评论ID格式' },
        { status: 400 }
      );
    }
    
    // 准备更新数据
    const updateData = {
      updatedAt: new Date(),
    };
    
    // 如果提供了内容，则更新内容
    if (body.content) {
      updateData.content = body.content;
    }
    
    // 连接到MongoDB
    const client = await clientPromise;
    const db = client.db('blogs');
    
    // 更新评论
    const result = await db.collection('comments').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    // 如果未找到评论
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: '评论不存在' },
        { status: 404 }
      );
    }
    
    // 返回成功响应
    return NextResponse.json({
      success: true,
      message: '评论已成功更新',
    });
    
  } catch (error) {
    console.error('更新评论失败:', error);
    return NextResponse.json(
      { error: '更新评论失败', message: error.message },
      { status: 500 }
    );
  }
}

// 递归收集评论ID及其所有子评论ID
async function collectCommentIdsToDelete(db, commentId) {
  const idsToDelete = [commentId];
  
  // 查找所有子评论
  const childComments = await db.collection('comments')
    .find({ parentId: commentId })
    .toArray();
  
  // 递归收集子评论的ID
  for (const childComment of childComments) {
    const childIds = await collectCommentIdsToDelete(db, childComment._id.toString());
    idsToDelete.push(...childIds);
  }
  
  return idsToDelete;
}

// 删除评论
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    
    console.log('尝试删除评论:', id);
    
    // 验证ID格式
    if (!ObjectId.isValid(id)) {
      console.log('无效的评论ID格式');
      return NextResponse.json(
        { error: '无效的评论ID格式' },
        { status: 400 }
      );
    }
    
    // 连接到MongoDB
    const client = await clientPromise;
    const db = client.db('blogs');
    
    // 收集要删除的评论ID及其所有子评论ID
    const idsToDelete = await collectCommentIdsToDelete(db, id);
    
    // 将字符串ID转换为ObjectId
    const objectIdsToDelete = idsToDelete.map(id => new ObjectId(id));
    
    console.log(`将删除 ${idsToDelete.length} 条评论:`, idsToDelete);
    
    // 批量删除评论
    const result = await db.collection('comments').deleteMany({
      _id: { $in: objectIdsToDelete }
    });
    
    console.log('删除评论结果:', result);
    
    // 如果未找到评论
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: '评论不存在或已被删除' },
        { status: 404 }
      );
    }
    
    // 返回成功响应
    return NextResponse.json({
      success: true,
      message: '评论已成功删除',
      deletedCount: result.deletedCount
    });
    
  } catch (error) {
    console.error('删除评论失败:', error);
    return NextResponse.json(
      { error: '删除评论失败', message: error.message },
      { status: 500 }
    );
  }
} 