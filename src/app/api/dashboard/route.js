import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    console.time('dashboard-total');
    
    // 连接到MongoDB
    const client = await clientPromise;
    const db = client.db('blogs');
    
    console.time('parallel-queries');
    // 并行执行所有查询
    const results = await Promise.allSettled([
      db.collection('articles').countDocuments(),
      db.collection('articles').countDocuments({ status: 'published' }),
      db.collection('articles').countDocuments({ status: 'draft' }),
      db.collection('articles')
        .aggregate([
          {
            $group: {
              _id: null,
              totalViews: { $sum: '$viewCount' }
            }
          }
        ])
        .toArray(),
      db.collection('articles')
        .aggregate([
          { $unwind: '$tags' },
          { $group: { _id: '$tags', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ])
        .toArray(),
      db.collection('articles')
        .find({ status: 'published' })
        .sort({ createdAt: -1 })
        .limit(5)
        .project({ title: 1, summary: 1, createdAt: 1, viewCount: 1, tags: 1 })
        .toArray(),
      db.collection('articles')
        .find({ status: 'published' })
        .sort({ viewCount: -1 })
        .limit(5)
        .project({ title: 1, summary: 1, createdAt: 1, viewCount: 1, tags: 1 })
        .toArray()
    ]);
    console.timeEnd('parallel-queries');
    
    // 提取结果值，如果某个查询失败则提供默认值
    const [
      totalArticlesResult,
      publishedArticlesResult,
      draftArticlesResult,
      viewsAggregationResult,
      tagsAggregationResult,
      recentArticlesResult,
      popularArticlesResult
    ] = results;
    
    const totalArticles = totalArticlesResult.status === 'fulfilled' ? totalArticlesResult.value : 0;
    const publishedArticles = publishedArticlesResult.status === 'fulfilled' ? publishedArticlesResult.value : 0;
    const draftArticles = draftArticlesResult.status === 'fulfilled' ? draftArticlesResult.value : 0;
    
    const viewsAggregation = viewsAggregationResult.status === 'fulfilled' ? viewsAggregationResult.value : [];
    const totalViews = viewsAggregation.length > 0 ? viewsAggregation[0].totalViews : 0;
    
    const tagsAggregation = tagsAggregationResult.status === 'fulfilled' ? tagsAggregationResult.value : [];
    const tagStats = tagsAggregation.map(tag => ({
      name: tag._id,
      count: tag.count
    }));
    
    const recentArticles = recentArticlesResult.status === 'fulfilled' ? recentArticlesResult.value : [];
    const popularArticles = popularArticlesResult.status === 'fulfilled' ? popularArticlesResult.value : [];
    
    // 组合统计数据
    const dashboardData = {
      stats: {
        totalArticles,
        publishedArticles,
        draftArticles,
        totalViews
      },
      tagStats,
      recentArticles,
      popularArticles
    };
    
    console.timeEnd('dashboard-total');
    // 返回仪表盘数据
    return NextResponse.json(dashboardData);
    
  } catch (error) {
    console.error('获取仪表盘数据失败:', error);
    return NextResponse.json(
      { error: '获取仪表盘数据失败', message: error.message },
      { status: 500 }
    );
  }
}