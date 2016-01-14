var gulp = require('gulp');
var Builder = require('systemjs-builder');
var less = require('less');
var fs = require('fs');
var liveServer = require('live-server');
var shell = require('shelljs');
var del = require('del');

gulp.task('build', buildSystem);

gulp.task('start', function() {
    liveServer.start({port: 8081});
});

gulp.task('deploy', function() {
    del(['deploy/Datium.js']).then(function(err) {
        shell.exec('gulp build');
        shell.cp('-rf', 'out/Datium.js', 'deploy');
        shell.cd('deploy');
        shell.exec('git add -A');
        shell.exec('git commit -m "latest deploy"');
        shell.exec('git push');        
    });
});

function buildSystem() {
	var builder = new Builder('./', 'config.js');
	builder.buildStatic('src/Datium', 'out/Datium.js', {
		minify: true
	});
}