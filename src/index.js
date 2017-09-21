const postcss = require( 'postcss' )

const affectedProps = require( './affected-props' )
const { validateOptions } = require( './options' )
const { isKeyframeRule, isKeyframeAlreadyProcessed, isKeyframeSymmetric, rtlifyKeyframe } = require( './keyframes' )
const { getDirRule, processSrcRule } = require( './rules' )
const { rtlifyDecl, ltrifyDecl } = require( './decls' )
const { isSelectorHasDir } = require( './selectors' )

module.exports = postcss.plugin( 'postcss-rtl', ( options ) => css => {

    let keyframes = []

    options = validateOptions( options )

    // collect @keyframes
    css.walkAtRules( rule => {
        if ( !isKeyframeRule( rule ) ) return
        if ( isKeyframeAlreadyProcessed( rule ) ) return
        if ( isKeyframeSymmetric( rule ) ) return

        keyframes.push( rule.params )
        rtlifyKeyframe( rule )
    } )

    let skip = 0
    // Simple rules (includes rules inside @media-queries)
    css.walk( node => {
        let ltrDecls = []
        let rtlDecls = []
        let dirDecls = []

        if ( node.type === 'comment' ) {
            switch ( node.text ) {
                case 'rtl:ignore':
                    skip = Math.max(skip, 1)
                    node.remove()
                    break
                case 'rtl:begin:ignore':
                    skip = Infinity
                    node.remove()
                    break
                case 'rtl:end:ignore':
                    skip = 0
                    node.remove()
                    break
            }
        }
        if ( node.type !== 'rule' ) {
            return
        }
        if ( skip-- > 0 ) return
        const rule = node

        if ( isSelectorHasDir( rule.selector, options ) ) return
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
            ltrDecls.forEach( _decl => {
                _decl.cleanRaws( _decl.root() === ltrDirRule.root() )
                rule.removeChild( _decl )
                ltrDirRule.append( _decl )
            })
        }

        if ( dirDecls.length ) {
            getDirRule( rule, 'dir', options ).append( dirDecls )
        }

        /* set dir attrs */
        processSrcRule( rule, options )
    } )
    return false
} )
