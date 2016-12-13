const defaultOptions = {
    addPrefixToSelector: null, // customized function for joining prefix and selector
    prefixType: 'attribute'    // type of dir-prefix: attribute [dir] or class .dir
}

const validateOptions = ( options = {} ) => {
    const { addPrefixToSelector, prefixType } = options
    let fixedOptions = {}

    if ( addPrefixToSelector && typeof addPrefixToSelector !== 'function' ) {
        fixedOptions.addPrefixToSelector = null
        console.warn( 'Incorrect **addPrefixToSelector option. Must be a function' )
    }
    if ( prefixType && [ 'attribute', 'class' ].indexOf( prefixType ) < 0 ) {
        fixedOptions.prefixType = 'attribute'
        console.warn( 'Incorrect prefixType option. Allowed values: attribute, class' )
    }
    return Object.assign( {},
        defaultOptions,
        options,
        fixedOptions
    )
}

module.exports = {
    validateOptions
}
