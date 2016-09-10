# PostCSS Rtl [![Build Status][ci-img]][ci]

[PostCSS] plugin for RTL-optimizations.

[PostCSS]: https://github.com/postcss/postcss
[ci-img]:  https://travis-ci.org/vkalinichev/postcss-rtl.svg
[ci]:      https://travis-ci.org/vkalinichev/postcss-rtl

```css
.foo {
    text-align: left;
}
```

```css
.foo {
    text-align: left;
}

[dir="rtl"] {
    text-align: right;
}
```

## Usage

```js
postcss([ require('postcss-rtl') ])
```

See [PostCSS] docs for examples for your environment.
