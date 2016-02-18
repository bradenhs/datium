var gulp = require('gulp');
var liveServer = require('live-server');
var Builder = require('systemjs-builder');
var del = require('del');
var shell = require('shelljs');

gulp.task('default', ['serve']);

gulp.task('serve', function() {
   liveServer.start({port: 3000}); 
});

var src = 'src/Datium';
var out = 'out/datium.js';
var deployDir = 'deploy';
var config = 'config.js';
var opts = { minify: true };

gulp.task('build', build);

gulp.task('deploy', function() {
    return del([out]).then(function(err) {
        return build().then(function() {
            shell.cp('-rf', out, deployDir);
            shell.cp('-rf', 'out/index.html', deployDir);

            shell.cd(deployDir);

            shell.exec('git add -A');
            shell.exec('git commit -m "latest deploy"');
            shell.exec('git push');
            return true;
        });
    });
});

function build() {
    return new Builder('./', config).buildStatic(src, out, opts);
}