var gulp = require("gulp");
var babel = require("gulp-babel");

gulp.task("convert", function () {
    return gulp.src(['app.js','addressAPI.js'])
        .pipe(babel())
        .pipe(gulp.dest("dist"));
});
