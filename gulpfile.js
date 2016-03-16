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

    shell.cd('deploy');

    shell.exec('git add -A');
    shell.exec('git commit -m "latest deploy"');
    shell.exec('git push');
}

var OBFUSCATE = false;

String.prototype.replaceAll = function(search, replacement) {
    return this.split(search).join(replacement);
}

function obfuscate(fileContents) {
    fileContents = fileContents.replace(/\n/g, '');
    
    if (!OBFUSCATE) return fileContents;
    
    fileContents = fileContents.replace(/\\/g, '\\\\');
    
    replacements = [];
    
    replacements['=function('] = '=e(';
    //replacements['{return '] = '{e ';
    replacements['.prototype.'] = '.e.';
    
    replacementString = '';
    
    for (key in replacements) {
        fileContents = fileContents.replaceAll(key, replacements[key]);
        replacementString += '.e("'+replacements[key]+'","'+key+'")';
    }
    
    return "String.prototype.e=function(a,e){return this.split(a).join(e)};eval('"+fileContents+"'"+replacementString+")";
}

function escapeString(str) {
  return str.replace(/\"/g, "\\\"");
}

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

function closure() {
    // Needed so that closure works properly
    var str = fs.readFileSync('public/datium.js').toString();
    str = str.replace('function __() { this.constructor = d; }', '/** @constructor */\nfunction __() { this.constructor = d; }');
    fs.writeFileSync('public/datium.js', str);
    
    return gulp.src('./public/datium.js')
        .pipe(closureCompiler({
            compilerPath: 'compiler.jar',
            fileName: 'datium.js',
            compilerFlags: {
                compilation_level: 'ADVANCED_OPTIMIZATIONS',
                warning_level: 'VERBOSE'
            }
        }))
        .pipe(through.obj(function (file, enc, cb) { // weird optimization
            var result = obfuscate(file.contents.toString());
            file.contents = new Buffer(result);
            console.log('Compressed size: ', gzipSize.sync(file.contents)/1000+'kb');
            cb(null, file);
        }))
        .pipe(gulp.dest('public'));
}





