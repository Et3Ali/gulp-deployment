var gulp = require("gulp");
var connect = require("gulp-connect");
var livereload = require("gulp-livereload");
var sass = require("gulp-sass");
var concat = require("gulp-concat");
var clean = require("gulp-clean");
var cleanhtml = require("gulp-cleanhtml");
var minifyCSS = require("gulp-minify-css");
var closureCompiler = require("gulp-closure-compiler");
var run = require("gulp-run");
var stripCode = require('gulp-strip-code');

var config = {
    dev_src: "./dev/",
    pro_src: "./pro/",
    dis_src: "./dis/"
};
//////////////////////***********General*****************//////////////
gulp.task("connect", function () {
    connect.server({
        root: config.pro_src,
        livereload: true
    });
});
gulp.task("clean-pro", function () {
    return gulp.src(config.pro_src + "*", {read: false}).pipe(clean({force: true}));
});
gulp.task("clean-dis", function () {
    return gulp.src(config.dis_src + "*", {read: false}).pipe(clean({force: true}));
});

gulp.task("livereload", function () {
    gulp.src(config.pro_src + "*").pipe(connect.reload());
});
gulp.task("emulate", function () {
    run("cd app && cordova run android").exec();
});

//////////*************Dev to Pro**************////////////////
gulp.task("dev-copy-templates", function () {
    gulp.src(config.pro_src + "templates/*").pipe(clean({force: true}));
    gulp.src(config.dev_src + "templates/*").pipe(gulp.dest(config.pro_src + "templates"));
});
gulp.task("dev-copy-images", function () {
    gulp.src(config.pro_src + "images/*").pipe(clean({force: true}));
    gulp.src(config.dev_src + "images/*").pipe(gulp.dest(config.pro_src + "images"));
});
gulp.task("dev-copy-database", function () {
    gulp.src(config.pro_src + "database/*").pipe(clean({force: true}));
    gulp.src(config.dev_src + "database/*").pipe(gulp.dest(config.pro_src + "database"));
});
gulp.task("dev-copy-fonts", function () {
    gulp.src(config.pro_src + "fonts/*").pipe(clean({force: true}));
    gulp.src(config.dev_src + "fonts/*").pipe(gulp.dest(config.pro_src + "fonts"));
});
gulp.task("dev-copy-views", function () {
    gulp.src(config.dev_src + "index.html").pipe(gulp.dest(config.pro_src));
    gulp.src(config.dev_src + "views/*").pipe(gulp.dest(config.pro_src + "views"));
});
gulp.task("dev-concat-js", function () {
    gulp.src(config.dev_src + "scripts/*.js")
            .pipe(concat("scripts.js"))
            .pipe(gulp.dest(config.pro_src));
});
gulp.task("dev-compile-css", function () {
    gulp.src(config.dev_src + "styles/*")
            .pipe(sass())
            .pipe(concat("styles.css"))
            .pipe(gulp.dest(config.pro_src));
});
gulp.task("dev-watch", function () {
    gulp.watch([config.dev_src + "templates/*"], ["dev-copy-templates"]).on("change", function () {
        gulp.start("livereload");
    });
    gulp.watch([config.dev_src + "images/*"], ["dev-copy-images"]).on("change", function () {
        gulp.start("livereload");
    });
    gulp.watch([config.dev_src + "database/*"], ["dev-copy-database"]).on("change", function () {
        gulp.start("livereload");
    });
    gulp.watch([config.dev_src + "fonts/*"], ["dev-copy-fonts"]).on("change", function () {
        gulp.start("livereload");
    });
    gulp.watch([ config.dev_src + "views/*", "./dev/index.html"], ["dev-copy-views"]).on("change", function () {
        gulp.start("livereload");
    });
    gulp.watch([config.dev_src + "scripts/*"], ["dev-concat-js"]).on("change", function () {
        gulp.start("livereload");
    });
    gulp.watch([config.dev_src + "styles/*"], ["dev-compile-css"]).on("change", function () {
        gulp.start("livereload");
    });
});
gulp.task("dev-copy", function () {
    gulp.start("dev-copy-templates", "dev-copy-images", "dev-copy-database", "dev-copy-fonts", "dev-copy-views");
    gulp.start("dev-concat-js");
    gulp.start("dev-compile-css");
});
gulp.task("dev-clean", ["clean-pro"], function () {
    gulp.start("dev-copy");
});
gulp.task("dev", ["dev-clean"], function () {
    gulp.start("connect");
    gulp.start("dev-watch");
    gulp.start("livereload");
});
gulp.task("dev-device", ["dev-clean"], function () {
    gulp.start("emulate");
});

//////////*************Dev to Dis**************////////////////
gulp.task("dis-copy-templates", function () {
    gulp.src(config.dev_src + "templates/*").pipe(cleanhtml()).pipe(gulp.dest(config.dis_src + "templates"));
});
gulp.task("dis-copy-images", function () {
    gulp.src(config.dev_src + "images/*").pipe(gulp.dest(config.dis_src + "images"));
});
gulp.task("dis-copy-database", function () {
    gulp.src(config.dev_src + "database/*").pipe(cleanhtml()).pipe(gulp.dest(config.dis_src + "database"));
});
gulp.task("dis-copy-fonts", function () {
    gulp.src(config.dev_src + "fonts/*").pipe(gulp.dest(config.dis_src + "fonts"));
});
gulp.task("dis-copy-views", function () {
    gulp.src(config.dev_src + "index.html").pipe(cleanhtml()).pipe(gulp.dest(config.dis_src));
    gulp.src(config.dev_src + "views/*.html").pipe(cleanhtml()).pipe(gulp.dest(config.dis_src + "views"));
});
gulp.task("dis-compile-js", function () {
    gulp.src(config.dev_src + "scripts/*.js")
            .pipe(stripCode({
                start_comment: "start_remove_in_distribution",
                end_comment: "end_remove_in_distribution"
            }))
            .pipe(closureCompiler({
                compilerPath: "utilities/compiler.jar",
                fileName: "scripts.js",
                continueWithWarnings: true
            }))
            .pipe(gulp.dest(config.dis_src));
});
gulp.task("dis-compile-css", function () {
    gulp.src(config.dev_src + "styles/*")
            .pipe(sass())
            .pipe(concat("styles.css"))
            .pipe(minifyCSS({keepBreaks: true}))
            .pipe(gulp.dest(config.dis_src));
});
gulp.task("dis", ["clean-dis"], function () {
    gulp.start("dis-copy-templates", "dis-copy-images", "dis-copy-database", "dis-copy-fonts", "dis-copy-views");
    gulp.start("dis-compile-js");
    gulp.start("dis-compile-css");
});