const isSelectorHasDir = ( selector = '' ) =>
    !!selector.match( /^html\[dir(=".+")?\]/ )

const isHtmlSelector = ( selector = '' ) =>
    !!selector.match( /^html/ )

const isRootSelector = ( selector = '' ) =>
    !!selector.match( /:root/ )

const addDirToSelectors = ( selectors = '', dir ) => {
    let prefix

    switch ( dir ) {
        case 'ltr':
        case 'rtl':
            prefix = `[dir="${ dir }"]`
            break
        default:
            prefix = '[dir]'
    }

    selectors = selectors
        .split( /\s*,\s*/ )
        .map( selector => {
            if ( isHtmlSelector( selector ) ) {
                selector = selector.replace( /html/ig, `html${ prefix }` )
            } else if ( isRootSelector( selector ) ) {
                selector = selector.replace( /:root/ig, `${ prefix }:root` )
            } else {
                selector = `html${ prefix } ${ selector }`
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
