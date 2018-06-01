const rtlcss = require('rtlcss')
const {isSelectorHasDir, addDirToSelectors} = require('./selectors')
const rtlcssOptions = {
  name: 'Skip variables',
  priority: 1,
  directives: { control: {}, value: [] },
  processors: [
    {
      name: '--',
      expr: /^--/im,
      action: (prop, value) => ({ prop, value })
    }
  ]
}

const getDirRule = (rule, dir, options) => {
  const next = rule.next()
  let selector = rule.selector

  selector = isSelectorHasDir(selector, options) ? selector : addDirToSelectors(selector, dir, options)

  if (rule.selector === selector) {
    return rule
  } else if (next && next.selector === selector) {
    return next
  } else {
    return rule.cloneAfter({selector}).removeAll()
  }
}

const setRuleDir = (rule, dir, options) => {
  const {selector} = rule
  rule.selector = isSelectorHasDir(selector, options) ? selector : addDirToSelectors(selector, dir, options)
}

const rtlifyRule = rule => {
  const rtlResult = rtlcss.process(rule, null, rtlcssOptions)

  return (rtlResult !== rule.toString()) ? rtlResult : false
}

const processSrcRule = (rule, options) => {
  if (rule.nodes.length === 0) {
    rule.remove()
  } else {
    setRuleDir(rule, null, options)
  }
}

module.exports = {
  getDirRule,
  setRuleDir,
  rtlifyRule,
  processSrcRule
}
