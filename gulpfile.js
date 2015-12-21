var gulp = require('gulp');
var Builder = require('systemjs-builder');
var less = require('less');
var fs = require('fs');
var liveServer = require('live-server');

//AWESOME
gulp.task('build', doLess);

gulp.task('start', function() {
    liveServer.start({port: 8081});
});

function doLess() {
	less.render('@import "src/view/styles.less";', {
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
	});
}