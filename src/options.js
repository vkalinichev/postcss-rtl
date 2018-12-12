const defaultOptions = {
  addPrefixToSelector: false, // customized function for joining prefix and selector
  prefixType: 'attribute',    // type of dir-prefix: attribute [dir] or class .dir,
  onlyDirection: false,       // "ltr", "rtl": compile only one-direction version
  removeComments: true        // remove comments after process them
}

const validateOptions = (options = {}) => {
  const {addPrefixToSelector, prefixType, onlyDirection, removeComments} = options
  let fixedOptions = {}

  if (addPrefixToSelector && typeof addPrefixToSelector !== 'function') {
    fixedOptions.addPrefixToSelector = defaultOptions.addPrefixToSelector
    console.warn('Incorrect addPrefixToSelector option. Must be a function')
  }

  if (onlyDirection && typeof onlyDirection !== 'string') {
    fixedOptions.onlyDirection = defaultOptions.onlyDirection
    console.warn('Incorrect onlyDirection option. Allowed values: ltr, rtl')
  }

  if (prefixType && ['attribute', 'class'].indexOf(prefixType) < 0) {
    fixedOptions.prefixType = defaultOptions.prefixType
    console.warn('Incorrect prefixType option. Allowed values: attribute, class')
  }

  if (prefixType && ['attribute', 'class'].indexOf(prefixType) < 0) {
    fixedOptions.prefixType = defaultOptions.prefixType
    console.warn('Incorrect prefixType option. Allowed values: attribute, class')
  }

  if (removeComments && typeof removeComments !== 'boolean') {
    fixedOptions.removeComments = defaultOptions.removeComments
    console.warn('Incorrect removeComments option. Must be a boolean')
  }

  return Object.assign({},
    defaultOptions,
    options,
    fixedOptions
  )
}

module.exports = {
  validateOptions
}
