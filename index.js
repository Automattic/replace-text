/**
 * Module dependencies
 */

var domify = require('domify');
var iterator = require('dom-iterator');

/**
 * Export `replace`
 */

module.exports = replace;

/**
 * Initialize `replace`
 *
 * @param {Element} parent
 * @param {String|Regex} match
 * @param {String|Element|Function} fn
 */

function replace(parent, match, fn) {
  match = match.source ? match : new RegExp('\\b' + match + '\\b', 'gi');
  fn = 'function' == typeof fn ? fn : wrap(fn);
  var text = parent.textContent;

  // need global for exec to work correctly
  match = match.global ? match : addGlobal(match);

  while ((m = match.exec(text)) != null) {
    var index = m.index;
    var offset = m.index + m[0].length;
    var it = iterator(parent.firstChild, parent).select(3).revisit(false);
    var node = it.node;
    var start = {};
    var end = {};
    var val, len;

    while (node) {
      val = node.nodeValue;
      len = val.length;

      if (!start.node && len > index) {
        start.node = node;
        start.offset = index;
      }

      if (!end.node && len >= offset) {
        end.node = node;
        end.offset = offset;
      }

      index -= len;
      offset -= len;
      node = it.next();
    }

    // create the range from the start and end offsets
    var range = document.createRange();
    range.setStart(start.node, start.offset);
    range.setEnd(end.node, end.offset);
    
    // replace with match. async or sync depending on function signature
    3 == fn.length ? fn(m, range, update) : update(fn(m, range));

    // update the range with the returned element
    function update(el) {
      if (!el) return;
      el = el.nodeType ? el : domify(el);
      range.deleteContents();
      range.insertNode(el);
    }

    // update the text
    text = parent.textContent;
  }

  return parent;
}

/**
 * Wrap a string in a function
 *
 * @param {String} str
 * @return {Function} fn
 * @api private
 */

function wrap(str) {
  return function() {
    return str;
  }
}

/**
 * Add global
 *
 * @param {RegExp} regex
 * @return {RegExp}
 * @api private
 */

function addGlobal(regex) {
  var flags = 'g';
  flags += regex.ignoreCase ? 'i' : '';
  flags += regex.multiline ? 'm' : '';
  flags += regex.extended ? 'x' : '';
  flags += regex.sticky ? 'y' : '';
  return new RegExp(regex.source, flags);
}
