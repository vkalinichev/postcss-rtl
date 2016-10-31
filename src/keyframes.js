const postcss = require( 'postcss' )
const unprefixed = postcss.vendor.unprefixed
const { rtlifyDecl } = require( './decls' )
const { rtlifyRule } = require( './rules' )

const isKeyframeRule = rule =>
    rule.type === 'atrule' && unprefixed( rule.name ) === 'keyframes'

const isKeyframeAlreadyProcessed = rule =>
    !!rule.params.match( /-ltr$|-rtl$/ )

const isKeyframeSymmetric = rule =>
    !rtlifyRule( rule )

const rtlifyKeyframe = rule => {
    let rtlRule = rule.cloneAfter( { params: rule.params + '-rtl' } )
    rule.params += '-ltr'

    rtlRule.walkDecls( decl => {
        const rtl = rtlifyDecl( decl )
        decl.value = rtl ? rtl.value : decl.value
    } )
}

module.exports = {
    isKeyframeRule,
    isKeyframeAlreadyProcessed,
    isKeyframeSymmetric,
    rtlifyKeyframe
}
