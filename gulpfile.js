const gulp = require( 'gulp' )
const sourcemaps = require( 'gulp-sourcemaps' )
const postcss = require( 'gulp-postcss' )
const requireNew = require( 'require-new' )
let rtl

gulp.task( 'html', () =>
    gulp.src( './demo/demo.html' )
        .pipe( gulp.dest( './build' ) )
)

gulp.task( 'styles', () => {
    rtl = requireNew( './src/index' )
    gulp.src( './demo/*.css' )
        .pipe( sourcemaps.init() )
        .pipe( postcss( [ rtl ] ) )
        .pipe( sourcemaps.write( '.' ) )
        .pipe( gulp.dest( './build' ) )
} )

gulp.task( 'watch', ()=>
    gulp.watch( [
        './demo/*.css',
        './src/*.js'
    ], [ 'styles' ] )
)

gulp.task( 'dev', [ 'default', 'watch' ] )
gulp.task( 'default', [ 'styles', 'html' ] )
