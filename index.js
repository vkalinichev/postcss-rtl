const postcss = require ( 'postcss' )
const rtlcss = require ( 'rtlcss' )

const getDirSelector = ( selector, dir ) => {
    if ( dir )
        return `html[dir="${ dir }"] ${ selector }`
    else
        return `html[dir] ${ selector }`
}

const getDirRule = ( rule, dir ) => {
    const nextRule = rule.next()
    const rtlSelector = getDirSelector( rule.selector, dir )

    if ( nextRule && nextRule.selector === rtlSelector ) {
        return nextRule
    } else {
        const newRule = rule.cloneAfter( { selector: rtlSelector } )
        newRule.removeAll()
        return newRule
    }
}


module.exports = postcss.plugin ( 'postcss-rtl', () => css =>
    css.walkRules( rule => {
        if ( rule.selector.indexOf( '[dir="' ) > -1 ) return

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

        if ( hasSymmetricDecls ) {
            rule.selector = 'html[dir] ' + rule.selector
        }

        if ( ltrDecls.length && !hasSymmetricDecls ) {
            rule.remove()
        }

    } )
)
