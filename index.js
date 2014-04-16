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
  var ms = [];

  // need global for exec to work correctly
  match = match.global ? match : addGlobal(match);

  while ((m = match.exec(text)) != null) {
    m.offset = m.index + m[0].length;
    ms.push(m);
  }

  if (!ms.length) return parent;

  // set up the iterator
  var it = iterator(parent.firstChild, parent).select(3).revisit(false);
  var node = it.node;
  var cursor = 0;
  var range;
  var val;
  var len;
  var i;

  // walk through the nodes, marking
  // nodes at the matched text offsets.
  while (node) {
    val = node.nodeValue;
    len = val.length;

    for (i = 0, m; m = ms[i]; i++) {
      if (!m.start && len > m.index) {
        m.start = {
          node: node,
          offset: m.index
        };
      }

      // check the end
      if (!m.end && len >= m.offset) {
        m.end = {
          node: node,
          offset: m.offset
        }
      }

      // update the index and offset
      m.index -= len;
      m.offset -= len;
    }

    node = it.next();
  }

  // create ranges from the textnodes
  for (i = 0, m; m = ms[i]; i++) {
    range = document.createRange();
    range.setStart(m.start.node, m.start.offset);
    range.setEnd(m.end.node, m.end.offset);

    // cleanup match object
    delete m.index;
    delete m.offset;
    delete m.start;
    delete m.end;

    // replace with match. async or sync depending on function signature
    3 == fn.length ? fn(m, range, update) : update(fn(m, range));

    // update the range with the returned element
    function update(el) {
      if (!el) return;
      el = el.nodeType ? el : domify(el);
      range.deleteContents();
      range.insertNode(el);
    }
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
