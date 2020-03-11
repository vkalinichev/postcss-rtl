import postcss from 'postcss';
import postcssImport from 'postcss-import';
import test from 'ava';
import plugin from './index';

const normalize = cssString => cssString
  .replace(/} /g, '}'); /* fix extra space added by `postcss-import` */

const run = (t, input, output, opts) => postcss([
  postcssImport,
  plugin(opts),
])
  .process(input, {from: undefined})
  .then((result) => {
    t.is(normalize(result.css), normalize(output));
    t.is(result.warnings().length, 0);
  });

test('Should NOT add [dir] prefix to symmetric rules', t => run(t,
  'a { font-size: 1em }',
  'a { font-size: 1em }'));

test('Should ONLY create LTR & RTL rules to asymmetric rules', t => run(t,
  'a { font-size: 1em; text-align: left }',
  'a { font-size: 1em }'
  + '[dir=ltr] a { text-align: left }'
  + '[dir=rtl] a { text-align: right }'));

test('Should add [dir] prefix to symmetric rules with direction related declarations', t => run(t,
  'a { text-align: center }',
  '[dir] a { text-align: center }'));

test('Should add [dir] prefix to symmetric rules with direction related declarations (2)', t => run(t,
  'a { font-size: 1em; text-align: center }',
  'a { font-size: 1em }'
  + '[dir] a { text-align: center }'));

test('Should add [dir] prefix to symmetric rules with direction related declarations (3)', t => run(t,
  'a { text-align: left }'
  + 'a { text-align: center }',
  '[dir=ltr] a { text-align: left }'
  + '[dir=rtl] a { text-align: right }'
  + '[dir] a { text-align: center }'));

test('Should add [dir] prefix to symmetric rules with direction related declarations (4)', t => run(t,
  'a { margin: 0 10px 0 0 }'
  + 'a { margin-top: 20px }',
  '[dir=ltr] a { margin: 0 10px 0 0 }'
  + '[dir=rtl] a { margin: 0 0 0 10px }'
  + '[dir] a { margin-top: 20px }'));

test('Creates both LTR & RTL rules for asymmetric declarations', t => run(t,
  'a { text-align: left }',
  '[dir=ltr] a { text-align: left }'
  + '[dir=rtl] a { text-align: right }'));

test('Removes original rule without symmetric declarations', t => run(t,
  'a { text-align: left }',
  '[dir=ltr] a { text-align: left }'
  + '[dir=rtl] a { text-align: right }'));

test('Adds prefix to the html element', t => run(t,
  'html { text-align: left }',
  'html[dir=ltr] { text-align: left }'
  + 'html[dir=rtl] { text-align: right }'));

test('Adds prefix to the html element with class', t => run(t,
  'html.foo { text-align: left }',
  'html[dir=ltr].foo { text-align: left }'
  + 'html[dir=rtl].foo { text-align: right }'));

test('Adds prefix to the :root element', t => run(t,
  ':root { text-align: left }',
  '[dir=ltr]:root { text-align: left }'
  + '[dir=rtl]:root { text-align: right }'));

test('Adds prefix to the :root element with class', t => run(t,
  ':root.foo { text-align: left }',
  '[dir=ltr]:root.foo { text-align: left }'
  + '[dir=rtl]:root.foo { text-align: right }'));

test('Use custom `addPrefixToSelector` function', t => run(t,
  'a { text-align: left }',
  '[dir=ltr] > a { text-align: left }'
  + '[dir=rtl] > a { text-align: right }',
  {
    addPrefixToSelector(selector, prefix) {
      return `${prefix} > ${selector}`;
    },
  }));

test('Should correctly process values containing commas', t => run(t,
  'div { background: url(\'http://placecage.com/400/400\') 0 0 }',
  '[dir=ltr] div { background: url(\'http://placecage.com/400/400\') 0 0 }'
  + '[dir=rtl] div { background: url(\'http://placecage.com/400/400\') 100% 0 }'));

test('Should correctly process values containing !important', t => run(t,
  '.test { margin-left: 0 !important; padding-left: 0 !important }',

  '[dir=ltr] .test { margin-left: 0 !important; padding-left: 0 !important }'
  + '[dir=rtl] .test { margin-right: 0 !important; padding-right: 0 !important }'));

test('Shouldn not create unnecessary duplications with !important', t => run(t,
  '.test { display: none !important }',

  '.test { display: none !important }'));

test('Should correctly process values containing _display', t => run(t,
  '.test { float: left; _display: inline }',

  '.test { _display: inline }'
  + '[dir=ltr] .test { float: left }'
  + '[dir=rtl] .test { float: right }'));

test('Should ignore declarations prefixed with /* rtl:ignore */', t => run(t,
  '/* rtl:ignore */ .test { margin-left:0; padding-left:0 }',
  '.test { margin-left:0; padding-left:0 }'));

test('/* rtl:ignore */: Should leave other selectors alone', t => run(t,
  '/* rtl:ignore */ .test { margin-left:0 } '
  + '.rtled { margin-left:0; padding-left:0 }',

  '.test { margin-left:0 } '
  + '[dir=ltr] .rtled { margin-left:0; padding-left:0 } '
  + '[dir=rtl] .rtled { margin-right:0; padding-right:0 }'));

test('/* rtl:ignore */: should understand overrides', t => run(t,
  '.x { left: 0 } '
  + '/* rtl:ignore */'
  + '.x { direction: ltr }',

  '[dir=ltr] .x { left: 0 }'
  + '[dir=rtl] .x { right: 0 }'
  + '.x { direction: ltr }'));

test('/* rtl:begin:ignore */ starts ignore mode', t => run(t,
  '/* rtl:begin:ignore */'
  + '.foo { padding-left: 0 }'
  + '.bar { direction: ltr }',

  '.foo { padding-left: 0 }'
  + '.bar { direction: ltr }'));

test('/* rtl:end:ignore */ stops ignore mode', t => run(t,
  '/* rtl:begin:ignore */'
  + '.foo { padding-left: 0 }'
  + '/* rtl:end:ignore */'
  + '.bar { direction: ltr }',

  '.foo { padding-left: 0 }'
  + '[dir=ltr] .bar { direction: ltr }'
  + '[dir=rtl] .bar { direction: rtl }'));

test('/* rtl:ignore */ can be used inside /* rtl:begin:ignore */ and /* rtl:end:ignore */', t => run(t,
  '/* rtl:begin:ignore */'
  + '.foo { padding-left: 0 }'
  + '/* rtl:ignore */'
  + '.bar { direction: ltr }'
  + '.baz { left: 0 }'
  + '/* rtl:end:ignore */',

  '.foo { padding-left: 0 }'
  + '.bar { direction: ltr }'
  + '.baz { left: 0 }'));

test('that it ignores normal comments ', t => run(t,
  '/* some comment */ .foo { padding-left: 0 }',
  '/* some comment */ [dir=ltr] .foo { padding-left: 0 } [dir=rtl] .foo { padding-right: 0 }'));

test('Value based ignore comments are honored', t => run(t,
  '.foo { margin-left: 12px; padding-left: 12px /* rtl:ignore */; }',
  '.foo { padding-left: 12px /* rtl:ignore */; }'
  + '[dir=ltr] .foo { margin-left: 12px; }'
  + '[dir=rtl] .foo { margin-right: 12px; }'));

test('/*! rtl:ignore */ should consider as a valid directive', t => run(t,
  '/*! rtl:ignore */ .test { margin-left:0; padding-left:0 }',
  '.test { margin-left:0; padding-left:0 }'));

test('/*! rtl:begin:ignore */ and /*! rtl:end:ignore */ should consider as a valid directive', t => run(t,
  '/*! rtl:begin:ignore */'
  + '.foo { padding-left: 0 }'
  + '/*! rtl:end:ignore */'
  + '.bar { direction: ltr }',

  '.foo { padding-left: 0 }'
  + '[dir=ltr] .bar { direction: ltr }'
  + '[dir=rtl] .bar { direction: rtl }'));

test('Should add direction to flippable keyframes-animations', t => run(t,
  '@keyframes bar { 100% { transform: rotate(360deg); } }',
  '@keyframes bar-ltr { 100% { transform: rotate(360deg); } }'
  + '@keyframes bar-rtl { 100% { transform: rotate(-360deg); } }'));

test('Should handle multiple keyframes-animations', t => run(t,
  '.loader {animation: load6 1.7s infinite ease, spinner 1.7s infinite ease;}'
+ '@keyframes load6 { 100% { transform: rotate(1deg) } }'
+ '@keyframes spinner { 100% { transform: rotate(-1deg) } }',

  '[dir=ltr] .loader {animation:  load6-ltr 1.7s infinite ease, spinner-ltr 1.7s infinite ease;}'
+ '[dir=rtl] .loader {animation:  load6-rtl 1.7s infinite ease, spinner-rtl 1.7s infinite ease;}'
+ '@keyframes load6-ltr { 100% { transform: rotate(1deg) } }'
+ '@keyframes load6-rtl { 100% { transform: rotate(-1deg) } }'
+ '@keyframes spinner-ltr { 100% { transform: rotate(-1deg) } }'
+ '@keyframes spinner-rtl { 100% { transform: rotate(1deg) } }'));

test('Should ignore keyframes-animation prefixed with /* rtl:ignore */', t => run(t,
  '/* rtl:ignore */ @keyframes bar { 100% { transform: rotate(360deg); } }',
  '@keyframes bar { 100% { transform: rotate(360deg); } }'));

test('/* rtl:begin:ignore */ starts ignore mode for both keyframes and rules', t => run(t,
  '/* rtl:begin:ignore */ @keyframes bar { 100% { transform: rotate(360deg); } } .foo { left: 5px }',
  '@keyframes bar { 100% { transform: rotate(360deg); } } .foo { left: 5px }'));

test('/* rtl:end:ignore */ stops ignore mode for keyframes', t => run(t,
  '/* rtl:begin:ignore */ @keyframes bar { 100% { transform: rotate(360deg); } } /* rtl:end:ignore */'
  + '.foo { left: 5px }',
  '@keyframes bar { 100% { transform: rotate(360deg); } }'
  + '[dir=ltr] .foo { left: 5px }'
  + '[dir=rtl] .foo { right: 5px }'));

test('Should create only LTR version', t => run(t,
  'a { font-size: 1em; text-align: left }'
  + '@keyframes bar { 100% { transform: rotate(360deg); } }',

  'a { font-size: 1em }'
  + '[dir=ltr] a { text-align: left }'
  + '@keyframes bar-ltr { 100% { transform: rotate(360deg); } }',
  {onlyDirection: 'ltr'}));

test('Should create only RTL version', t => run(t,
  'a { font-size: 1em; text-align: left }'
  + '@keyframes bar { 100% { transform: rotate(360deg); } }',

  'a { font-size: 1em }'
  + '[dir=rtl] a { text-align: right }'
  + '@keyframes bar-rtl { 100% { transform: rotate(-360deg); } }',
  {onlyDirection: 'rtl'}));

test('Value replacement directives are honored', t => run(t,
  '.foo { font-weight: bold; flex-direction: row/* rtl:row-reverse */; }',
  '.foo { font-weight: bold; }[dir=ltr] .foo { flex-direction: row/* rtl:row-reverse */; }[dir=rtl] .foo { flex-direction: row-reverse; }'));

test('Value prepend directives are honored', t => run(t,
  '.foo { font-weight: bold; font-family: "Droid Sans", "Helvetica Neue", Arial, sans-serif/*rtl:prepend:"Droid Arabic Kufi",*/; }',
  '.foo { font-weight: bold; }[dir=ltr] .foo { font-family: "Droid Sans", "Helvetica Neue", Arial, sans-serif/*rtl:prepend:"Droid Arabic Kufi",*/; }[dir=rtl] .foo { font-family: "Droid Arabic Kufi", "Droid Sans", "Helvetica Neue", Arial, sans-serif; }'));

test('Value append directives are honored', t => run(t,
  '.foo { font-weight: bold; transform: rotate(45deg)/* rtl:append: scaleX(-1) */; }',
  '.foo { font-weight: bold; }[dir=ltr] .foo { transform: rotate(45deg)/* rtl:append: scaleX(-1) */; }[dir=rtl] .foo { transform: rotate(45deg) scaleX(-1); }'));

test('Value based ignore important comments are honored', t => run(t,
  '.foo { margin-left: 12px; padding-left: 12px /*! rtl:ignore */; }',
  '.foo { padding-left: 12px /*! rtl:ignore */; }'
  + '[dir=ltr] .foo { margin-left: 12px; }'
  + '[dir=rtl] .foo { margin-right: 12px; }'));

test('Value replacement directives with important comments are honored', t => run(t,
  '.foo { font-weight: bold; flex-direction: row/*! rtl:row-reverse */; }',
  '.foo { font-weight: bold; }[dir=ltr] .foo { flex-direction: row/*! rtl:row-reverse */; }[dir=rtl] .foo { flex-direction: row-reverse; }'));

test('Value prepend directives with important comments are honored', t => run(t,
  '.foo { font-weight: bold; font-family: "Droid Sans", "Helvetica Neue", Arial, sans-serif/*!rtl:prepend:"Droid Arabic Kufi",*/; }',
  '.foo { font-weight: bold; }[dir=ltr] .foo { font-family: "Droid Sans", "Helvetica Neue", Arial, sans-serif/*!rtl:prepend:"Droid Arabic Kufi",*/; }[dir=rtl] .foo { font-family: "Droid Arabic Kufi", "Droid Sans", "Helvetica Neue", Arial, sans-serif; }'));

test('Value append directives with important comments are honored', t => run(t,
  '.foo { font-weight: bold; transform: rotate(45deg)/*! rtl:append: scaleX(-1) */; }',
  '.foo { font-weight: bold; }[dir=ltr] .foo { transform: rotate(45deg)/*! rtl:append: scaleX(-1) */; }[dir=rtl] .foo { transform: rotate(45deg) scaleX(-1); }'));

test('Should keep comments', t => run(t,
  '/* rtl:ignore */ a { text-align: left }',
  '/* rtl:ignore */ a { text-align: left }',
  {removeComments: false}));

test('Should respect custom prefix (attribute)', t => run(t,
  'a { text-align: left }',
  '[custom-dir-prefix=ltr] a { text-align: left }'
  + '[custom-dir-prefix=rtl] a { text-align: right }',
  {prefix: 'custom-dir-prefix'}));

test('Should respect custom prefix (class)', t => run(t,
  'a { text-align: left }',
  '.custom-dir-prefix-ltr a { text-align: left }'
  + '.custom-dir-prefix-rtl a { text-align: right }',
  {prefix: 'custom-dir-prefix', prefixType: 'class'}));

test('Should not swap "left" and "right" subparts of selectors', t => run(t,
  '.arrowLeft { margin-right: -3px }',

  '[dir=ltr] .arrowLeft { margin-right: -3px }'
  + '[dir=rtl] .arrowLeft { margin-left: -3px }'));

test('Should respect multiline values', t => run(t,
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
  }`));

test('rtl:as: directive', t => run(t,
  ':root { --padding /* rtl:as:padding */: 1px 2px 3px 4px }',

  '[dir=ltr]:root { --padding /* rtl:as:padding */: 1px 2px 3px 4px }'
+ '[dir=rtl]:root { --padding /* rtl:as:padding */: 1px 4px 3px 2px }'));

test('should ignore ignored @import', t => run(t,
  '/* rtl:begin:ignore */'
+ `@import "${__dirname}/test-import.css";`
+ '/* rtl:end:ignore */',

  '.test-import { padding-left: 1rem }'));

test('should ignore blacklist properties', t => run(t,
  '.test {padding-left: 1rem;padding: 1rem 2rem 3rem 4rem}',

  '.test {padding: 1rem 2rem 3rem 4rem}'
  + '[dir=ltr] .test {padding-left: 1rem}'
  + '[dir=rtl] .test {padding-right: 1rem}',
  {blacklist: ['padding']}));

test('should process whitelist properties only', t => run(t,
  '.test {padding-left: 1rem;padding: 1rem 2rem 3rem 4rem}',

  '.test {padding-left: 1rem}'
+ '[dir=ltr] .test {padding: 1rem 2rem 3rem 4rem}'
+ '[dir=rtl] .test {padding: 1rem 4rem 3rem 2rem}',
  {whitelist: ['padding']}));
