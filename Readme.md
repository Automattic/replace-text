
# replace-text

  Replace text within an element with another element. Handles all the DOM manipulations.

## Installation

  Install with [component(1)](http://component.io):

    $ component install automattic/replace-text

## Examples

### Replace text:

```js
var p = document.createElement('p');
p.innerHTML = 'Not <u>all</u> that glitters is gold';
replace(p, 'all', 'ALL')
p.innerHTML // Not <u>ALL</u> that glitters is gold
```

### Preserve HTML:

```js
var p = document.createElement('p');
p.innerHTML = 'Not <u>all</u> those who <mark>wan</mark>der are lost';
replace(p, 'wander', function(m, range) {
  var u = document.createElement('u');
  u.appendChild(range.cloneContents());
  return u;
});
p.innerHTML // Not <u>all</u> those who <u><mark>wan</mark>der</u> are lost
```

### Autolink:

```js
var p = document.createElement('p');
var rurl = /https?:\/\/(\w+\.(?:com?|org|net))/;
p.innerHTML = 'Welcome to <mark>http://automattic.com!</mark>';

replace(p, rurl, function(m) {
  var a = document.createElement('a');
  a.href = m[0];
  a.textContent = m[1];
  return a;
});
p.innerHTML // Welcome to <mark><a href="http://automattic.com">automattic.com</a>!</mark>
```

## API

### `replace(el, match, replacement)`

Replace all occurences of `match` in `el` with `replacement`. `match` may be a `string` or a `regexp`. Replacement may be a `string`, `element`, or `function`.

If you pass a function as the replacement, the signature is as follows: replacement(match, range, [fn])`. `replace-text` uses the return value of the function to do the replacement. The return value can be an element or string.

If you include the `fn` in the replacement function's signature, the replacement is considered asynchronous. Here's an example:

```js
var city = 'Stockholm, Sweden';
replace(p, city, function(m, range, fn) {
  var temperature = getWeather(m[0], function(err, temp) {
    if (err) return fn();
    fn(city + ':' + temp + '˚');
  })
});
```

## License

  The MIT License (MIT)

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
