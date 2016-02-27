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

gulp.task('default', ['serve', 'watch']);
gulp.task('watch', ['build'], watch);
gulp.task('serve', serve);
gulp.task('build', build);
gulp.task('deploy', ['closure'], deploy);
gulp.task('closure', ['build'], closure);

function watch() {
    gulpWatch('./src/**/*', build);
}

function serve() {
   liveServer.start({
       root: './public',
       port: 3000
   }); 
    
}

function build() {
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

function findAt(str, index, search) {
    return str.slice(index, index + search.length) === search;
}

var OBFUSCATE = true;

function obfuscate(fileContents) {
    fileContents = fileContents.replace(/\n/g, '');
    
    if (!OBFUSCATE) return fileContents;
    
    fileContents = fileContents.replace(/\\/g, '\\\\');
    
    var strs = ['function', 'return', '.valueOf()', '.preventDefault()',
        'b.selectedIndex=', 'b.element.', '.getHours()', 'addEventListener("',
        '}},{code:"', ',10);else if("number"===typeof ', ';document.',
        '),a;if("string"===typeof ', 'new Date(', 'if("ZERO_OUT"===b',
        '.getFullYear()', '=parseInt(', 'a.getMonth()', 'a.getDay()',
        'b.selectedIndex', 'if("string"', 'a.getSeconds()', '===typeof ',
        '.getDate()', 'this.', '==c.keyCode', 'selectionStart', 
        '.toString()', '.slice(', 'value', 'update(', 'selectionEnd',
        '.getMinutes()', '.test(', 'Math.', '.setFullYear(', '.setHours(',
        'var ', '"ZERO_OUT"', ';else', 'removeEventListener("',
        '.setMonth(', '.length', 'set', 'void 0', 'Date(', 'new ',
        '.join(")|(")+"))",a:', 'code', '===', '(a){', '(h.clone(f)',
        'Timeout(', 'd{2,2}",a:', 'if(', 'day ', '))', '".split(" ")',
        ')}}', ',f:"', '",a:', '},c:', '(a)},b:', ')},', 'element',
        '"AM"', 'ember', '(a,b)},g:', 'for(', '(){', 'c.shiftKey',
        '(a,', '(b)', '(c)', ';break a}', '||', 'b)', 'd{1,2}',
        '((', 'b&&', 'c.push', ')};', '<a', ':"', '",'];
    
    var map = [];
    var code = 162;
    strs.forEach(function(str) {
       map[str] = String.fromCharCode(code++); 
    });
    var keys = '';
    var values = '';
    var l = 0;
    for (var key in map) {
        fileContents = fileContents.replace(new RegExp(escapeRegExp(key), "g"), map[key]);
        keys += map[key];
        values += escapeString(key)+'¡';
        l++;
    }
    values = values.slice(0, -1);
    return "(function(s,i){while(i<"+l+")s=s.replace(new RegExp('"+keys+"'[i],'g'),'"+values+"'.split('¡')[i++]);eval(s)})('"+fileContents+"',0)";
}

function escapeString(str) {
  return str.replace(/\"/g, "\\\"");
}

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

function closure() {
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





