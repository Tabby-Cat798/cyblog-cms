import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// 根据IP获取地理位置信息
async function getIpGeoLocation(ip) {
  try {
    // 使用免费的IP-API服务
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,region,city`);
    const data = await response.json();
    
    if (data.status === 'success') {
      return {
        country: data.country,
        countryCode: data.countryCode,
        region: data.regionName || data.region,
        city: data.city
      };
    } else {
      console.warn(`获取IP地理位置失败: ${ip}`);
      return null;
    }
  } catch (error) {
    console.error(`IP地理位置查询错误: ${ip}`, error);
    return null;
  }
}

// 获取访客数据
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all'; // all 或 users
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const ipFilter = searchParams.get('ipFilter'); // 新增: IP筛选
    const countryFilter = searchParams.get('country'); // 新增: 国家筛选
    const regionFilter = searchParams.get('region'); // 新增: 省份/地区筛选
    const usernameFilter = searchParams.get('username'); // 新增: 用户名筛选
    const articleFilter = searchParams.get('article'); // 新增: 文章筛选
    
    console.log('API收到的分页参数:', { page, pageSize, type });
    console.log('筛选条件:', { ipFilter, countryFilter, regionFilter, usernameFilter, articleFilter });
    
    // 连接到MongoDB
    const client = await clientPromise;
    const db = client.db('blogs');
    
    // 如果有用户名筛选，先查找符合条件的用户
    let userIdsForUsernameFilter = [];
    if (usernameFilter) {
      const users = await db.collection('users')
        .find({ 
          $or: [
            { name: { $regex: usernameFilter, $options: 'i' } },
            { email: { $regex: usernameFilter, $options: 'i' } }
          ] 
        })
        .project({ _id: 1 })
        .toArray();
      
      userIdsForUsernameFilter = users.map(user => user._id.toString());
      console.log(`找到符合用户名 "${usernameFilter}" 的用户ID:`, userIdsForUsernameFilter);
      
      // 如果没有找到匹配的用户但有搜索关键词，返回空结果
      if (userIdsForUsernameFilter.length === 0 && usernameFilter) {
        return NextResponse.json({
          visitors: [],
          total: 0,
          page,
          pageSize,
          totalPages: 0
        });
      }
    }
    
    // 构建查询条件
    const query = {
      // 直接在数据库查询中过滤掉爬虫数据
      userAgent: { 
        $exists: true, 
        $ne: null,
        $ne: ""  // 排除空字符串
      }, 
      $and: [
        // 排除包含爬虫关键词的userAgent
        { userAgent: { $not: /bot/i } },
        { userAgent: { $not: /crawler/i } },
        { userAgent: { $not: /spider/i } },
        { userAgent: { $not: /lighthouse/i } },
        { userAgent: { $not: /headless/i } },
        { userAgent: { $not: /monitor/i } },
        { userAgent: { $not: /scraper/i } },
        { userAgent: { $not: /phantom/i } },
        { userAgent: { $not: /slurp/i } },   // Yahoo爬虫
        { userAgent: { $not: /baidu/i } },   // 百度爬虫
        { userAgent: { $not: /googlebot/i } }, // Google爬虫
        { userAgent: { $not: /bingbot/i } },   // Bing爬虫
        { userAgent: { $not: /yandex/i } },    // Yandex爬虫
        
        // 排除特定系统版本
        { userAgent: { $not: /Windows NT 6\.1/i } }, // Windows 7
        { userAgent: { $not: /Windows NT 5\./i } },  // Windows XP
        
        // 过滤未知设备和浏览器
        // 确保userAgent能够识别出操作系统 
        { userAgent: { $regex: /(Windows|Macintosh|Linux|Android|iOS|iPhone|iPad)/i } },
        // 确保userAgent能够识别出浏览器
        { userAgent: { $regex: /(Chrome|Firefox|Safari|Edge|MSIE|Opera|Trident)/i } }
      ]
    };
    
    // 根据类型筛选
    if (type === 'users') {
      query.userId = { $exists: true, $ne: null };
    }
    
    // 根据日期范围筛选
    if (startDate || endDate) {
      query.timestamp = {};
      
      if (startDate) {
        // 直接使用带时间的日期字符串
        query.timestamp.$gte = new Date(startDate);
        console.log('查询开始时间:', new Date(startDate).toISOString());
      }
      
      if (endDate) {
        // 直接使用带时间的日期字符串
        query.timestamp.$lte = new Date(endDate);
        console.log('查询结束时间:', new Date(endDate).toISOString());
      }
    }
    
    // 根据文章ID筛选
    if (articleFilter) {
      // 检查文章ID是否为有效的ObjectId
      let articleId;
      try {
        articleId = new ObjectId(articleFilter);
      } catch (error) {
        // 如果不是有效的ObjectId，直接使用原始值
        articleId = articleFilter;
      }
      
      // 构建path筛选条件，匹配访问该文章的路径
      // 访问格式通常是 /posts/{articleId}
      query.path = { $regex: `/posts/${articleFilter}`, $options: 'i' };
      console.log('按文章ID筛选:', articleFilter);
    }
    
    // 根据用户名筛选 (如果有)
    if (usernameFilter && userIdsForUsernameFilter.length > 0) {
      query.userId = { 
        $in: userIdsForUsernameFilter
      };
    }
    
    // 根据IP地址筛选
    if (ipFilter) {
      query.ip = { $regex: ipFilter, $options: 'i' }; // 使用正则匹配支持部分IP查询
    }
    
    // 根据国家和地区筛选 (这些字段会在后续处理中添加)
    if (countryFilter) {
      query['geoInfo.country'] = { $regex: countryFilter, $options: 'i' };
    }
    
    if (regionFilter) {
      query['geoInfo.region'] = { $regex: regionFilter, $options: 'i' };
    }
    
    console.log('数据库查询条件:', JSON.stringify(query, null, 2));
    
    // 计算未过滤前的总记录数
    const totalBeforeFiltering = await db.collection('visitor_logs').countDocuments({});
    
    // 计算过滤后的总记录数
    const total = await db.collection('visitor_logs').countDocuments(query);
    
    console.log('访客记录统计:', {
      过滤前总数: totalBeforeFiltering,
      过滤后总数: total,
      过滤掉的记录数: totalBeforeFiltering - total,
      过滤比例: ((totalBeforeFiltering - total) / totalBeforeFiltering * 100).toFixed(2) + '%'
    });
    
    // 获取访客数据
    const visitors = await db.collection('visitor_logs')
      .find(query)
      .sort({ timestamp: -1 }) // 按时间倒序
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray();
    
    // 打印分页信息
    console.log('分页数据信息:', {
      总记录数: total,
      当前页: page,
      每页条数: pageSize,
      跳过记录数: (page - 1) * pageSize,
      限制条数: pageSize,
      当前返回记录数: visitors.length,
      总页数: Math.ceil(total / pageSize)
    });
    
    // 为每个访客添加地理位置信息
    const enrichedVisitorsWithGeo = [];
    for (const visitor of visitors) {
      let visitorWithGeo = { ...visitor };
      
      // 如果IP地址存在且没有地理信息，获取地理位置信息
      if (visitor.ip && (!visitor.geoInfo || !visitor.geoInfo.country)) {
        const geoInfo = await getIpGeoLocation(visitor.ip);
        if (geoInfo) {
          visitorWithGeo.geoInfo = geoInfo;
          
          // 可以选择将地理信息更新到数据库以便缓存
          try {
            await db.collection('visitor_logs').updateOne(
              { _id: visitor._id },
              { $set: { geoInfo: geoInfo } }
            );
          } catch (error) {
            console.error('更新访客地理信息失败:', error);
          }
        }
      }
      
      enrichedVisitorsWithGeo.push(visitorWithGeo);
    }
    
    // 如果有用户ID，查询用户信息
    const visitorIds = enrichedVisitorsWithGeo
      .filter(v => v.userId)
      .map(v => {
        try {
          return new ObjectId(v.userId);
        } catch (e) {
          console.error('无法转换用户ID为ObjectId:', v.userId, e);
          return null;
        }
      })
      .filter(Boolean);
    
    console.log('需要查询的用户IDs:', visitorIds.map(id => id.toString()));
    
    let users = [];
    if (visitorIds.length > 0) {
      users = await db.collection('users')
        .find({ _id: { $in: visitorIds } })
        .project({ _id: 1, name: 1, email: 1, avatar: 1 })
        .toArray();
      
      console.log('查询到的用户数据:', users.map(u => ({ 
        _id: u._id.toString(), 
        name: u.name
      })));
    }
    
    // 合并用户信息到访客数据
    const enrichedVisitors = enrichedVisitorsWithGeo.map(visitor => {
      const visitorData = {
        ...visitor,
        id: visitor._id.toString(),
      };
      
      if (visitor.userId) {
        // 确保userId是字符串形式
        const visitorUserId = typeof visitor.userId === 'string' 
          ? visitor.userId 
          : visitor.userId.toString();
        
        // 在users数组中查找匹配的用户
        const user = users.find(u => u._id.toString() === visitorUserId);
        
        if (user) {
          visitorData.userName = user.name;
          visitorData.userEmail = user.email;
          visitorData.userAvatar = user.avatar;
          console.log(`成功为访客 ${visitor._id} 关联用户数据: ${user.name}`);
        } else {
          console.warn(`警告: 未找到访客 ${visitor._id} 关联的用户数据, userId=${visitorUserId}`);
        }
      }
      
      return visitorData;
    });
    
    // 查询文章信息
    const pathsWithIds = enrichedVisitorsWithGeo
      .filter(v => v.path && v.path.startsWith('/posts/'))
      .map(v => {
        const parts = v.path.split('/');
        if (parts.length >= 3) {
          return parts[2]; // 获取文章ID
        }
        return null;
      })
      .filter(Boolean);
    
    let articles = [];
    if (pathsWithIds.length > 0) {
      articles = await db.collection('articles')
        .find({ _id: { $in: pathsWithIds.map(id => {
          try {
            return new ObjectId(id);
          } catch {
            return id;
          }
        }) } })
        .project({ _id: 1, title: 1 })
        .toArray();
    }
    
    // 合并文章标题到访客数据
    const finalVisitors = enrichedVisitors.map(visitor => {
      if (visitor.path && visitor.path.startsWith('/posts/')) {
        const parts = visitor.path.split('/');
        if (parts.length >= 3) {
          const articleId = parts[2];
          const article = articles.find(a => a._id.toString() === articleId);
          if (article) {
            visitor.articleTitle = article.title;
          }
        }
      }
      return visitor;
    });
    
    return NextResponse.json({
      visitors: finalVisitors,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    });
    
  } catch (error) {
    console.error('获取访客数据失败:', error);
    return NextResponse.json(
      { error: '获取访客数据失败', message: error.message },
      { status: 500 }
    );
  }
}

// 删除访客数据
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const countryFilter = searchParams.get('country'); // 新增: 按国家筛选删除
    const regionFilter = searchParams.get('region'); // 新增: 按省份/地区筛选删除
    const articleFilter = searchParams.get('article'); // 新增: 按文章筛选删除
    
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: '必须提供开始和结束日期时间' },
        { status: 400 }
      );
    }
    
    console.log('删除时间范围:', {
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString()
    });
    
    // 连接到MongoDB
    const client = await clientPromise;
    const db = client.db('blogs');
    
    // 构建删除条件 - 只基于时间范围和可选的地区筛选
    const deleteQuery = { 
      timestamp: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };
    
    // 添加可选的国家和地区筛选条件
    if (countryFilter) {
      deleteQuery['geoInfo.country'] = { $regex: countryFilter, $options: 'i' };
    }
    
    if (regionFilter) {
      deleteQuery['geoInfo.region'] = { $regex: regionFilter, $options: 'i' };
    }
    
    // 添加文章筛选条件
    if (articleFilter) {
      deleteQuery.path = { $regex: `/posts/${articleFilter}`, $options: 'i' };
    }
    
    // 删除前计数
    const totalRecords = await db.collection('visitor_logs').countDocuments(deleteQuery);
    
    console.log('删除统计:', {
      时间范围内总记录数: totalRecords,
      国家筛选: countryFilter || '无',
      地区筛选: regionFilter || '无',
      文章筛选: articleFilter ? `文章ID: ${articleFilter}` : '无'
    });
    
    // 执行删除
    const result = await db.collection('visitor_logs').deleteMany(deleteQuery);
    
    return NextResponse.json({
      success: true,
      message: `成功删除 ${result.deletedCount} 条访客记录`,
      deletedCount: result.deletedCount,
      affectedRange: { 
        startDate: new Date(startDate).toISOString(), 
        endDate: new Date(endDate).toISOString() 
      },
      filters: {
        country: countryFilter,
        region: regionFilter,
        article: articleFilter
      }
    });
    
  } catch (error) {
    console.error('删除访客数据失败:', error);
    return NextResponse.json(
      { error: '删除访客数据失败', message: error.message },
      { status: 500 }
    );
  }
} 