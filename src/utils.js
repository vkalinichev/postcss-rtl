const rtlcss = require( 'rtlcss' )

const isHtmlSelector = ( selector = '' ) =>
    !!selector.match( /^html/ )

const isRootSelector = ( selector = '' ) =>
    !!selector.match( /:root/ )

const getDirRule = ( rule, dir ) => {
    const next = rule.next()
    const selector = addDirToSelectors( rule.selector, dir )

    if ( next && next.selector === selector ) {
        return next
    } else {
        return rule.cloneAfter( { selector } ).removeAll()
    }
}

const addDirToSelectors = ( selectors = '', dir ) => {
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

const setRuleDir = ( rule, dir )=>
    rule.selector = addDirToSelectors( rule.selector, dir )

const rtlifyDecl = decl => {
    const rtlResult = rtlcss.process( decl, null, null )
    if ( rtlResult === decl.toString() ) return false

    let [ prop, value ] = rtlResult.split( /:\s*/ )
    return { prop, value }
}

const rtlifyRule = rule => {
    const rtlResult = rtlcss.process( rule, null, null )

    return ( rtlResult !== rule.toString() ) ? rtlResult : false
}

module.exports = {
    isHtmlSelector,
    isRootSelector,
    getDirRule,
    setRuleDir,
    rtlifyDecl,
    rtlifyRule
}
