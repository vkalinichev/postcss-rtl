module.exports = {
  'attribute': {
    prefixes: {
      ltr: '[dir=ltr]',
      rtl: '[dir=rtl]',
      dir: '[dir]'
    },
    regex: /\[dir(=(\w+|"\w+"))?\]/
  },
  'class': {
    prefixes: {
      ltr: '.dir-ltr',
      rtl: '.dir-rtl',
      dir: '.dir'
    },
    regex: /\.dir(-\w+)?/
  }
}
