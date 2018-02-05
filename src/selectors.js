const prefixes = require('./prefixes-config')

const isSelectorHasDir = (selector = '', {prefixType}) =>
  !!selector.match(prefixes[prefixType].regex)

const isHtmlSelector = (selector = '') =>
  !!selector.match(/^html/)

const isRootSelector = (selector = '') =>
  !!selector.match(/:root/)

const addDirToSelectors = (selectors = '', dir, options = {}) => {

  const {addPrefixToSelector, prefixType} = options
  let prefix = prefixes[prefixType].prefixes[dir]
  if (!prefix) return selectors

  return selectors
    .split(/\s*,\s*/)
    .map(selector => {
      if (addPrefixToSelector) {
        selector = addPrefixToSelector(selector, prefix)
      } else if (isHtmlSelector(selector)) {
        // only replace `html` at the beginning of selector
        selector = selector.replace(/^html/ig, `html${ prefix }`)
      } else if (isRootSelector(selector)) {
        selector = selector.replace(/:root/ig, `${ prefix }:root`)
      } else {
        // add prefix without html for least change of the priority level
        selector = `${ prefix } ${ selector }`
      }
      return selector
    })
    .join(', ')
}

module.exports = {
  isSelectorHasDir,
  isHtmlSelector,
  isRootSelector,
  addDirToSelectors
}
