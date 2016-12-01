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
            // use empty prefix for least change of the priority level
            prefix = ''
    }

    selectors = selectors
        .split( /\s*,\s*/ )
        .map( selector => {
            if ( isHtmlSelector( selector ) ) {
                // replace `html` at the beginning of selector 
                selector = selector.replace( /^html/ig, `html${ prefix }` )
            } else if ( isRootSelector( selector ) ) {
                selector = selector.replace( /:root/ig, `${ prefix }:root` )
            } else {
                // just add prefix for least change of the priority level
                selector = prefix ? `${ prefix } ${ selector }` : selector
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
