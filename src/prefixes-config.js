module.exports = ({prefix}) => ({
  attribute: {
    prefixes: {
      ltr: `[${prefix}=ltr]`,
      rtl: `[${prefix}=rtl]`,
    },
    regex: new RegExp(`\\[${prefix}(=(\\w+|"\\w+"))?\\]`),
  },
  class: {
    prefixes: {
      ltr: `.${prefix}-ltr`,
      rtl: `.${prefix}-rtl`,
    },
    regex: new RegExp(`\\.${prefix}(-\\w+)?`),
  },
});
