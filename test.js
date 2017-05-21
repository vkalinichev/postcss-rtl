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
    '[dir=ltr] a { text-align: left } ' +
    '[dir=rtl] a { text-align: right }'
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
    '[dir=ltr] a { text-align: left } ' +
    '[dir=rtl] a { text-align: right } ' +
    '[dir] a { text-align: center }'
) )

test( 'Should add [dir] prefix to symmetric rules with direction related declarations (4)', t => run( t,
    'a { margin: 0 10px 0 0 } ' +
    'a { margin-top: 20px }',
    '[dir=ltr] a { margin: 0 10px 0 0 } ' +
    '[dir=rtl] a { margin: 0 0 0 10px } ' +
    '[dir] a { margin-top: 20px }'
) )

test( 'Creates both LTR & RTL rules for asymmetric declarations', t => run( t,
    'a { text-align: left }',
    '[dir=ltr] a { text-align: left } ' +
    '[dir=rtl] a { text-align: right }'
) )

test( 'Removes original rule without symmetric declarations', t => run( t,
    'a { text-align: left }',
    '[dir=ltr] a { text-align: left } ' +
    '[dir=rtl] a { text-align: right }'
) )

test( 'Adds prefix to the html element', t => run( t,
    'html { text-align: left }',
    'html[dir=ltr] { text-align: left } ' +
    'html[dir=rtl] { text-align: right }'
) )

test( 'Adds prefix to the html element with class', t => run( t,
    'html.foo { text-align: left }',
    'html[dir=ltr].foo { text-align: left } ' +
    'html[dir=rtl].foo { text-align: right }'
) )

test( 'Adds prefix to the :root element', t => run( t,
    ':root { text-align: left }',
    '[dir=ltr]:root { text-align: left } ' +
    '[dir=rtl]:root { text-align: right }'
) )

test( 'Adds prefix to the :root element with class', t => run( t,
    ':root.foo { text-align: left }',
    '[dir=ltr]:root.foo { text-align: left } ' +
    '[dir=rtl]:root.foo { text-align: right }'
) )

test( 'Use custom `addPrefixToSelector` function', t => run( t,
    'a { text-align: left }',
    '[dir=ltr] > a { text-align: left } ' +
    '[dir=rtl] > a { text-align: right }',
    {
        addPrefixToSelector ( selector, prefix ) {
            return `${prefix} > ${selector}`
        }
    }
) )

test( 'Should correctly process values containing commas', t => run( t,
    'div { background: url(\'http://placecage.com/400/400\') 0 0 }',
    '[dir=ltr] div { background: url(\'http://placecage.com/400/400\') 0 0 } ' +
    '[dir=rtl] div { background: url(\'http://placecage.com/400/400\') 100% 0 }'
) )

test( 'Should correctly process values containing !important', t => run( t,
    '.test{margin-left:0 !important;padding-left:0 !important}',
    '[dir=ltr] .test { margin-left:0 !important; padding-left:0 !important } ' +
    '[dir=rtl] .test { margin-right:0 !important; padding-right:0 !important }'
) )
