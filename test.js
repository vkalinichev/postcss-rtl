import postcss from 'postcss'
import test    from 'ava'
import plugin from './lib'

const run = ( t, input, output, opts = {} ) =>

    postcss( [ plugin( opts ) ] ).process( input )
        .then( result => {
            t.deepEqual( result.css.replace( /\s+/g, ' ' ), output )
            t.deepEqual( result.warnings().length, 0 )
        } )


test( 'Added html[dir] prefix to symmetric rules', t => run( t,
    'a { text-align: center }',
    '[dir] a { text-align: center }'
) )

test( 'Creates both LTR & RTL rules for asymmetric declarations', t => run( t,
    'a { text-align: left }',
    '[dir="ltr"] a { text-align: left } ' +
    '[dir="rtl"] a { text-align: right }'
) )

test( 'Removes original rule without symmetric declarations', t => run( t,
    'a { text-align: left }',
    '[dir="ltr"] a { text-align: left } ' +
    '[dir="rtl"] a { text-align: right }'
) )

