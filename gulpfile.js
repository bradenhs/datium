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
    var symbols = [];
    return gulp.src('./src/**/*.ts')
        .pipe(ts())
        .pipe(insert.transform(function(contents, file) {
            var name = file.basename.replace('.js', '');
            symbols.push(name);
            var str = 'ngm.factory("datium.'+name+'",\n[@DEPENDENCY@function(@REFERENCE@) {\n';
            
            str += contents.replace(new RegExp('_this', 'g'), 'self');
            
            str += 'return '+name+';\n}]);';
            
            return str; 
        }))
        .pipe(gulp.dest('./angularify'))
        .on('end', function() {
            gulp.src('./angularify/**/*.js')
                .pipe(insert.transform(function(contents, file) {
                    var dependency = '';
                    var reference = '';
                    var j = 1;
                    var arr = file.path.split('\\');
                    var fileName = arr[arr.length-1].replace('.js', '');
                    for (var i = 0; i < symbols.length; i++) {
                        var symbol = symbols[i];
                        if (fileName === symbol) continue;
                        if (!new RegExp(symbol+'(?!([A-z]|[0-9]))').test(contents)) continue;
                        var index = contents.indexOf(symbol);
                        if (index === -1) continue;
                        if (!/[A-z]|[0-9]/.test(contents[index-1])) {
                            
                            dependency += '"datium.'+symbol+'", ';
                            reference += symbol+', ';
                            if (j > 2) {
                                j = 0;
                                dependency += "\n";
                            }
                            j++;
                        }
                    }
                    
                    if (dependency.length > 0 && dependency.substr(dependency.length - 1) !== '\n') {
                        dependency += '\n';
                    }
                    
                    if (reference.length > 0) {
                        reference = reference.substr(0, reference.length - 2);
                    }
                    
                    contents = contents.replace('@DEPENDENCY@', dependency).replace('@REFERENCE@', reference);
                    return contents;
                }))
                .pipe(gulp.dest('./angularify'));
        });
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





