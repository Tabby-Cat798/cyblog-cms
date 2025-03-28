import { EyeOutlined } from '@ant-design/icons';

export default function PopularArticles({ articles, formatDate }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">热门文章</h2>
      </div>
      <div className="divide-y divide-gray-200">
        {articles?.length > 0 ? (
          articles.map((post) => (
            <div key={post._id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
                  {post.title}
                </h3>
                <span className="text-sm text-gray-500">{formatDate(post.createdAt)}</span>
              </div>
              <div className="flex mt-2 text-sm text-gray-500">
                <span className="flex items-center mr-4">
                  <EyeOutlined className="mr-1" /> {post.viewCount || 0} 浏览
                </span>
                <span className="flex items-center">
                  {post.tags?.length || 0} 标签
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="px-6 py-4 text-center text-gray-500">
            暂无文章
          </div>
        )}
      </div>
    </div>
  );
} 