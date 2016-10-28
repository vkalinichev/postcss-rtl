const gulp = require( 'gulp' )
const sourcemaps = require( 'gulp-sourcemaps' )
const postcss = require( 'gulp-postcss' )
const rtl = require( './index' )

gulp.task( 'copy', () =>
    gulp.src( './demo/demo.html' )
        .pipe( gulp.dest( './build' ) )
)

gulp.task( 'demo', () =>
    gulp.src( './demo/demo.css' )
        .pipe( sourcemaps.init() )
        .pipe( postcss( [ rtl ] ) )
        .pipe( sourcemaps.write( '.' ) )
        .pipe( gulp.dest( './build' ) )
)

gulp.task( 'default', [ 'demo', 'copy' ] )
