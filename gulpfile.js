var gulp = require('gulp'),

	// css
	sass = require('gulp-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	minifycss = require('gulp-minify-css'),

	// js
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),

	rename = require('gulp-rename'),
	copy = require('gulp-copy'),
	del = require('del'),

	// server
	connect = require('gulp-connect'),
	url = require('url'),
	path = require('path'),
	fs = require('fs');


// compile scss
gulp.task('scss', function () {

	gulp.src('src/scss/*.scss')
		.pipe(sass())
		.pipe(autoprefixer({
			browsers: ['last 2 versions', 'Android >= 4.0'],
			cascade: true,
		}))
		.pipe(gulp.dest('dist/css'))
		.pipe(minifycss())
		.pipe(rename({ suffix: '.min' }))
		.pipe(gulp.dest('dist/css'));

});

// compile javascript
gulp.task('script', function () {

	gulp.src(['src/js/**/*.js', '!src/js/{vendor}/*.js'])
		.pipe(concat('main.js'))
		.pipe(gulp.dest('dist/js'))
		.pipe(uglify())
		.pipe(rename({ suffix: '.min' }))
		.pipe(gulp.dest('dist/js'));

});

// copy html
gulp.task('html', function () {

	gulp.src('*.html')
		.pipe(copy('dist'))

});

// serve
gulp.task('connect', function () {

	connect.server({
		port: 8888,
		livereload: true,
		allowCrossOrigin: true,
		middleware: function (connect, opts) {
			var mockInterceptor = function (req, res, next) {
				// 默认为根目录下的data目录	
				var mockpath = path.join(opts.root, 'data');
				// 默认处理跨域请求		
				var allowCrossOrigin = true;
				// 路由对象
				var urlObj = url.parse(req.url);
				var pathname = urlObj.pathname;
				var filepath = path.join(opts.root, pathname);
				// api route和mock path 不匹配就啥也不做
				var seedpath = mockpath.replace(opts.root, '').replace(path.sep, '/');
				if (pathname.indexOf(seedpath) == -1) {
					next();
					return;
				}
				// 默认为.json文件
				if (!/\.json$|\.js$/.test(filepath)) {
					filepath += '.json';
				}
				// 判读文件是否存在
				if (fs.existsSync(filepath)) {
					// 删除cache
					delete require.cache[require.resolve(filepath)];
					// 跨域请求
					if (allowCrossOrigin) {
						res.setHeader("Access-Control-Allow-Origin", "*");
						res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
						res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
						res.setHeader('Access-Control-Allow-Credentials', 'true');
					}
					// jsonp请求
					if (urlObj.query && urlObj.query.callback) {
						res.setHeader('Content-type', 'application/javascript;charset=utf-8');
						res.end(urlObj.query.callback + '(' + JSON.stringify(require(filepath)) + ')');
					} else {
						res.setHeader('Content-Type', 'application/json;charset=utf-8');
						res.end(JSON.stringify(require(filepath)));
					}
					return;
				} else {
					console.log('No file:' + filepath);
				}
			}
			return [mockInterceptor];
		}
	});

});

// livereload
gulp.task('livereload', function () {
	gulp.src('*.html')
		.pipe(connect.reload());
});

// build
gulp.task('serve', ['connect'], function () {

	gulp.watch('*.html', ['livereload']);

});

// clean
gulp.task('clean', function () {

	return del(['dist/**']);

});

// build
gulp.task('build', ['clean'], function () {

	gulp.start('scss', 'script');

});

// default
gulp.task('default', function () {

	// watch scss files
	gulp.watch('src/scss/**/*.scss', ['scss']);

	// watch javascript files
	gulp.watch('src/js/**/*.js', ['script']);

});