'use strict';

var postcss = require('postcss');

function toggleDirection( direction ) {
    return direction === 'left' ? 'right' : 'left';
}

module.exports = postcss.plugin('postcss-rtl', function () {
    return css => {
        css.walkRules( rule => {
            let declsStack = [];
            if ( rule.selector.match( /\[dir=.+]/ ) ) return;

            rule.walkDecls( decl => {
                const prop = decl.prop,
                      value = decl.value;

                switch ( prop ) {
                case 'text-align':
                case 'float':
                    if ( value === 'left' || value === 'right' ) {
                        declsStack.push({
                            type:  'decl',
                            prop:  prop,
                            value: toggleDirection( decl.value )
                        });
                    }
                    break;
                default:
                }
            });

            if ( declsStack.length ) {
                const newSelector = `[dir="rtl"] ${ rule.selector }`,
                      newRule = postcss.rule({ selector: newSelector });
                newRule.append( declsStack );
                rule.parent.insertAfter( rule, newRule );
            }
        });
    };
});
