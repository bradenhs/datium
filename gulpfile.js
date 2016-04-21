var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var liveServer = require('live-server');
var del = require('del');
var shell = require('shelljs');
var ts = require('gulp-typescript');
var closureCompiler = require('gulp-closure-compiler');
var insert = require('gulp-insert');
var gulpWatch = require('gulp-watch');
var run = require('run-gulp-task');
var through = require('through2');
var fs = require('fs');
var gzipSize = require('gzip-size');
var cleanCss = require('clean-css');
var concat = require('gulp-concat');
var gulpLess = require('gulp-less');
var rename = require('gulp-rename');

gulp.task('default', ['serve', 'build'], function() {
    watchHtml();
    watchLess();
    watchTypescript();
});
gulp.task('serve', serve);

gulp.task('angularify', ['less'], angularify);

gulp.task('build', ['typescript']);
gulp.task('typescript', ['less'], typescript);
gulp.task('less', ['html'], less);
gulp.task('html', html);

gulp.task('deploy', ['closure'], deploy);
gulp.task('closure', ['build'], closure);

function watchHtml() {
    gulpWatch('./src/picker/html/**/*.html', function() {
       html(); 
    });
}

function watchLess() {
    gulpWatch('./src/picker/styles/**/*.less', function() {
       less(); 
    });
}

function watchTypescript() {
    gulpWatch('./src/**/*.ts', function() {
        typescript();
    });
}

function serve() {
   liveServer.start({
       root: './public',
       port: 3000
   });
}

function html() {
    var filesToDelete = ['./src/picker/html/**/*.ts'];
    return gulp.src('./src/picker/html/**/*.html')
        .pipe(rename(function (path) {
            path.extname = ".ts"
        }))
        .pipe(through.obj(function (file, enc, cb) {
            filesToDelete.push('!'+file.path.replace(/^.+src/, './src'));
            var parts = file.path.split('.');
            parts = parts[parts.length - 2].split(/\/|\\/g);
            var name = parts[parts.length - 1];
            var contents = file.contents.toString().replace(/\s+/g, ' ');
            file.contents = new Buffer('var ' + name + ' = "'+contents+'";');
            cb(null, file);
        }))
        .pipe(gulp.dest('./src/picker/html'))
        .on('end', function() {
            del.sync(filesToDelete);
        });
}

function angularify() {
    del.sync(['./angularify']);
    return gulp.src('./src/**/*.ts')
        .pipe(ts())
        .pipe(insert.transform(function(contents, file) {
            console.log(file.basename);
            return 'ngm.factory("", function() {\n' + contents + '});'; 
        }))
        .pipe(gulp.dest('./angularify'));
}

function less() {
    return gulp.src('./src/picker/styles/**/*.less')
        .pipe(gulpLess())
        .pipe(concat('css.ts'))
        .pipe(through.obj(function (file, enc, cb) {
            var css = new cleanCss().minify(file.contents.toString()).styles;
            file.contents = new Buffer('var css="' + css + '";');
            cb(null, file);
        }))
        .pipe(gulp.dest('./src/picker/styles'));
}

function typescript() {
    return gulp.src('./src/**/*.ts')
        .pipe(sourcemaps.init())
        .pipe(ts({
            out: 'datium.js'
        }))
        .pipe(insert.wrap('(function(){\n', '}());'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('public'));
    
}

function deploy() {
    shell.cp('-rf', 'public/datium.js', 'deploy');
    shell.cp('-rf', 'public/index.html', 'deploy');
    shell.cp('-rf', 'public/angular-wrapper.js', 'deploy');

    shell.cd('deploy');

    shell.exec('git add -A');
    shell.exec('git commit -m "latest deploy"');
    shell.exec('git push -f');
}

function closure() {
    return gulp.src('./public/datium.js')
        .pipe(through.obj(function (file, enc, cb) { // weird optimization
            var result = file.contents.toString().replace('function __() { this.constructor = d; }',
                '/** @constructor */ function __() { this.constructor = d; }');
            file.contents = new Buffer(result);
            cb(null, file);
        }))
        .pipe(gulp.dest('public'))
        .pipe(closureCompiler({
            compilerPath: 'compiler.jar',
            fileName: 'datium.js',
            compilerFlags: {
                compilation_level: 'ADVANCED_OPTIMIZATIONS',
                warning_level: 'VERBOSE'
            }
        }))
        .pipe(through.obj(function (file, enc, cb) { // weird optimization
            
            var result = file.contents.toString().replace(/\n/g, '');
            file.contents = new Buffer(result);
            console.log('Compressed size: ', gzipSize.sync(file.contents)/1000+'kb');
            cb(null, file);
        }))
        .pipe(gulp.dest('public'));
}





