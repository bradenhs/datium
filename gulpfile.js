var gulp = require('gulp');
var Builder = require('systemjs-builder');
var less = require('less');
var fs = require('fs');
var liveServer = require('live-server');
var shell = require('shelljs');

//AWESOMER
gulp.task('build', doLess);

gulp.task('start', function() {
    liveServer.start({port: 8081});
});

gulp.task('deploy', ['build'], function() {
    shell.cp('-rf', 'out/Datium.js', 'deploy/Datium.js');
    shell.cd('deploy');
    shell.exec('git add -A');
    shell.exec('git commit -m "latest deploy"');
    shell.exec('git push');
});

function doLess() {
	less.render('@import "src/styles.less";', {
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