const rtlcss = require('rtlcss');
const {isSelectorHasDir, addDirToSelectors} = require('./selectors');

const getDirRule = (rule, dir, options) => {
  const next = rule.next();
  let {selector} = rule;

  selector = isSelectorHasDir(selector, options)
    ? selector
    : addDirToSelectors(selector, dir, options);

  if (rule.selector === selector) {
    return rule;
  } if (next && next.selector === selector) {
    return next;
  }
  return rule.cloneAfter({selector}).removeAll();
};

const setRuleDir = (rule, dir, options) => {
  const {selector} = rule;
  rule.selector = isSelectorHasDir(selector, options)
    ? selector
    : addDirToSelectors(selector, dir, options);
};

const rtlifyRule = (rule) => {
  const rtlResult = rtlcss.process(rule, null, null);

  return (rtlResult !== rule.toString()) ? rtlResult : false;
};

const processSrcRule = (rule, options) => {
  if (rule.nodes.length === 0) {
    rule.remove();
  } else {
    setRuleDir(rule, null, options);
  }
};

module.exports = {
  getDirRule,
  setRuleDir,
  rtlifyRule,
  processSrcRule,
};
