const rtlcss = require('rtlcss');

const getProcessedKeyframeValue = (decl, keyframes = [], dir) => {
  let {value} = decl;
  keyframes.forEach((keyframe) => {
    const nameRegex = new RegExp(`(^|\\s)${keyframe}($|\\s)`);
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
    let rtlResult = rtlcss.process(decl, null, null);

    if (rtlResult === decl.toString()) {
      return null;
    }
    rtlResult = rtlResult.split("\n").join(""); /* css property value in multiple line then breaks in rtl
    .test{
       background: linear-gradient(0deg,rgba(255, 255, 255, 1) 50%,
    rgba(255, 255, 255, 0.9) 100%) 0% 0%,linear-gradient(90deg,rgba(36, 13, 13, 0.9) 0%,
    rgba(255, 255, 255, 0.6) 100%) 100% 0%,linear-gradient(180deg,rgba(255, 255, 255, 0.6) 0%,
    rgba(255, 255, 255, 0.3) 100%) 100% 100%,linear-gradient(360deg,rgba(255, 255, 255, 0.3) 0%,
    rgba(255, 255, 255, 0) 100%) 0% 100%;
    }
    regex ignore multiple line values
    */
    [, prop, value] = rtlResult.match(/([^:]*):\s*(.*)/) || [];

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
