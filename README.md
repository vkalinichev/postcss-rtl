# PostCSS-RTL

[![npm][npm-img]][npm]
[![Build Status][ci-img]][ci]
[![Libraries.io for GitHub][dep-img]][dep]
[![npm][npm-dwnlds-img]][npm]
[![license][lic-img]][lic]

[ci-img]:  https://img.shields.io/travis/vkalinichev/postcss-rtl.svg
[ci]:      https://travis-ci.org/vkalinichev/postcss-rtl

[npm-img]: https://img.shields.io/npm/v/postcss-rtl.svg
[npm]:     https://npmjs.org/package/postcss-rtl

[lic-img]: https://img.shields.io/github/license/vkalinichev/postcss-rtl.svg
[lic]:     https://github.com/vkalinichev/postcss-rtl/blob/master/License

[dep-img]: https://img.shields.io/librariesio/github/vkalinichev/postcss-rtl.svg
[dep]:     https://libraries.io/npm/postcss-rtl

[npm-dwnlds-img]: https://img.shields.io/npm/dt/postcss-rtl.svg

[PostCSS]-plugin for RTL-optimizations.

Generating RTL rules with flipped properties.
Lets you to use one file for both directions.

**Example:**

This:
```css
.foo {
    float: right;
    margin-left: 13px;
    text-align: right;
    border-color: lightgray;
    border-width: 2px 0 2px 2px;
    border-style: solid dashed solid solid;
    animation: 1s slide 0s ease-in-out
}

@keyframes slide {
    from {
        transform: translate( -1000px )
    }
    to {
        transform: translate( 0 )
    }
}
```
Will converts to:
```css
html[dir] .foo {
    border-color: lightgray;
}

html[dir="ltr"] .foo {
    float: right;
    margin-left: 13px;
    text-align: right;
    border-width: 2px 0 2px 2px;
    border-style: solid dashed solid solid;
    animation: 1s slide-ltr 0s ease-in-out
}

html[dir="rtl"] .foo {
    float: left;
    margin-right: 13px;
    text-align: left;
    border-width: 2px 2px 2px 0;
    border-style: solid solid solid dashed;
    animation: 1s slide-rtl 0s ease-in-out
}

@keyframes slide-ltr {
    from {
        transform: translate( -1000px )
    }
    to {
        transform: translate( 0 )
    }
}

@keyframes slide-rtl {
    from {
        transform: translate( 1000px )
    }
    to {
        transform: translate( 0 )
    }
}
```

## Usage
Just plug it to PostCSS:
```js
postcss([ require('postcss-rtl') ])
```

See [PostCSS] docs for examples for your environment.

## Future
- Processing [rtlcss-directives]

[PostCSS]: https://github.com/postcss/postcss
[rtlcss-directives]: http://rtlcss.com/learn/getting-started/why-rtlcss/#processing-directives
