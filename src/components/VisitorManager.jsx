import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Tabs, 
  DatePicker, 
  Space, 
  message, 
  Tooltip, 
  Tag, 
  Popconfirm,
  Avatar,
  Typography,
  Divider,
  Input,
  Select
} from 'antd';
import { 
  UserOutlined, 
  GlobalOutlined, 
  DeleteOutlined, 
  ReloadOutlined,
  DesktopOutlined,
  MobileOutlined,
  TabletOutlined,
  AppleOutlined,
  WindowsOutlined,
  AndroidOutlined,
  FilterOutlined,
  SearchOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import * as UAParserLib from 'ua-parser-js';
const UAParser = UAParserLib.UAParser;
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const { RangePicker } = DatePicker;
const { Text } = Typography;

const VisitorManager = () => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeTab, setActiveTab] = useState('all');
  const [dateRange, setDateRange] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [ipFilter, setIpFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [usernameFilter, setUsernameFilter] = useState('');
  const [articleFilter, setArticleFilter] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [countries, setCountries] = useState([]);
  const [regions, setRegions] = useState([]);
  const [articles, setArticles] = useState([]);

  // 获取所有筛选项数据的函数
  const fetchFilterOptions = async () => {
    try {
      console.log('获取所有筛选选项数据...');
      
      // 获取所有可用的国家和地区
      const geoResponse = await fetch(`/api/visitors/options?type=geo`);
      if (geoResponse.ok) {
        const geoData = await geoResponse.json();
        setCountries(geoData.countries || []);
        setRegions(geoData.regions || []);
        console.log(`加载了 ${geoData.countries?.length || 0} 个国家和 ${geoData.regions?.length || 0} 个地区选项`);
      }
      
      // 添加调试信息
      console.log('准备获取文章数据...');
      
      // 获取所有文章
      const articlesResponse = await fetch('/api/articles?limit=100&status=published');
      console.log('文章API响应状态:', articlesResponse.status);
      
      if (articlesResponse.ok) {
        const responseText = await articlesResponse.text();
        console.log('文章API原始响应:', responseText);
        
        try {
          // 尝试解析JSON
          const articlesData = JSON.parse(responseText);
          console.log('文章API解析后的数据:', articlesData);
          
          let articlesList = [];
          
          // 处理不同的数据格式
          if (articlesData.articles && Array.isArray(articlesData.articles)) {
            articlesList = articlesData.articles;
          } else if (Array.isArray(articlesData)) {
            articlesList = articlesData;
          }
          
          if (articlesList.length > 0) {
            const articleOptions = articlesList.map(article => ({
              id: article._id,
              title: article.title || '无标题文章'
            }));
            
            console.log(`加载了 ${articleOptions.length} 个文章选项:`, articleOptions);
            setArticles(articleOptions);
            
            return { success: true, count: articleOptions.length };
          } else {
            console.warn('文章列表为空');
            return { success: true, count: 0 };
          }
        } catch (parseError) {
          console.error('解析文章API响应失败:', parseError);
          return { success: false, error: '解析文章API响应失败' };
        }
      } else {
        console.error('获取文章选项失败，状态码:', articlesResponse.status);
        return { success: false, error: `API返回错误状态: ${articlesResponse.status}` };
      }
    } catch (error) {
      console.error('获取筛选选项失败:', error);
      return { success: false, error: error.message };
    }
  };

  // 获取访客数据
  const fetchVisitors = async (tabKey = activeTab, currentPage = page, currentPageSize = pageSize, dates = dateRange) => {
    setLoading(true);
    try {
      let url = `/api/visitors?type=${tabKey}&page=${currentPage}&pageSize=${currentPageSize}`;
      
      if (dates && dates[0] && dates[1]) {
        url += `&startDate=${dates[0].format('YYYY-MM-DD HH:mm:ss')}&endDate=${dates[1].format('YYYY-MM-DD HH:mm:ss')}`;
      }

      // 添加IP过滤条件
      if (ipFilter) {
        url += `&ipFilter=${encodeURIComponent(ipFilter)}`;
      }

      // 添加国家过滤条件
      if (countryFilter) {
        url += `&country=${encodeURIComponent(countryFilter)}`;
      }

      // 添加地区过滤条件
      if (regionFilter) {
        url += `&region=${encodeURIComponent(regionFilter)}`;
      }
      
      // 添加用户名过滤条件
      if (usernameFilter) {
        url += `&username=${encodeURIComponent(usernameFilter)}`;
      }
      
      // 添加文章过滤条件
      if (articleFilter) {
        url += `&article=${encodeURIComponent(articleFilter)}`;
      }
      
      console.log('请求URL:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '获取访客数据失败');
      }
      
      console.log('API返回数据:', data);
      console.log('访客数量:', data.visitors.length);
      console.log('API返回总记录数:', data.total);
      
      // 直接使用API返回的数据，不进行过滤
      setVisitors(data.visitors);
      setTotal(data.total);
    } catch (error) {
      console.error('获取访客数据失败:', error);
      message.error('获取访客数据失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 首次加载
  useEffect(() => {
    fetchVisitors();
    fetchFilterOptions();
  }, []);

  // 手动刷新筛选选项数据
  const refreshFilterOptions = () => {
    message.loading('正在刷新筛选选项...', 1);
    fetchFilterOptions()
      .then(() => {
        if (articles.length === 0) {
          message.warning('文章选项加载为空，请检查文章API配置');
        } else {
          message.success(`成功加载 ${articles.length} 个文章选项`);
        }
      });
  };

  // 渲染文章选择框
  const renderArticleSelector = () => {
    // 如果没有文章选项，添加刷新按钮和提示
    if (articles.length === 0) {
      return (
        <div>
          <div className="flex items-center mb-2">
            <span className="text-sm font-medium">文章</span>
            <Tooltip title="刷新文章列表">
              <Button 
                type="text" 
                size="small" 
                icon={<ReloadOutlined />} 
                onClick={refreshFilterOptions}
                style={{ marginLeft: 4 }}
              />
            </Tooltip>
          </div>
          <div className="flex items-center">
            <Select
              placeholder="暂无可选文章"
              style={{ width: 180 }}
              disabled
            />
            <Tooltip title="刷新文章列表">
              <Button 
                icon={<ReloadOutlined />} 
                onClick={refreshFilterOptions}
                style={{ marginLeft: 8 }}
              >刷新文章</Button>
            </Tooltip>
          </div>
        </div>
      );
    }
    
    // 正常渲染文章选择框
    return (
      <div>
        <div className="mb-1 text-sm font-medium">文章</div>
        <Select
          placeholder="选择文章"
          style={{ width: 220 }}
          value={articleFilter || undefined}
          onChange={handleArticleFilterChange}
          allowClear
          showSearch
          optionFilterProp="label"
          options={articles.map(article => ({ 
            label: article.title, 
            value: article.id 
          }))}
        />
      </div>
    );
  };

  // 处理标签页切换
  const handleTabChange = (key) => {
    setActiveTab(key);
    setPage(1);
    fetchVisitors(key, 1, pageSize, dateRange);
  };

  // 处理分页变化
  const handleTableChange = (pagination, filters, sorter) => {
    console.log('分页变化:', pagination);
    console.log('当前页:', pagination.current);
    console.log('每页条数:', pagination.pageSize);
    
    // 更新本地状态
    setPage(pagination.current);
    setPageSize(pagination.pageSize);
    
    // 重新获取数据
    fetchVisitors(activeTab, pagination.current, pagination.pageSize, dateRange);
  };

  // 处理日期范围变化
  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
    if (dates) {
      fetchVisitors(activeTab, 1, pageSize, dates);
    } else {
      fetchVisitors(activeTab, 1, pageSize, null);
    }
    setPage(1);
  };

  // 处理IP过滤变化
  const handleIpFilterChange = (e) => {
    setIpFilter(e.target.value);
  };

  // 处理国家过滤变化
  const handleCountryFilterChange = (value) => {
    setCountryFilter(value);
  };

  // 处理地区过滤变化
  const handleRegionFilterChange = (value) => {
    setRegionFilter(value);
  };

  // 处理用户名过滤变化
  const handleUsernameFilterChange = (e) => {
    setUsernameFilter(e.target.value);
  };

  // 处理文章过滤变化
  const handleArticleFilterChange = (value) => {
    setArticleFilter(value);
  };

  // 应用过滤器
  const applyFilters = () => {
    setPage(1);
    fetchVisitors(activeTab, 1, pageSize, dateRange);
  };

  // 重置过滤器
  const resetFilters = () => {
    setIpFilter('');
    setCountryFilter('');
    setRegionFilter('');
    setUsernameFilter('');
    setArticleFilter('');
    setPage(1);
    fetchVisitors(activeTab, 1, pageSize, dateRange);
  };

  // 按照过滤条件删除
  const handleDeleteFilteredVisitors = async () => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) {
      return message.warning('请先选择日期时间范围');
    }
    
    setDeleteLoading(true);
    try {
      const startDate = dateRange[0].format('YYYY-MM-DD HH:mm:ss');
      const endDate = dateRange[1].format('YYYY-MM-DD HH:mm:ss');
      
      let url = `/api/visitors?startDate=${startDate}&endDate=${endDate}`;
      
      // 添加国家和地区过滤条件（如果有）
      if (countryFilter) {
        url += `&country=${encodeURIComponent(countryFilter)}`;
      }
      
      if (regionFilter) {
        url += `&region=${encodeURIComponent(regionFilter)}`;
      }
      
      // 添加文章筛选条件（如果有）
      if (articleFilter) {
        url += `&article=${encodeURIComponent(articleFilter)}`;
      }
      
      const response = await fetch(url, { method: 'DELETE' });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '删除访客数据失败');
      }
      
      message.success(`成功删除 ${data.deletedCount} 条访客记录`);
      
      // 重置到第一页，重新获取数据
      setPage(1);
      fetchVisitors(activeTab, 1, pageSize, dateRange);
    } catch (error) {
      console.error('删除访客数据失败:', error);
      message.error('删除访客数据失败: ' + error.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  // 解析User Agent
  const parseUserAgent = (userAgent) => {
    if (!userAgent) return { os: '未知', device: '未知', browser: '未知' };
    
    const parser = new UAParser();
    parser.setUA(userAgent);
    const result = parser.getResult();
    
    const deviceInfo = result.device.type || 
                      (result.device.vendor ? `${result.device.vendor} ${result.device.model}` : '桌面设备');
    
    return {
      os: `${result.os.name || '未知'} ${result.os.version || ''}`.trim(),
      device: deviceInfo,
      browser: `${result.browser.name || '未知'} ${result.browser.version || ''}`.trim()
    };
  };

  // 获取设备图标
  const getDeviceIcon = (userAgent) => {
    if (!userAgent) return <DesktopOutlined />;
    
    const parser = new UAParser();
    parser.setUA(userAgent);
    const result = parser.getResult();
    
    // 明确检查移动设备类型
    if (result.device.type === 'mobile') return <MobileOutlined />;
    if (result.device.type === 'tablet') return <TabletOutlined />;
    
    // 根据操作系统名称判断
    if (result.os.name) {
      if (result.os.name.includes('iOS') || result.os.name.includes('Mac')) return <AppleOutlined />;
      if (result.os.name.includes('Windows')) return <WindowsOutlined />;
      if (result.os.name.includes('Android')) return <AndroidOutlined />;
    }
    
    // 默认返回桌面设备图标
    return <DesktopOutlined />;
  };

  // 表格列定义
  const columns = [
    {
      title: '访问信息',
      dataIndex: 'path',
      key: 'path',
      render: (path, record) => (
        <div style={{ maxWidth: 300 }}>
          <div style={{ marginBottom: 5 }}>
            <Text style={{ fontSize: 14 }} strong>
              {record.articleTitle ? 
                <span>
                  {record.articleTitle.length > 30 ? 
                    record.articleTitle.substring(0, 30) + '...' : 
                    record.articleTitle}
                </span> : 
                <span style={{ color: '#999' }}>
                  {path === '/' ? '首页' : (path || '未知页面')}
                </span>
              }
            </Text>
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>
            <Tooltip title={record.path}>
              <Text style={{ marginRight: 8 }}>
                路径: {record.path?.length > 20 ? 
                  record.path.substring(0, 20) + '...' : 
                  record.path || '未知'
                }
              </Text>
            </Tooltip>
            {record.referer && (
              <Tooltip title={record.referer}>
                <Text>
                  来源: {record.referer.length > 25 ? 
                    record.referer.substring(0, 25) + '...' : 
                    record.referer
                  }
                </Text>
              </Tooltip>
            )}
          </div>
        </div>
      ),
    },
    {
      title: '访客信息',
      dataIndex: 'ip',
      key: 'ip',
      render: (ip, record) => {
        const ua = parseUserAgent(record.userAgent);
        return (
          <div>
            <div style={{ marginBottom: 6 }}>
              <Space>
                <Tooltip title={`IP: ${ip}`}>
                  <Tag color="blue" icon={<GlobalOutlined />}>
                    {ip || '未知IP'}
                  </Tag>
                </Tooltip>
                {record.userAgent && (
                  <Tooltip title={`设备: ${ua.device}`}>
                    <Tag color="green" icon={getDeviceIcon(record.userAgent)}>
                      {ua.device === '桌面设备' ? 
                        ua.os : 
                        ua.device
                      }
                    </Tag>
                  </Tooltip>
                )}
                {record.geoInfo && record.geoInfo.country && (
                  <Tooltip title={`${record.geoInfo.country} ${record.geoInfo.region || ''} ${record.geoInfo.city || ''}`}>
                    <Tag color="orange" icon={<EnvironmentOutlined />}>
                      {record.geoInfo.country} {record.geoInfo.region ? `- ${record.geoInfo.region}` : ''}
                    </Tag>
                  </Tooltip>
                )}
              </Space>
            </div>
            {record.userAgent && (
              <div>
                <Tooltip title={record.userAgent}>
                  <Text style={{ fontSize: 12 }}>
                    {ua.browser}
                  </Text>
                </Tooltip>
              </div>
            )}
          </div>
        )
      }
    },
    {
      title: '用户',
      dataIndex: 'userId',
      key: 'userId',
      render: (userId, record) => {
        if (!userId) {
          return <Tag color="default">匿名访客</Tag>;
        }
        
        return (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Avatar 
              src={record.userAvatar} 
              icon={!record.userAvatar && <UserOutlined />} 
              size="small"
              style={{ marginRight: 8 }}
            />
            <div>
              <div>
                <Text strong style={{ fontSize: 13 }}>
                  {record.userName || '未知用户'}
                </Text>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {record.userEmail || userId.substring(0, 8) + '...'}
                </Text>
              </div>
            </div>
          </div>
        );
      }
    },
    {
      title: '访问时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (timestamp) => {
        if (!timestamp) return '-';
        
        const date = new Date(timestamp);
        return (
          <div>
            <div>{dayjs(date).format('YYYY-MM-DD HH:mm:ss')}</div>
            <div style={{ fontSize: 12, color: '#999' }}>
              {dayjs(date).fromNow()}
            </div>
          </div>
        );
      }
    }
  ];

  const tabItems = [
    {
      key: 'all',
      label: <span><GlobalOutlined /> 全部访客</span>,
    },
    {
      key: 'users',
      label: <span><UserOutlined /> 注册用户</span>,
    }
  ];

  return (
    <Card
      title={<span><GlobalOutlined /> 访客管理</span>}
      variant="bordered"
      className="shadow-sm"
      extra={
        <Space>
          <Button
            icon={<FilterOutlined />}
            onClick={() => setFilterVisible(!filterVisible)}
          >
            高级筛选
          </Button>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={() => fetchVisitors(activeTab, page, pageSize, dateRange)}
          >
            刷新
          </Button>
        </Space>
      }
    >
      <div className="mb-6">
        <Space direction="vertical" style={{ width: '100%' }}>
          <div className="flex justify-between items-center">
            <RangePicker
              allowClear
              onChange={handleDateRangeChange}
              placeholder={['开始日期时间', '结束日期时间']}
              style={{ width: 360 }}
              showTime={{ 
                format: 'HH:mm',
                defaultValue: [dayjs('00:00:00', 'HH:mm:ss'), dayjs('23:59:59', 'HH:mm:ss')]
              }}
              format="YYYY-MM-DD HH:mm"
              value={dateRange}
            />
            
            <Popconfirm
              title="删除访客数据"
              description={(
                <div>
                  <p>确定要删除选定日期范围内
                    {countryFilter ? `来自 ${countryFilter}` : ''}
                    {regionFilter ? ` ${regionFilter}` : ''}
                    {articleFilter ? ` 访问文章《${articles.find(a => a.id === articleFilter)?.title || articleFilter}》` : ''}
                    的所有访客数据吗？
                  </p>
                  <p>此操作不可恢复。</p>
                </div>
              )}
              onConfirm={handleDeleteFilteredVisitors}
              okText="确定"
              cancelText="取消"
              disabled={!dateRange || !dateRange[0] || !dateRange[1]}
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                loading={deleteLoading}
                disabled={!dateRange || !dateRange[0] || !dateRange[1]}
              >
                删除所选时间段数据
              </Button>
            </Popconfirm>
          </div>
          
          {filterVisible && (
            <div className="bg-gray-50 p-4 rounded mt-4">
              <div className="flex flex-wrap gap-4">
                <div>
                  <div className="mb-1 text-sm font-medium">IP地址</div>
                  <Input 
                    placeholder="输入IP地址" 
                    value={ipFilter}
                    onChange={handleIpFilterChange}
                    style={{ width: 180 }}
                    prefix={<SearchOutlined />}
                    allowClear
                  />
                </div>
                
                <div>
                  <div className="mb-1 text-sm font-medium">用户名</div>
                  <Input 
                    placeholder="输入用户名" 
                    value={usernameFilter}
                    onChange={handleUsernameFilterChange}
                    style={{ width: 180 }}
                    prefix={<UserOutlined />}
                    allowClear
                  />
                </div>
                
                {renderArticleSelector()}
                
                <div>
                  <div className="mb-1 text-sm font-medium">国家</div>
                  <Select
                    placeholder="选择国家"
                    style={{ width: 180 }}
                    value={countryFilter || undefined}
                    onChange={handleCountryFilterChange}
                    allowClear
                    showSearch
                    options={countries.map(country => ({ label: country, value: country }))}
                  />
                </div>
                
                <div>
                  <div className="mb-1 text-sm font-medium">省份/地区</div>
                  <Select
                    placeholder="选择省份/地区"
                    style={{ width: 180 }}
                    value={regionFilter || undefined}
                    onChange={handleRegionFilterChange}
                    allowClear
                    showSearch
                    options={regions.map(region => ({ label: region, value: region }))}
                  />
                </div>
                
                <div className="flex items-end">
                  <Space>
                    <Button type="primary" onClick={applyFilters}>应用筛选</Button>
                    <Button onClick={resetFilters}>重置</Button>
                  </Space>
                </div>
              </div>
            </div>
          )}
          
          <Divider style={{ margin: '12px 0' }} />
          
          <Tabs
            activeKey={activeTab}
            onChange={handleTabChange}
            items={tabItems}
          />
        </Space>
      </div>
      
      <Table
        rowKey={(record) => record._id?.toString() || record.id?.toString()}
        columns={columns}
        dataSource={visitors}
        loading={loading}
        pagination={{
          current: page,
          pageSize: pageSize,
          total: total,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          showTotal: (total, range) => `显示 ${range[0]}-${range[1]} 条，共 ${total} 条记录`,
        }}
        onChange={handleTableChange}
        locale={{
          emptyText: '没有符合条件的访客数据'
        }}
      />
    </Card>
  );
};

export default VisitorManager; 