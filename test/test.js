/* global describe, it */

require('es6-promise').polyfill()

var assert = require('assert')
var n3Parser = require('rdf-parser-n3')
var rdf = require('rdf-ext')
var LD2h = require('..')

rdf.parsers['text/turtle'] = n3Parser

describe('LD2h', function () {
  it('should be a function', function () {
    assert.equal(typeof LD2h, 'function')
  })

  it('.store should be a LdpStore', function () {
    assert.equal(typeof LD2h.store, 'object')
    assert.equal(typeof LD2h.store.parsers, 'object')
  })

  it('.getDataGraph should the graph data embedded in the #data element', function () {
    return LD2h.getDataGraph().then(function (graph) {
      assert.equal(graph.match(null, 'http://schema.org/headline', 'LD2h Tests').length, 1)
    })
  })
})
