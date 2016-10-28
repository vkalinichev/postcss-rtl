const postcss = require( 'postcss' )
const rtlcss = require( 'rtlcss' )

const { getDirRule, addDirToSelectors } = require( './utils.js' )

module.exports = postcss.plugin( 'postcss-rtl', () => css =>

    css.walkRules( rule => {
        if ( rule.selector.indexOf( '[dir' ) > -1 ) return

        let hasSymmetricDecls = false
        let ltrDecls = []
        let rtlDecls = []

        rule.walkDecls( decl => {
            const rtlResult = rtlcss.process( decl )
            const isSimmetricDecl = rtlResult === decl.toString()
            const [ prop, value ] = rtlResult.split( /:\s*/ )

            hasSymmetricDecls = hasSymmetricDecls || isSimmetricDecl

            if ( !isSimmetricDecl ) {
                ltrDecls.push( decl )
                rtlDecls.push( decl.clone( { prop, value } ) )
            }
        } )

        if ( ltrDecls.length ) {
            getDirRule( rule, 'rtl' ).append( rtlDecls )
            const ltrDirRule = getDirRule( rule, 'ltr' )
            ltrDecls.forEach( _decl => _decl.moveTo( ltrDirRule ) )
        }

        if ( rule.nodes.length === 0 ) {
            rule.remove()
        } else {
            rule.selector = addDirToSelectors( rule.selector )
        }

    } )

)
