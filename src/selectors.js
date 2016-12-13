const isSelectorHasDir = ( selector = '' ) =>
    !!selector.match( /\[dir(=".+")?\]/ )

const isHtmlSelector = ( selector = '' ) =>
    !!selector.match( /^html/ )

const isRootSelector = ( selector = '' ) =>
    !!selector.match( /:root/ )

const addDirToSelectors = ( selectors = '', dir, options={} ) => {

    const { addPrefixToSelector } = options
    let prefix

    switch ( dir ) {
        case 'ltr':
        case 'rtl':
            prefix = `[dir="${ dir }"]`
            break
        case 'dir':
            prefix = '[dir]'
            break
        default:
            prefix = ''
    }

    if ( !prefix ) {
        return selectors
    }

    selectors = selectors
        .split( /\s*,\s*/ )
        .map( selector => {
            if ( typeof addPrefixToSelector === 'function' ) {
                selector = addPrefixToSelector( selector, prefix )
            } else if ( isHtmlSelector( selector ) ) {
                // only replace `html` at the beginning of selector
                selector = selector.replace( /^html/ig, `html${ prefix }` )
            } else if ( isRootSelector( selector ) ) {
                selector = selector.replace( /:root/ig, `${ prefix }:root` )
            } else {
                // add prefix without html for least change of the priority level
                selector = `${ prefix } ${ selector }`
            }
            return selector
        } )
        .join( ', ' )

    return selectors
}

module.exports = {
    isSelectorHasDir,
    isHtmlSelector,
    isRootSelector,
    addDirToSelectors
}
