'use strict';

var postcss = require('postcss');

function toggleDirection( direction ) {
    return direction === 'left' ? 'right' : 'left';
}

function reverseRoundedValues( values ) {
    const arr = values.split( /\s+/ );
    return [ arr[0], arr[3], arr[2], arr[1] ].join( ' ' );
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
                case 'margin':
                    if ( !value.match( /^(\w+\s+){3}\w+$/ ) ) break;

                    declsStack.push({
                        type:  'decl',
                        prop:  prop,
                        value: reverseRoundedValues( value )
                    });

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
