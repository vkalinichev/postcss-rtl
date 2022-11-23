import postcss from 'postcss';
import postcssImport from 'postcss-import';
import plugin from '../index';

const normalize = (cssString) => cssString.replace(/} /g, '}'); /* fix extra space added by `postcss-import` */

const run = (expect, input, output, opts) => postcss([postcssImport, plugin(opts)])
  .process(input, {from: undefined})
  .then((result) => {
    expect(normalize(result.css)).toEqual(normalize(output));
    expect(result.warnings().length).toEqual(0);
  });

it('Should NOT add [dir] prefix to symmetric rules', () => run(expect, 'a { font-size: 1em }', 'a { font-size: 1em }'));

it('Should ONLY create LTR & RTL rules to asymmetric rules', () => run(
  expect,
  'a { font-size: 1em; text-align: left }',
  'a { font-size: 1em }'
      + '[dir=ltr] a { text-align: left }'
      + '[dir=rtl] a { text-align: right }',
));

it('Should add [dir] prefix to symmetric rules with direction related declarations', () => run(expect, 'a { text-align: center }', '[dir] a { text-align: center }'));

it('Should add [dir] prefix to symmetric rules with direction related declarations (2)', () => run(
  expect,
  'a { font-size: 1em; text-align: center }',
  'a { font-size: 1em }[dir] a { text-align: center }',
));

it('Should add [dir] prefix to symmetric rules with direction related declarations (3)', () => run(
  expect,
  'a { text-align: left }a { text-align: center }',
  '[dir=ltr] a { text-align: left }'
      + '[dir=rtl] a { text-align: right }'
      + '[dir] a { text-align: center }',
));

it('Should add [dir] prefix to symmetric rules with direction related declarations (4)', () => run(
  expect,
  'a { margin: 0 10px 0 0 }a { margin-top: 20px }',
  '[dir=ltr] a { margin: 0 10px 0 0 }'
      + '[dir=rtl] a { margin: 0 0 0 10px }'
      + '[dir] a { margin-top: 20px }',
));

it('Creates both LTR & RTL rules for asymmetric declarations', () => run(
  expect,
  'a { text-align: left }',
  '[dir=ltr] a { text-align: left }[dir=rtl] a { text-align: right }',
));

it('Removes original rule without symmetric declarations', () => run(
  expect,
  'a { text-align: left }',
  '[dir=ltr] a { text-align: left }[dir=rtl] a { text-align: right }',
));

it('Adds prefix to the html element', () => run(
  expect,
  'html { text-align: left }',
  'html[dir=ltr] { text-align: left }html[dir=rtl] { text-align: right }',
));

it('Adds prefix to the html element with class', () => run(
  expect,
  'html.foo { text-align: left }',
  'html[dir=ltr].foo { text-align: left }'
      + 'html[dir=rtl].foo { text-align: right }',
));

it('Adds prefix to the :root element', () => run(
  expect,
  ':root { text-align: left }',
  '[dir=ltr]:root { text-align: left }'
      + '[dir=rtl]:root { text-align: right }',
));

it('Adds prefix to the :root element with class', () => run(
  expect,
  ':root.foo { text-align: left }',
  '[dir=ltr]:root.foo { text-align: left }'
      + '[dir=rtl]:root.foo { text-align: right }',
));

it('Use custom `addPrefixToSelector` function', () => run(
  expect,
  'a { text-align: left }',
  '[dir=ltr] > a { text-align: left }'
      + '[dir=rtl] > a { text-align: right }',
  {
    addPrefixToSelector(selector, prefix) {
      return `${prefix} > ${selector}`;
    },
  },
));

it('Should correctly process values containing commas', () => run(
  expect,
  "div { background: url('http://placecage.com/400/400') 0 0 }",
  "[dir=ltr] div { background: url('http://placecage.com/400/400') 0 0 }"
      + "[dir=rtl] div { background: url('http://placecage.com/400/400') 100% 0 }",
));

it('Should correctly process values containing !important', () => run(
  expect,
  '.test { margin-left: 0 !important; padding-left: 0 !important }',

  '[dir=ltr] .test { margin-left: 0 !important; padding-left: 0 !important }'
      + '[dir=rtl] .test { margin-right: 0 !important; padding-right: 0 !important }',
));

it('Shouldn not create unnecessary duplications with !important', () => run(
  expect,
  '.test { display: none !important }',

  '.test { display: none !important }',
));

it('Should correctly process values containing _display', () => run(
  expect,
  '.test { float: left; _display: inline }',

  '.test { _display: inline }'
      + '[dir=ltr] .test { float: left }'
      + '[dir=rtl] .test { float: right }',
));

it('Should ignore declarations prefixed with /* rtl:ignore */', () => run(
  expect,
  '/* rtl:ignore */ .test { margin-left:0; padding-left:0 }',
  '.test { margin-left:0; padding-left:0 }',
));

it('/* rtl:ignore */: Should leave other selectors alone', () => run(
  expect,
  '/* rtl:ignore */ .test { margin-left:0 } '
      + '.rtled { margin-left:0; padding-left:0 }',

  '.test { margin-left:0 } '
      + '[dir=ltr] .rtled { margin-left:0; padding-left:0 } '
      + '[dir=rtl] .rtled { margin-right:0; padding-right:0 }',
));

it('/* rtl:ignore */: should understand overrides', () => run(
  expect,
  '.x { left: 0 } /* rtl:ignore */.x { direction: ltr }',

  '[dir=ltr] .x { left: 0 }'
      + '[dir=rtl] .x { right: 0 }'
      + '.x { direction: ltr }',
));

it('/* rtl:begin:ignore */ starts ignore mode', () => run(
  expect,
  '/* rtl:begin:ignore */'
      + '.foo { padding-left: 0 }'
      + '.bar { direction: ltr }',

  '.foo { padding-left: 0 }.bar { direction: ltr }',
));

it('/* rtl:end:ignore */ stops ignore mode', () => run(
  expect,
  '/* rtl:begin:ignore */'
      + '.foo { padding-left: 0 }'
      + '/* rtl:end:ignore */'
      + '.bar { direction: ltr }',

  '.foo { padding-left: 0 }'
      + '[dir=ltr] .bar { direction: ltr }'
      + '[dir=rtl] .bar { direction: rtl }',
));

it('/* rtl:ignore */ can be used inside /* rtl:begin:ignore */ and /* rtl:end:ignore */', () => run(
  expect,
  '/* rtl:begin:ignore */'
      + '.foo { padding-left: 0 }'
      + '/* rtl:ignore */'
      + '.bar { direction: ltr }'
      + '.baz { left: 0 }'
      + '/* rtl:end:ignore */',

  '.foo { padding-left: 0 }.bar { direction: ltr }.baz { left: 0 }',
));

it('that it ignores normal comments ', () => run(
  expect,
  '/* some comment */ .foo { padding-left: 0 }',
  '/* some comment */ [dir=ltr] .foo { padding-left: 0 } [dir=rtl] .foo { padding-right: 0 }',
));

it('Value based ignore comments are honored', () => run(
  expect,
  '.foo { margin-left: 12px; padding-left: 12px /* rtl:ignore */; }',
  '.foo { padding-left: 12px /* rtl:ignore */; }'
      + '[dir=ltr] .foo { margin-left: 12px; }'
      + '[dir=rtl] .foo { margin-right: 12px; }',
));

it('/*! rtl:ignore */ should consider as a valid directive', () => run(
  expect,
  '/*! rtl:ignore */ .test { margin-left:0; padding-left:0 }',
  '.test { margin-left:0; padding-left:0 }',
));

it('/*! rtl:begin:ignore */ and /*! rtl:end:ignore */ should consider as a valid directive', () => run(
  expect,
  '/*! rtl:begin:ignore */'
      + '.foo { padding-left: 0 }'
      + '/*! rtl:end:ignore */'
      + '.bar { direction: ltr }',

  '.foo { padding-left: 0 }'
      + '[dir=ltr] .bar { direction: ltr }'
      + '[dir=rtl] .bar { direction: rtl }',
));

it('Should add direction to flippable keyframes-animations', () => run(
  expect,
  '@keyframes bar { 100% { transform: rotate(360deg); } }',
  '@keyframes bar-ltr { 100% { transform: rotate(360deg); } }'
      + '@keyframes bar-rtl { 100% { transform: rotate(-360deg); } }',
));

it('Should handle multiple keyframes-animations', () => run(
  expect,
  '.loader {animation: load6 1.7s infinite ease, spinner 1.7s infinite ease;}'
      + '@keyframes load6 { 100% { transform: rotate(1deg) } }'
      + '@keyframes spinner { 100% { transform: rotate(-1deg) } }',

  '[dir=ltr] .loader {animation:  load6-ltr 1.7s infinite ease, spinner-ltr 1.7s infinite ease;}'
      + '[dir=rtl] .loader {animation:  load6-rtl 1.7s infinite ease, spinner-rtl 1.7s infinite ease;}'
      + '@keyframes load6-ltr { 100% { transform: rotate(1deg) } }'
      + '@keyframes load6-rtl { 100% { transform: rotate(-1deg) } }'
      + '@keyframes spinner-ltr { 100% { transform: rotate(-1deg) } }'
      + '@keyframes spinner-rtl { 100% { transform: rotate(1deg) } }',
));

it('Should ignore keyframes-animation prefixed with /* rtl:ignore */', () => run(
  expect,
  '/* rtl:ignore */ @keyframes bar { 100% { transform: rotate(360deg); } }',
  '@keyframes bar { 100% { transform: rotate(360deg); } }',
));

it('/* rtl:begin:ignore */ starts ignore mode for both keyframes and rules', () => run(
  expect,
  '/* rtl:begin:ignore */ @keyframes bar { 100% { transform: rotate(360deg); } } .foo { left: 5px }',
  '@keyframes bar { 100% { transform: rotate(360deg); } } .foo { left: 5px }',
));

it('/* rtl:end:ignore */ stops ignore mode for keyframes', () => run(
  expect,
  '/* rtl:begin:ignore */ @keyframes bar { 100% { transform: rotate(360deg); } } /* rtl:end:ignore */'
      + '.foo { left: 5px }',
  '@keyframes bar { 100% { transform: rotate(360deg); } }'
      + '[dir=ltr] .foo { left: 5px }'
      + '[dir=rtl] .foo { right: 5px }',
));

it('Should create only LTR version', () => run(
  expect,
  'a { font-size: 1em; text-align: left }'
      + '@keyframes bar { 100% { transform: rotate(360deg); } }',

  'a { font-size: 1em }'
      + '[dir=ltr] a { text-align: left }'
      + '@keyframes bar-ltr { 100% { transform: rotate(360deg); } }',
  {onlyDirection: 'ltr'},
));

it('Should create only RTL version', () => run(
  expect,
  'a { font-size: 1em; text-align: left }'
      + '@keyframes bar { 100% { transform: rotate(360deg); } }',

  'a { font-size: 1em }'
      + '[dir=rtl] a { text-align: right }'
      + '@keyframes bar-rtl { 100% { transform: rotate(-360deg); } }',
  {onlyDirection: 'rtl'},
));

it('Value replacement directives are honored', () => run(
  expect,
  '.foo { font-weight: bold; flex-direction: row/* rtl:row-reverse */; }',
  '.foo { font-weight: bold; }[dir=ltr] .foo { flex-direction: row/* rtl:row-reverse */; }[dir=rtl] .foo { flex-direction: row-reverse; }',
));

it('Value prepend directives are honored', () => run(
  expect,
  '.foo { font-weight: bold; font-family: "Droid Sans", "Helvetica Neue", Arial, sans-serif/*rtl:prepend:"Droid Arabic Kufi",*/; }',
  '.foo { font-weight: bold; }[dir=ltr] .foo { font-family: "Droid Sans", "Helvetica Neue", Arial, sans-serif/*rtl:prepend:"Droid Arabic Kufi",*/; }[dir=rtl] .foo { font-family: "Droid Arabic Kufi", "Droid Sans", "Helvetica Neue", Arial, sans-serif; }',
));

it('Value append directives are honored', () => run(
  expect,
  '.foo { font-weight: bold; transform: rotate(45deg)/* rtl:append: scaleX(-1) */; }',
  '.foo { font-weight: bold; }[dir=ltr] .foo { transform: rotate(45deg)/* rtl:append: scaleX(-1) */; }[dir=rtl] .foo { transform: rotate(45deg) scaleX(-1); }',
));

it('Value based ignore important comments are honored', () => run(
  expect,
  '.foo { margin-left: 12px; padding-left: 12px /*! rtl:ignore */; }',
  '.foo { padding-left: 12px /*! rtl:ignore */; }'
      + '[dir=ltr] .foo { margin-left: 12px; }'
      + '[dir=rtl] .foo { margin-right: 12px; }',
));

it('Value replacement directives with important comments are honored', () => run(
  expect,
  '.foo { font-weight: bold; flex-direction: row/*! rtl:row-reverse */; }',
  '.foo { font-weight: bold; }[dir=ltr] .foo { flex-direction: row/*! rtl:row-reverse */; }[dir=rtl] .foo { flex-direction: row-reverse; }',
));

it('Value prepend directives with important comments are honored', () => run(
  expect,
  '.foo { font-weight: bold; font-family: "Droid Sans", "Helvetica Neue", Arial, sans-serif/*!rtl:prepend:"Droid Arabic Kufi",*/; }',
  '.foo { font-weight: bold; }[dir=ltr] .foo { font-family: "Droid Sans", "Helvetica Neue", Arial, sans-serif/*!rtl:prepend:"Droid Arabic Kufi",*/; }[dir=rtl] .foo { font-family: "Droid Arabic Kufi", "Droid Sans", "Helvetica Neue", Arial, sans-serif; }',
));

it('Value append directives with important comments are honored', () => run(
  expect,
  '.foo { font-weight: bold; transform: rotate(45deg)/*! rtl:append: scaleX(-1) */; }',
  '.foo { font-weight: bold; }[dir=ltr] .foo { transform: rotate(45deg)/*! rtl:append: scaleX(-1) */; }[dir=rtl] .foo { transform: rotate(45deg) scaleX(-1); }',
));

it('Should keep comments', () => run(
  expect,
  '/* rtl:ignore */ a { text-align: left }',
  '/* rtl:ignore */ a { text-align: left }',
  {removeComments: false},
));

it('Should respect custom prefix (attribute)', () => run(
  expect,
  'a { text-align: left }',
  '[custom-dir-prefix=ltr] a { text-align: left }'
      + '[custom-dir-prefix=rtl] a { text-align: right }',
  {prefix: 'custom-dir-prefix'},
));

it('Should respect custom prefix (class)', () => run(
  expect,
  'a { text-align: left }',
  '.custom-dir-prefix-ltr a { text-align: left }'
      + '.custom-dir-prefix-rtl a { text-align: right }',
  {prefix: 'custom-dir-prefix', prefixType: 'class'},
));

it('Should not swap "left" and "right" subparts of selectors', () => run(
  expect,
  '.arrowLeft { margin-right: -3px }',

  '[dir=ltr] .arrowLeft { margin-right: -3px }'
      + '[dir=rtl] .arrowLeft { margin-left: -3px }',
));

it('Should respect multiline values', () => run(
  expect,
  `.multiline {
    background: rgba(0, 0, 0, 0, .5),
      linear-gradient(to right, transparent, #000);
  }`,

  `[dir=ltr] .multiline {
    background: rgba(0, 0, 0, 0, .5),
      linear-gradient(to right, transparent, #000);
  }`
      + `[dir=rtl] .multiline {
    background: rgba(0, 0, 0, 0, .5),
      linear-gradient(to left, transparent, #000);
  }`,
));

it('rtl:as: directive', () => run(
  expect,
  ':root { --padding /* rtl:as:padding */: 1px 2px 3px 4px }',

  '[dir=ltr]:root { --padding /* rtl:as:padding */: 1px 2px 3px 4px }'
      + '[dir=rtl]:root { --padding /* rtl:as:padding */: 1px 4px 3px 2px }',
));

it('rtl aliases', () => run(
  expect,
  ':root { --padding: 1px 2px 3px 4px }',

  '[dir=ltr]:root { --padding: 1px 2px 3px 4px }'
      + '[dir=rtl]:root { --padding: 1px 4px 3px 2px }',
  {aliases: {'--padding': 'padding'}},
));

it('should ignore ignored @import', () => run(
  expect,
  '/* rtl:begin:ignore */'
      + `@import "${__dirname}/../test-import.css";`
      + '/* rtl:end:ignore */',

  '.test-import { padding-left: 1rem }',
));

it('should ignore blacklist properties', () => run(
  expect,
  '.test {padding-left: 1rem;padding: 1rem 2rem 3rem 4rem}',

  '.test {padding: 1rem 2rem 3rem 4rem}'
      + '[dir=ltr] .test {padding-left: 1rem}'
      + '[dir=rtl] .test {padding-right: 1rem}',
  {blacklist: ['padding']},
));

it('should process whitelist properties only', () => run(
  expect,
  '.test {padding-left: 1rem;padding: 1rem 2rem 3rem 4rem}',

  '.test {padding-left: 1rem}'
      + '[dir=ltr] .test {padding: 1rem 2rem 3rem 4rem}'
      + '[dir=rtl] .test {padding: 1rem 4rem 3rem 2rem}',
  {whitelist: ['padding']},
));
