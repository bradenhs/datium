var gulp = require('gulp');
var gzip = require('gulp-gzip');
var Builder = require('systemjs-builder');
var less = require('less');
var fs = require('fs');

gulp.task('default', doLess);

function doLess() {
	less.render('@import "src/view.less";', {
		paths: ['.'],
		compress: true
	}, addStyles);
}

function addStyles(e, output) {
	fs.writeFile('temp/stylesheet.css', output.css, function(e) {
		buildSystem();		
	});
}

function buildSystem(orig) {
	var builder = new Builder('./', 'config.js');
	builder.buildStatic('src/Datium', 'out/Datium.js', {
		minify: true
	}).then(function() {
		fs.writeFile('temp/stylesheet.css', '');		
		gulp.src('out/Datium.js')
			//.pipe(gzip({ append: false }))
			.pipe(gulp.dest('out'));
	});
}