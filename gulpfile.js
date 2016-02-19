var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var liveServer = require('live-server');
var del = require('del');
var shell = require('shelljs');
var ts = require('gulp-typescript');
var closureCompiler = require('gulp-closure-compiler');
var insert = require('gulp-insert');
var watch = require('gulp-watch');

gulp.task('default', ['serve', 'watch']);

gulp.task('watch', function () {
    build(false);
    watch('src/**/*', function() {
       build(false); 
    });
})

gulp.task('serve', function() {
   liveServer.start({
       root: './public',
       port: 3000
   }); 
});

gulp.task('build', function() {
    return build(true);
});

gulp.task('deploy', function() {
    return del(['public/datium.js']).then(function(err) {
        return build(true).then(function() {
            shell.cp('-rf', 'public/datium.js', 'deploy');
            shell.cp('-rf', 'public/index.html', 'deploy');

            shell.cd('deploy');

            shell.exec('git add -A');
            shell.exec('git commit -m "latest deploy"');
            shell.exec('git push');
            return true;
        });
    });
});

function closure() {
    gulp.src('temp/datium.js')
        .pipe(closureCompiler({
            compilerPath: 'compiler.jar',
            fileName: 'datium.js',
            compilerFlags: {
                compilation_level: 'ADVANCED_OPTIMIZATIONS',
                warning_level: 'VERBOSE'
            }
        }))
        .pipe(gulp.dest('public'));
}

function build(runClosure) {
    var outDir = runClosure ? 'temp' : 'public';
    return gulp.src('src/**/*.ts')
        .pipe(sourcemaps.init())
        .pipe(ts({
            out: 'datium.js'
        }))
        .pipe(insert.wrap('(function(){\n', '})();'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(outDir))
        .on('end', function() {
            if (runClosure) closure();
        });
}