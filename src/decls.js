const rtlcss = require('rtlcss');

const getProcessedKeyframeValue = (decl, keyframes = [], dir) => {
  let {value} = decl;
  keyframes.forEach((keyframe) => {
    const nameRegex = new RegExp(`(^|\\s)${keyframe}($|\\s)`, 'g');
    if (!value.match(nameRegex)) return;
    value = value.replace(nameRegex, ` ${keyframe}-${dir} `);
  });
  return value;
};

const rtlifyDecl = (decl, keyframes) => {
  let {prop, value} = decl;

  if (decl.prop.match(/animation/)) {
    value = getProcessedKeyframeValue(decl, keyframes, 'rtl');
  } else {
    const rtlResult = rtlcss.process(decl, null, null);

    if (rtlResult === decl.toString()) {
      return null;
    }
    const cleanRtlResult = rtlResult.replace(/([^:]*)\s*\/\*.*?\*\/\s*/, '$1');
    [, prop, value] = cleanRtlResult.match(/([^:]*):\s*([\s\S]*)/) || [];

    value = value.replace(/\s*!important/, '');
  }
  return {prop, value};
};

const ltrifyDecl = (decl, keyframes) => {
  if (decl.prop.match(/animation/)) {
    decl.value = getProcessedKeyframeValue(decl, keyframes, 'ltr');
  }
  return decl;
};

module.exports = {
  ltrifyDecl,
  rtlifyDecl,
};
