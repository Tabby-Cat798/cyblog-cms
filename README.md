# cyblog开发文档
## Sidebar组件
1. 引用next/navigation提供的hook: usePathname，它返回当前页面的路径名；
2. 将菜单列表定义为一个数组对象，再在后面使用map遍历；
3. 在标签中使用大括号来内嵌js代码，用三元运算符添加一些简单的判断，如侧边栏展开收起的状态，以及判断当前所处页面用来实现所在标签的蓝色高亮等；
4. 在className中使用大括号和反引号来动态加载样式，例如一些用来判断的js代码使用${}来包裹，并在中使用单双引号来加载样式
5. 组件中状态变量：collapsed(布尔值，代表侧边栏是否展开)、activeItem(字符串，代表当前所处菜单项，随pathname的变化而改变)、pathName(字符串，代表当前页面所处路由)


## MarkdownEditor组件
### 缓存
1. 使用sessionStorage将输入框内容进行缓存，每次组件挂载时从缓存读取内容；每次内容改变时触发更新缓存。
### 上传图片
1. 
### 编辑功能
1. 
### 渲染样式
1. 使用MarkdownRender组件实现预览框的渲染效果
## MarkdownRenderer组件
1. 引用react-markdown、remark-gfm、rehype-raw、rehype-highlight、rehype-slug、rehype-autolink-headings
2. 在styles文件夹中创建markdown-styles.css文件，自定义markdown样式
3. ![alt text](image.png)