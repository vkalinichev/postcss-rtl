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
