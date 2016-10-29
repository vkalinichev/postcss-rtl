const postcss = require( 'postcss' )
const unprefixed = postcss.vendor.unprefixed

const { getDirRule, setRuleDir, rtlifyDecl, rtlifyRule } = require( './utils.js' )

module.exports = postcss.plugin( 'postcss-rtl', () => css => {

    // Keyframes-animations
    css.walkAtRules( rule => {
        const name = rule.params
        let rtl
        let rtlRule

        if ( rule.name !== unprefixed( 'keyframes' ) ) return
        if ( name.match( /-ltr|-rtl/ ) ) return

        rtl = rtlifyRule( rule )

        if ( !rtl ) return

        rtlRule = rule.cloneAfter( { params: name + '-rtl' } )
        rule.params += '-ltr'

        rtlRule.walkDecls( decl => {
            decl.value = rtlifyDecl( decl ).value
        } )

        css.walkDecls( decl => {
            let callerRule
            if ( !decl.prop.match( /animation/ ) ) return
            if ( !decl.value.match( new RegExp( name ) ) ) return

            callerRule = decl.parent
            if ( callerRule.selector.match( /\[dir/ ) ) return
            if ( callerRule.selector.match( /\[dir/ ) ) return

            const rtlDirRule = getDirRule( callerRule, 'rtl' )
            const rtlDecl = decl.clone( { value: decl.value.replace( name, name + '-rtl' ) } )
            rtlDirRule.append( rtlDecl )

            setRuleDir( callerRule, 'ltr' )
            decl.value = decl.value.replace( name, name + '-ltr' )
        } )
    } )

    // Simple rules (includes rules inside @media-queries)
    css.walkRules( rule => {

        if ( rule.selector.match( /\[dir/ ) ) return
        if ( rule.parent.type === 'atrule' && rule.parent.name === unprefixed( 'keyframes' ) ) return

        let hasSymmetricDecls = false
        let ltrDecls = []
        let rtlDecls = []

        rule.walkDecls( decl => {
            const rtl = rtlifyDecl( decl )

            hasSymmetricDecls = hasSymmetricDecls || !rtl

            if ( rtl ) {
                ltrDecls.push( decl )
                rtlDecls.push( decl.clone( rtl ) )
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
            setRuleDir( rule )
        }

    } )
    return false
} )
