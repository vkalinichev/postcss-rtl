const defaultOptions = {
  addPrefixToSelector: false, // customized function for joining prefix and selector
  prefixType: 'attribute', // type of dir-prefix: attribute [dir] or class .dir,
  prefix: 'dir', // string to use as prefix (e.g. dir, my-special-dir)
  onlyDirection: false, // "ltr", "rtl": compile only one-direction version
  fromRTL: false, // assume styles are written in rtl initially
  removeComments: true, // remove comments after process them
  blacklist: undefined, // blacklist for css properties
  whitelist: undefined, // whitelist for css properties
};

/* eslint-disable no-console */
const validateOptions = (options = {}) => {
  const {
    addPrefixToSelector,
    fromRTL,
    onlyDirection,
    prefix,
    prefixType,
    removeComments,
    blacklist,
    whitelist,
  } = options;
  const fixedOptions = {};

  if (addPrefixToSelector && typeof addPrefixToSelector !== 'function') {
    fixedOptions.addPrefixToSelector = defaultOptions.addPrefixToSelector;
    console.warn('Incorrect addPrefixToSelector option. Must be a function');
  }

  if (onlyDirection && typeof onlyDirection !== 'string') {
    fixedOptions.onlyDirection = defaultOptions.onlyDirection;
    console.warn('Incorrect onlyDirection option. Allowed values: ltr, rtl');
  }

  if (prefixType && ['attribute', 'class'].indexOf(prefixType) < 0) {
    fixedOptions.prefixType = defaultOptions.prefixType;
    console.warn('Incorrect prefixType option. Allowed values: attribute, class');
  }

  if (prefixType && ['attribute', 'class'].indexOf(prefixType) < 0) {
    fixedOptions.prefixType = defaultOptions.prefixType;
    console.warn('Incorrect prefixType option. Allowed values: attribute, class');
  }

  if (typeof prefix === 'string' && prefix.length < 1) {
    console.warn('Incorrect prefix: must not be empty');
  }

  if (removeComments && typeof removeComments !== 'boolean') {
    fixedOptions.removeComments = defaultOptions.removeComments;
    console.warn('Incorrect removeComments option. Must be a boolean');
  }

  if (fromRTL && typeof fromRTL !== 'boolean') {
    fixedOptions.removeComments = defaultOptions.removeComments;
    console.warn('Incorrect fromRTL option. Must be a boolean');
  }

  if (blacklist && (!Array.isArray(blacklist) || blacklist.some(prop => typeof prop !== 'string'))) {
    fixedOptions.blacklist = defaultOptions.blacklist;
    console.warn('Incorrect blacklist option. Must be an array of strings');
  }

  if (whitelist && (!Array.isArray(whitelist) || whitelist.some(prop => typeof prop !== 'string'))) {
    fixedOptions.whitelist = defaultOptions.whitelist;
    console.warn('Incorrect whitelist option. Must be an array of strings');
  }

  return Object.assign({},
    defaultOptions,
    options,
    fixedOptions);
};
/* eslint-enable no-console */

module.exports = {
  validateOptions,
};
