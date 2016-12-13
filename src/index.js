const postcss = require( 'postcss' )

const affectedProps = require( './affected-props' )
const { isKeyframeRule, isKeyframeAlreadyProcessed, isKeyframeSymmetric, rtlifyKeyframe } = require( './keyframes' )
const { getDirRule, processSrcRule } = require( './rules' )
const { rtlifyDecl, ltrifyDecl } = require( './decls' )
const { isSelectorHasDir } = require( './selectors' )

const defaultOptions = {
    addPrefixToSelector: null, // customized function for joining prefix and selector
    markType: 'class'
}

module.exports = postcss.plugin( 'postcss-rtl', ( options = defaultOptions ) => css => {

    const { addPrefixToSelector } = options
    let keyframes = []

    // collect @keyframes
    css.walkAtRules( rule => {
        if ( !isKeyframeRule( rule ) ) return
        if ( isKeyframeAlreadyProcessed( rule ) ) return
        if ( isKeyframeSymmetric( rule ) ) return

        keyframes.push( rule.params )
        rtlifyKeyframe( rule )
    } )

    // Simple rules (includes rules inside @media-queries)
    css.walkRules( rule => {
        let ltrDecls = []
        let rtlDecls = []
        let dirDecls = []

        if ( isSelectorHasDir( rule.selector ) ) return
        if ( isKeyframeRule( rule.parent ) ) return

        rule.walkDecls( decl => {
            const rtl = rtlifyDecl( decl, keyframes )

            if ( rtl ) {
                ltrDecls.push( ltrifyDecl( decl, keyframes ) )
                rtlDecls.push( decl.clone( rtl ) )
                return
            }

            if ( affectedProps.indexOf( decl.prop ) >= 0 ) {
                dirDecls.push( decl )
                decl.remove()
            }
        } )

        if ( rtlDecls.length ) {
            let ltrDirRule
            getDirRule( rule, 'rtl', options ).append( rtlDecls )
            ltrDirRule = getDirRule( rule, 'ltr', options )
            ltrDecls.forEach( _decl => _decl.moveTo( ltrDirRule ) )
        }

        if ( dirDecls.length ) {
            getDirRule( rule, 'dir', options ).append( dirDecls )
        }

        /* set dir attrs */
        processSrcRule( rule )
    } )
    return false
} )
