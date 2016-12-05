# html5-dev-scaffold

构建工具使用gulp；css使用sass、autoprefixer；基于gulp-connect的前端api测试数据；html5模板页；详细请看gulpfile.js文件配置。

## 编译css

	gulp scss

## 合并js

	gulp script

## 默认gulp
	
	// 监听所有scss和js文件变化
	gulp | gulp default 


## 本地api服务器

根据路由，数据返回相应目录的.json或.js文件内容。例如/data/posts路由会返回gulp-connect根目录下的data目录中posts.json文件内容
	
	// 默认端口为8888
	// 跨域请求更改：allowCrossOrigin为true
	gulp serve
