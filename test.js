import postcss from 'postcss';
import test    from 'ava';

import plugin from './';

function run(t, input, output, opts = { }) {
    return postcss([ plugin(opts) ]).process(input)
        .then( result => {
            t.deepEqual(result.css, output);
            t.deepEqual(result.warnings().length, 0);
        });
}

test('Creating RTL rule for text-align: left', t => {
    return run(t,
        'a { text-align: left }',
        'a { text-align: left }\n' +
        '[dir="rtl"] a { text-align: right }',
    { });
});

test('Creating RTL rule for text-align: right', t => {
    return run(t,
        'a { text-align: right }',
        'a { text-align: right }\n' +
        '[dir="rtl"] a { text-align: left }',
    { });
});


test('Creating RTL rule for float: left', t => {
    return run(t,
        'a { float: left }',
        'a { float: left }\n' +
        '[dir="rtl"] a { float: right }',
    { });
});

test('Creating RTL rule for float: right', t => {
    return run(t,
        'a { float: right }',
        'a { float: right }\n' +
        '[dir="rtl"] a { float: left }',
    { });
});

test('Creating RTL rule for full margin', t => {
    return run(t,
        'a { margin: 13px 7px 6px 2px }',
        'a { margin: 13px 7px 6px 2px }\n' +
        '[dir="rtl"] a { margin: 13px 2px 6px 7px }',
    { });
});

test('Creating RTL rule for full padding', t => {
    return run(t,
        'a { padding: 0 7px 2em 2rem }',
        'a { padding: 0 7px 2em 2rem }\n' +
        '[dir="rtl"] a { padding: 0 2rem 2em 7px }',
    { });
});

test('Creating RTL rule for border-width', t => {
    return run(t,
        'a { padding: 1px 1px 1px 0 }',
        'a { padding: 1px 1px 1px 0 }\n' +
        '[dir="rtl"] a { padding: 1px 0 1px 1px }',
    { });
});

test('Creating RTL rule for border-style', t => {
    return run(t,
        'a { padding: solid solid solid dotted }',
        'a { padding: solid solid solid dotted }\n' +
        '[dir="rtl"] a { padding: solid dotted solid solid }',
    { });
});
