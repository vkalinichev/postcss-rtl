const postcss = require( 'postcss' )
// const parser = require( 'postcss-selector-parser' )
const rtlcss = require( 'rtlcss' )
// const unprefixed = postcss.vendor.unprefixed

const getDirRule = ( rule, dir ) => {
    const next = rule.next()
    const selector = addDirToSelectors( rule.selector, dir )

    if ( next && next.selector === selector ) {
        return next
    } else {
        return rule.cloneAfter( { selector } ).removeAll()
    }
}

// const isKeyframeStep = ( rule ) => {
//     if ( !rule || rule.parent.type !== 'atrule' ) return false
//     return unprefixed( rule.parent.name ) === 'keyframes'
// }

const isHtmlSelector = ( selector = '' ) =>
    !!selector.match( /^html/ )

const isRootSelector = ( selector = '' ) =>
    !!selector.match( /:root/ )

const addDirToSelectors = ( selectors, dir ) => {
    let prefix

    switch ( dir ) {
        case 'ltr':
        case 'rtl':
            prefix = `[dir="${ dir }"]`
            break
        default:
            prefix = '[dir]'
    }

    selectors = selectors
        .split( /\s*,\s*/ )
        .map( selector => {
            if ( isHtmlSelector( selector ) ) {
                selector = selector.replace( /html/ig, `html${ prefix }` )
            } else if ( isRootSelector( selector ) ) {
                selector = selector.replace( /:root/ig, `${ prefix }:root` )
            } else {
                selector = `html${ prefix } ${ selector }`
            }
            return selector
        } )
        .join( ', ' )

    return selectors
}

module.exports = postcss.plugin( 'postcss-rtl', () => css =>
    css.walkRules( rule => {
        if ( rule.selector.indexOf( '[dir' ) > -1 ) return
        // if ( isKeyframeStep( rule ) ) return // todo Process keyframes steps

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
