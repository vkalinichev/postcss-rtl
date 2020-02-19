const postcss = require('postcss');

const affectedProps = require('./affected-props');
const {validateOptions} = require('./options');
const {
  isKeyframeRule, isKeyframeAlreadyProcessed, isKeyframeSymmetric, rtlifyKeyframe,
} = require('./keyframes');
const {getDirRule, processSrcRule} = require('./rules');
const {rtlifyDecl, ltrifyDecl} = require('./decls');
const {isSelectorHasDir} = require('./selectors');

module.exports = postcss.plugin('postcss-rtl', options => (css) => {
  const keyframes = [];

  options = validateOptions(options);
  const whitelist = new Set(options.whitelist);
  const blacklist = new Set(options.blacklist);

  const isAllowedProp = (prop) => {
    const isAllowedByWhitelist = !options.whitelist || whitelist.has(prop);
    const isAllowedByBlacklist = !options.blacklist || !blacklist.has(prop);
    return isAllowedByWhitelist && isAllowedByBlacklist;
  };

  const handleIgnores = (removeComments = false) => {
    let isIgnored = false;
    let continuousIgnore = false;

    return (node) => {
      if (node.type === 'comment') {
        const {text} = node;

        switch (true) {
          case /^(!\s)?rtl:ignore$/.test(text):
            isIgnored = true;
            continuousIgnore = continuousIgnore || false;
            if (removeComments) node.remove();
            break;
          case /^(!\s)?rtl:begin:ignore$/.test(text):
            isIgnored = true;
            continuousIgnore = true;
            if (removeComments) node.remove();
            break;
          case /^(!\s)?rtl:end:ignore$/.test(text):
            isIgnored = false;
            continuousIgnore = false;
            if (removeComments) node.remove();
            break;
          default:
        }
        return true;
      }
      if (!continuousIgnore && isIgnored) {
        isIgnored = false;
        return true;
      }
      return isIgnored;
    };
  };

  const isKeyframeIgnored = handleIgnores();
  const isRuleIgnored = handleIgnores(options.removeComments);

  // collect @keyframes
  css.walk((rule) => {
    if (isKeyframeIgnored(rule)) return;
    if (rule.type !== 'atrule') return;

    if (!isKeyframeRule(rule)) return;
    if (isKeyframeAlreadyProcessed(rule)) return;
    if (isKeyframeSymmetric(rule)) return;

    keyframes.push(rule.params);
    rtlifyKeyframe(rule, options);
  });

  const valueIgnoreDirective = /\/\*!? *rtl *: *ignore *\*\/$/;
  const valuePrependDirective = /\/\*!? *rtl *: *prepend *: *([\S| ]*?) *\*\/$/;
  const valueAppendDirective = /\/\*!? *rtl *: *append *: *([\S| ]*?) *\*\/$/;
  const valueReplacementDirective = /\/\*!? *rtl *: *([\S| ]*?) *\*\/$/;

  const handleValueDirectives = (decl, ltrDecls, rtlDecls) => {
    const {raw} = (decl.raws.value || {});

    // Is there NO raw value?
    if (!raw) return false;

    // Does the raw value contain an ignore directive?
    if (raw.match(valueIgnoreDirective)) return true;

    // Extract directive values using RegExp.
    const values = [valuePrependDirective, valueAppendDirective, valueReplacementDirective]
      .map(regEx => (raw.match(regEx) || {})[1]);

    const [prependValue, appendValue, replaceValue] = values;

    const addDecls = (value) => {
      // Create LTR declaration.
      ltrDecls.push(ltrifyDecl(decl, keyframes));

      // Create RTL declaration with replacement value and add.
      const rtlClonedDecl = decl.clone({
        value,
      });
      rtlClonedDecl.raws.value = {
        value,
        raw: value,
      };
      rtlDecls.push(rtlClonedDecl);

      return true;
    };

    // Does the raw value contain a prepend directive?
    if (prependValue) {
      return addDecls([prependValue, decl.value].join(' '));
    }

    // Does the raw value contain an append directive?
    if (appendValue) {
      return addDecls([decl.value, appendValue].join(' '));
    }

    // Does the raw value contain a replace directive?
    if (replaceValue) {
      return addDecls(replaceValue);
    }

    return false;
  };

  const handlePropAsDirective = (decl, ltrDecls, rtlDecls) => {
    const {between} = decl.raws;
    if (!between) return false;

    const propAsDirective = /\/\*!? *rtl *: *as *: *([\S| ]*?) *\*\//;
    const prop = (between.match(propAsDirective) || {})[1];

    if (prop) {
      ltrDecls.push(ltrifyDecl(decl, keyframes));
      const {value} = rtlifyDecl(decl.clone({prop}), keyframes);
      const clone = decl.clone({value});
      rtlDecls.push(clone);
      return true;
    }
    return false;
  };

  // Simple rules (includes rules inside @media-queries)
  css.walk((node) => {
    const ltrDecls = [];
    const rtlDecls = [];
    const dirDecls = [];

    if (isRuleIgnored(node)) return;

    if (node.type !== 'rule') {
      return;
    }
    const rule = node;

    if (isSelectorHasDir(rule.selector, options)) return;
    if (isKeyframeRule(rule.parent)) return;

    rule.walkDecls((decl) => {
      // Is there a value directive?
      if (handleValueDirectives(decl, ltrDecls, rtlDecls)) return;
      if (handlePropAsDirective(decl, ltrDecls, rtlDecls)) return;
      if (!isAllowedProp(decl.prop)) return;

      const rtl = rtlifyDecl(decl, keyframes);

      if (rtl) {
        ltrDecls.push(ltrifyDecl(decl, keyframes));
        rtlDecls.push(decl.clone(rtl));
        return;
      }

      if (affectedProps.indexOf(decl.prop) >= 0) {
        dirDecls.push(decl);
        decl.remove();
      }
    });

    if (rtlDecls.length) {
      if (!options.onlyDirection || options.onlyDirection === 'rtl') {
        getDirRule(rule, 'rtl', options).append(rtlDecls);
      }

      const ltrDirRule = getDirRule(rule, 'ltr', options);
      ltrDecls.forEach((_decl) => {
        _decl.cleanRaws(_decl.root() === ltrDirRule.root());
        rule.removeChild(_decl);
        if (!options.onlyDirection || options.onlyDirection === 'ltr') {
          ltrDirRule.append(_decl);
        }
      });

      if (options.onlyDirection && options.onlyDirection === 'rtl') {
        ltrDirRule.remove();
      }
    }

    if (dirDecls.length) {
      getDirRule(rule, 'dir', options).append(dirDecls);
    }

    /* set dir attrs */
    processSrcRule(rule, options);
  });
  return false;
});
