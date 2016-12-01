import postcss from 'postcss'
import test    from 'ava'
import plugin from './lib'

const run = ( t, input, output, opts = {} ) =>

    postcss( [ plugin( opts ) ] ).process( input )
        .then( result => {
            t.deepEqual( result.css.replace( /\s+/g, ' ' ), output.replace( /\s+/g, ' ' ) )
            t.deepEqual( result.warnings().length, 0 )
        } )


test( 'Should NOT add [dir] prefix to symmetric rules', t => run( t,
    'a { font-size: 1em }',
    'a { font-size: 1em }'
) )

test( 'Should ONLY create LTR & RTL rules to asymmetric rules', t => run( t,
    'a { font-size: 1em; text-align: left }',
    'a { font-size: 1em } ' +
    '[dir="ltr"] a { text-align: left } ' +
    '[dir="rtl"] a { text-align: right }'
) )

test( 'Should add [dir] prefix to symmetric rules with direction related declarations', t => run( t,
    'a { text-align: center }',
    '[dir] a { text-align: center }'
) )

test( 'Should add [dir] prefix to symmetric rules with direction related declarations (2)', t => run( t,
    'a { font-size: 1em; text-align: center }',
    'a { font-size: 1em } ' +
    '[dir] a { text-align: center }'
) )

test( 'Should add [dir] prefix to symmetric rules with direction related declarations (3)', t => run( t,
    'a { text-align: left } ' +
    'a { text-align: center }',
    '[dir="ltr"] a { text-align: left } ' +
    '[dir="rtl"] a { text-align: right } ' +
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
