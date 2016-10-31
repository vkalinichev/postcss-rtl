const postcss = require( 'postcss' )

const { isKeyframeRule, isKeyframeAlreadyProcessed, isKeyframeSymmetric, rtlifyKeyframe } = require( './keyframes' )
const { getDirRule, processSrcRule } = require( './rules' )
const { rtlifyDecl, ltrifyDecl } = require( './decls' )

module.exports = postcss.plugin( 'postcss-rtl', () => css => {

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

        if ( rule.selector.match( /\[dir/ ) ) return
        if ( isKeyframeRule( rule.parent ) ) return

        rule.walkDecls( decl => {
            const rtl = rtlifyDecl( decl, keyframes )

            if ( !rtl ) return

            ltrDecls.push( ltrifyDecl( decl, keyframes ) )
            rtlDecls.push( decl.clone( rtl ) )
        } )

        if ( rtlDecls.length ) {
            let ltrDirRule
            getDirRule( rule, 'rtl' ).append( rtlDecls )
            ltrDirRule = getDirRule( rule, 'ltr' )
            ltrDecls.forEach( _decl => _decl.moveTo( ltrDirRule ) )
        }

        /* set dir attrs */
        processSrcRule( rule )
    } )
    return false
} )
