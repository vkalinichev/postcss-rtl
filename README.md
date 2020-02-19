# PostCSS-RTL

[![npm][npm-img]][npm]
[![Build Status][ci-img]][ci]
[![npm][npm-dwnlds-img]][npm]
[![Package Quality][quality-img]][quality]
[![license][lic-img]][lic]

[ci-img]:  https://img.shields.io/travis/vkalinichev/postcss-rtl.svg
[ci]:      https://travis-ci.org/vkalinichev/postcss-rtl

[npm-img]: https://img.shields.io/npm/v/postcss-rtl.svg
[npm]:     https://npmjs.org/package/postcss-rtl

[quality-img]: http://npm.packagequality.com/shield/postcss-rtl.svg
[quality]: http://packagequality.com/#?package=postcss-rtl

[lic-img]: https://img.shields.io/github/license/vkalinichev/postcss-rtl.svg
[lic]:     https://github.com/vkalinichev/postcss-rtl/blob/master/License

[npm-dwnlds-img]: https://img.shields.io/npm/dt/postcss-rtl.svg

[PostCSS]-plugin for RTL-adaptivity

Generates RTL rules with flipped properties.
Use one file for both directions!

* [Examples](#examples)
    * [Simple properties](#simple-properties)
    * [Animations](#animations)
    * [Value directives](#value-directives)
    * [Property directives](#property-directives)
    * [Ignoring specific declarations](#ignoring-specific-declarations)
* [Usage](#usage)
    * [With Webpack](#with-webpack)
    * [With Gulp](#with-gulp)
    * [Options](#options)
* [Thanks](#thanks)

## Examples

### Simple properties

In most cases all you need is flip property name or value
from `left` to `right` or change values order in full-valued shorthand
from `top-right-bottom-left` to `top-left-bottom-right`.

LTR input:
```css
.foo {
    float: right;
    margin-left: 13px;
    text-align: right;
    font-size: 13px;
    border-color: lightgray;
    border-width: 2px 0 2px 2px;
    border-style: solid dashed solid solid
}

.foo {
    text-align: center;
}
```

LTR+RTL output:
```css
.foo {
    font-size: 13px
}

[dir] .foo {
    border-color: lightgray
}

[dir="ltr"] .foo {
    float: right;
    margin-left: 13px;
    text-align: right;
    border-width: 2px 0 2px 2px;
    border-style: solid dashed solid solid
}

[dir="rtl"] .foo {
    float: left;
    margin-right: 13px;
    text-align: left;
    border-width: 2px 2px 2px 0;
    border-style: solid solid solid dashed
}

[dir] .foo {
    text-align: center
}
```

### Animations
Flippable keyframes-animations will be splitted to two
direction-based rules with `-ltr` or `-rtl` suffixes

LTR input:
```css
.foo {
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

LTR+RTL output:
```css
[dir="ltr"] .foo {
    animation: 1s slide-ltr 0s ease-in-out
}

[dir="rtl"] .foo {
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

### Value directives

To transform declaration values use value directives:

* `/* rtl:prepend:{value} */` - to prepend the {value} before the current value
* `/* rtl:append:{value} */` - to append the {value} after the current value
* `/* rtl:{value} */` - to replace the current value with the supplied value

**Source**

```css
.foo {
    font-weight: bold;
    font-family: "Droid Sans", "Helvetica Neue", Arial, sans-serif/*rtl:prepend:"Droid Arabic Kufi",*/;
    transform: rotate(45deg)/* rtl:append: scaleX(-1) */;
    flex-direction: row/* rtl: row-reverse */;
}
```

**Result**

```css
.foo {
    font-weight: bold;
}

[dir=ltr] .foo {
    font-family: "Droid Sans", "Helvetica Neue", Arial, sans-serif/*rtl:prepend:"Droid Arabic Kufi",*/;
    transform: rotate(45deg)/* rtl:append: scaleX(-1) */;
    flex-direction: row/* rtl: row-reverse */;
}

[dir=rtl] .foo {
    font-family: "Droid Arabic Kufi", "Droid Sans", "Helvetica Neue", Arial, sans-serif;
    transform: rotate(45deg) scaleX(-1);
    flex-direction: row-reverse;
}
```

### Property directives

To transform declaration property name use property directives:

* `/* rtl:as:{prop} */` - to process the property as {prop}. Usable for custom properties

**Source**

```css
:root {
    --padding /* rtl:as:padding */: 1rem 2rem 3rem 4rem;
}
```

**Result**

```css
[dir=ltr]:root {
    --padding /* rtl:as:padding */: 1rem 2rem 3rem 4rem;
}

[dir=rtl]:root {
    --padding /* rtl:as:padding */: 1rem 4rem 3rem 2rem;
}
```

### Ignoring specific declarations
To skip flipping specific declarations use some of supported directives:

* `/* rtl:ignore */` - to ignore the following rule *or* the containing declaration
* `/* rtl:begin:ignore */` and `/* rtl:end:ignore */` - to ignore rules within scope

Ignore one rule:
```css
/* rtl:ignore */
.foo {
    padding-left: 0
}
```

Block-syntax to ignore rules within scope:
```css
/* rtl:begin:ignore */
.foo {
    padding-left: 0
}
.bar {
    direction: ltr
}
/* rtl:end:ignore */
```

Value-syntax to ignore a single CSS declaration:
```css
.foo {
    margin-left: 20px;
    padding-right: 20px /* rtl:ignore */;
}
```

`/*!` notation will work too:
```css
/*! rtl:ignore */
.foo {
    padding-left: 0
}
```

## Usage
1. Plug it to PostCSS

    ```js
    const postcss = require('postcss')
    const rtl = require('postcss-rtl')

    postcss([ rtl( options ) ])
    ```

    See [PostCSS] docs for examples for your environment.

2. Manage direction by switching between `dir="ltr"` and `dir="rtl"` on `<html>` element.

### With Webpack:
```js
module.exports = {
  module: {
    rules: [ {
      test: /\.css$/,
      use: [
        { loader: 'style-loader' },
        { loader: 'css-loader' },
        { loader: 'postcss-loader',
          options: {
            plugins: function () {
              return [ require( 'postcss-rtl' )( options ) ]
            }
          }
        }
      ]
    } ]
  }
}
```

### With Gulp:
```js
gulp.src( 'style.css' )
    .pipe( postcss( [ rtl( options ) ]) )
    .pipe( gulp.dest( './dest' ) )
```

### Options
* `addPrefixToSelector`: Custom function for adding prefix to selector. Optional.
    Example:
    ```js
    function addPrefixToSelector ( selector, prefix ) {
        return `${prefix} > ${selector}` // Make selectors like [dir=rtl] > .selector
    }
    ```
  **note:** the returned string _must_ include `prefix` to avoid an infinite recursion

* `onlyDirection`: generate only one-direction version: `ltr` or `rtl`

* `prefixType`: Switches between adding attributes and classes. Optional:
    * `attribute` (by default, recommended): `.foo` => `[dir=rtl] .foo`
    * `class` (useful for IE6): `.foo` => `.dir-rtl .foo`

* `prefix`: Uses a custom string, instead of 'dir', for the added attribute and class selectors
    * e.g. `'data-my-custom-dir'` (for attribute prefixType): `.foo` => `[data-my-custom-dir=rtl] .foo`
    * e.g. `'my-custom-dir'` (for class prefixType): `.foo` => `.my-custom-dir-rtl .foo`

* `removeComments` (default: `true`): remove `rtl:*` comments after process them

* `fromRTL` (default: `false`): assume all styles are written in RTL direction and generate corresponding LTR styles for them

* `blacklist`: the array of css properties which processing will be ignored
    Example:
    ```js
    ['padding-left', 'padding-right']
    ```
* `whitelist`: the array of css properties which (and only them) will be processed
    Example:
    ```js
    ['margin', 'border-color']
    ```
## Thanks
Great thanks to projects:
* [PostCSS][PostCSS]
* [RTLCSS][RTLCSS]

[PostCSS]: https://github.com/postcss/postcss
[RTLCSS]: https://github.com/MohammadYounes/rtlcss
[rtlcss-directives]: http://rtlcss.com/learn/getting-started/why-rtlcss/#processing-directives
