const fs = require ( 'fs' )
const postcss = require ( 'postcss' )
const postcssRtl = require ( './index' )

const file = fs.readFileSync ( 'examples/app.css' )

postcss ( [ postcssRtl ] )
    .process ( file )
    .then ( function( result ) {
        fs.writeFileSync ( 'build/app.css', result.css )
        if ( result.map ) fs.writeFileSync ( 'build/app.css.map', result.map )
    } )
