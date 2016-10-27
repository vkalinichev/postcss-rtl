# PostCSS-RTL

[![npm][npm-img]][npm]
[![Build Status][ci-img]][ci]
[![Libraries.io for GitHub][dep-img]][dep]
[![npm][npm-dwnlds-img]][npm]
[![license][lic-img]][lic]

[PostCSS]: https://github.com/postcss/postcss
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
    margin-left: 13px;
    text-align: right;
}

```
Converts to:
```css
html[dir="ltr"] .foo {
    margin-left: 13px;
    text-align: right;
}
html[dir="rtl"] .foo {
    margin-right: 13px;
    text-align: left;
}

```
This:
```css
.bar {
    float: right;
    border-color: lightgray;
    border-width: 2px 0 2px 2px;
    border-style: solid dashed solid solid;
}
```
Converts to:
```css
html[dir] .bar {
    border-color: lightgray;
}

html[dir="ltr"] .bar {
    float: right;
    border-width: 2px 0 2px 2px;
    border-style: solid dashed solid solid;
}

html[dir="rtl"] .bar {
    float: left;
    border-width: 2px 2px 2px 0;
    border-style: solid solid solid dashed;
}
```

## Usage
Just plug it to PostCSS:
```js
postcss([ require('postcss-rtl') ])
```

See [PostCSS] docs for examples for your environment.
