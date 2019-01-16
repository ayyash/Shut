var gulp = require('gulp');
var shutConfig = require('./shut.config.json');
var transform = require('gulp-transform');
var inject = require('gulp-inject');

// generate icons from styles generated by icomoons

let liIconStr = "";
const _getLigas = function(){
	// require selection.json here, find ligature by icon var
	var icons = require('../' + shutConfig.srcUrl + 'dummy/selection.json').icons; 
    let array = {};
    for (var i = 0; i < icons.length; i++) {
		array[icons[i].properties.name] = icons[i].properties.ligatures;
	
	}
	return array;
	
};


const _cssicons = function () {

    let returnStr = "";
	const ligas = _getLigas();
	
    return gulp.src(shutConfig.srcUrl + 'less/ui.icons.less')
        .pipe(inject(
            gulp.src(shutConfig.srcUrl + 'dummy/variables.less'),
            {
                starttag: '// inject:icons', endtag: '// endinject',
                transform: function (filePath, file) {
                    // for ever @icon-arrow-all: "\e900"; generate @icon-arrow-all: "\e900";    .icon(icon-arrow-all, @icon-arrow-all);
                    var lines = file.contents.toString('utf8').split('\n');
                    lines.forEach(function (value) {
                        if (value.indexOf('@icon-') > -1) {
                            // add to the line icon(something, icon);
                            name = value.split(":")[0];
                            value += "	.icon({0},{1});\r\n"
                                .replace("{0}", name.substring(1))
                                .replace("{1}", name);

                            returnStr += value;

                            liIconStr += '<li><span class="symbol {0}">{1}</span> <i>{2}</i></li>'
                                .replace("{0}", name.substring(1))
								.replace("{1}", name)
								.replace("{2}", ligas[name.substring(6)]);
                        }
                    })
                    return returnStr;
                }
            }
        ))
        .pipe(gulp.dest(shutConfig.srcUrl + 'less/'));



};

exports.iconset = gulp.series(_cssicons, function(){


    return gulp.src(shutConfig.srcUrl + 'dummy/iconset.html')
        .pipe(inject(
            gulp.src(shutConfig.srcUrl + 'dummy/variables.less', { read: false }),
            {
                starttag: '<!-- inject:icons -->', endtag: '<!-- endinject -->',
                transform: function (filePath, file) {
                    //just inject text as is
                    return liIconStr;
                }
            }
        ))
        .pipe(gulp.dest(shutConfig.srcUrl + 'dummy/'));
});

