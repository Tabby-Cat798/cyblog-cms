import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    
    // 连接到MongoDB
    const client = await clientPromise;
    const db = client.db('blogs');
    
    // 获取所有地理位置选项
    if (type === 'geo' || type === 'all') {
      // 使用聚合管道获取所有唯一的国家和地区
      const geoQuery = [
        {
          $match: {
            'geoInfo.country': { $exists: true, $ne: null },
          }
        },
        {
          $group: {
            _id: null,
            countries: { $addToSet: '$geoInfo.country' },
            regions: { $addToSet: '$geoInfo.region' },
          }
        },
        {
          $project: {
            _id: 0,
            countries: 1,
            regions: 1
          }
        }
      ];
      
      // 执行聚合查询
      const geoResults = await db.collection('visitor_logs').aggregate(geoQuery).toArray();
      
      // 获取并排序唯一的国家和地区
      let countries = [];
      let regions = [];
      
      if (geoResults.length > 0) {
        countries = geoResults[0].countries
          .filter(country => country && country.trim() !== '')
          .sort();
        
        regions = geoResults[0].regions
          .filter(region => region && region.trim() !== '')
          .sort();
        
        console.log(`发现 ${countries.length} 个国家和 ${regions.length} 个地区`);
      }
      
      // 如果只请求地理信息，立即返回
      if (type === 'geo') {
        return NextResponse.json({
          countries,
          regions
        });
      }
    }
    
    // 如果请求所有选项，我们还需要获取文章信息
    if (type === 'all') {
      // TODO: 返回所有数据，包括地理信息和文章信息
      return NextResponse.json({
        countries: [], // 已在上面的代码中填充
        regions: []    // 已在上面的代码中填充
      });
    }
    
    // 默认返回空数据
    return NextResponse.json({
      error: '未知的选项类型'
    }, { status: 400 });
    
  } catch (error) {
    console.error('获取筛选选项失败:', error);
    return NextResponse.json(
      { error: '获取筛选选项失败', message: error.message },
      { status: 500 }
    );
  }
} 