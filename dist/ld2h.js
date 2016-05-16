(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],2:[function(require,module,exports){
function AbstractStore () {
}

AbstractStore.prototype.add = function () {
  throw new Error('not implemented')
}

AbstractStore.prototype.delete = function () {
  throw new Error('not implemented')
}

AbstractStore.prototype.graph = function () {
  throw new Error('not implemented')
}

AbstractStore.prototype.match = function (subject, predicate, object, iri, callback, limit) {
  var self = this

  callback = callback || function () {}

  return self.graph(iri).then(function (graph) {
    if (graph) {
      graph = graph.match(subject, predicate, object, limit)
    }

    callback(null, graph)

    return graph
  })
}

AbstractStore.prototype.merge = function (iri, graph, callback) {
  var self = this

  callback = callback || function () {}

  return self.graph(iri).then(function (existing) {
    if (existing) {
      existing.addAll(graph)
    } else {
      existing = graph
    }

    return self.add(iri, existing, callback)
  }).then(function () {
    return graph
  })
}

AbstractStore.prototype.remove = function (iri, graph, callback) {
  var self = this

  callback = callback || function () {}

  return self.graph(iri).then(function (existing) {
    if (existing) {
      return self.add(iri, existing.difference(graph))
    }
  }).then(callback)
}

AbstractStore.prototype.removeMatches = function (subject, predicate, object, iri, callback) {
  var self = this

  callback = callback || function () {}

  return self.graph(iri).then(function (existing) {
    if (existing) {
      return self.add(iri, existing.removeMatches(subject, predicate, object))
    }
  }).then(callback)
}

module.exports = AbstractStore

},{}],3:[function(require,module,exports){
var rdf = require('rdf-ext')
var inherits = require('inherits')
var AbstractStore = require('rdf-store-abstract')

function httpSuccess (statusCode) {
  return (statusCode >= 200 && statusCode < 300)
}

function LdpStore (options) {
  options = options || {}

  this.parsers = options.parsers ? new rdf.Parsers(options.parsers) : rdf.parsers
  this.serializers = options.serializers ? new rdf.Serializers(options.serializers) : rdf.serializers
  this.defaultParser = options.defaultParser || 'text/turtle'
  this.defaultSerializer = options.defaultSerializer || 'text/turtle'
  this.defaultPatchSerializer = options.defaultPatchSerializer || options.defaultSerializer || 'text/turtle'
  this.request = options.request || rdf.defaultRequest
}

inherits(LdpStore, AbstractStore)

LdpStore.prototype.add = function (iri, graph, callback, options) {
  var self = this

  return new Promise(function (resolve, reject) {
    callback = callback || function () {}
    options = options || {}

    var method = 'PUT'
    var contentType = self.defaultSerializer
    var headers = {}

    headers['Content-Type'] = contentType

    if (options.method) {
      method = options.method
    }

    if (options.etag) {
      headers['If-Match'] = options.etag
    }

    if (options.useEtag && graph.etag) {
      headers['If-Match'] = graph.etag
    }

    self.serializers.serialize(contentType, graph).then(function (data) {
      return self.request(method, iri, headers, data, null, options).then(function (res) {
        if (!httpSuccess(res.statusCode)) {
          callback('status code error: ' + res.statusCode)
          return Promise.reject('status code error: ' + res.statusCode)
        }

        callback(null, graph)
        resolve(graph)
      })
    }).catch(function (error) {
      callback(error)
      reject(error)
    })
  })
}

LdpStore.prototype.delete = function (iri, callback, options) {
  var self = this

  return new Promise(function (resolve, reject) {
    callback = callback || function () {}

    self.request('DELETE', iri, {}, null, null, options).then(function (res) {
      if (!httpSuccess(res.statusCode)) {
        callback('status code error: ' + res.statusCode)
        return Promise.reject('status code error: ' + res.statusCode)
      }

      callback()
      resolve()
    }).catch(function (error) {
      callback(error)
      reject(error)
    })
  })
}

LdpStore.prototype.graph = function (iri, callback, options) {
  var self = this

  return new Promise(function (resolve, reject) {
    callback = callback || function () {}
    options = options || {}

    self.request('GET', iri, {'Accept': self.parsers.list().join(', ')}, null, null, options).then(function (res) {
      // also test for status code != 0 for local browser requests
      if (!httpSuccess(res.statusCode) && res.statusCode !== 0) {
        callback('status code error: ' + res.statusCode)
        return Promise.reject('status code error: ' + res.statusCode)
      }

      var contentType

      if (options.contentType) {
        contentType = options.contentType
      } else {
        if ('content-type' in res.headers) {
          contentType = res.headers['content-type'].split(';')[0]
        }

        if (!contentType || !(contentType in self.parsers)) {
          contentType = self.defaultParser
        }
      }

      return self.parsers.parse(contentType, res.content, null, iri).then(function (graph) {
        // copy etag header to Graph object
        if (options.useEtag && 'etag' in res.headers) {
          graph.etag = res.headers.etag
        }

        callback(null, graph)
        resolve(graph)
      })
    }).catch(function (error) {
      callback(error)
      reject(error)
    })
  })
}

LdpStore.prototype.merge = function (iri, graph, callback, options) {
  var self = this

  return new Promise(function (resolve, reject) {
    var contentType = self.defaultPatchSerializer
    var headers = {}

    callback = callback || function () {}
    options = options || {}

    headers['Content-Type'] = contentType

    if ('etag' in options) {
      headers['If-Match'] = options.etag
    }

    if ('useEtag' in options && options.useEtag && 'etag' in graph) {
      headers['If-Match'] = graph.etag
    }

    self.serializers.serialize(contentType, graph).then(function (data) {
      return self.request('PATCH', iri, headers, data, null, options).then(function (res) {
        if (!httpSuccess(res.statusCode)) {
          callback('status code error: ' + res.statusCode)
          return Promise.reject('status code error: ' + res.statusCode)
        }

        callback(null, graph)
        resolve(graph)
      })
    }).catch(function (error) {
      callback(error)
      reject(error)
    })
  })
}

module.exports = LdpStore

},{"inherits":1,"rdf-ext":"rdf-ext","rdf-store-abstract":2}],4:[function(require,module,exports){

var rdf = require('rdf-ext');
var RDF2h = require('rdf2h');
var LdpStore = require('rdf-store-ldp/lite');

function LD2h() {
 }

LD2h.store = new LdpStore();

LD2h.expand = function() {
    function canonicalize(url) {
        //see http://stackoverflow.com/questions/470832/getting-an-absolute-url-from-a-relative-one-ie6-issue/22918332#22918332
        var div = document.createElement('div');
        div.innerHTML = "<a></a>";
        div.firstChild.href = url; // Ensures that the href is properly escaped
        div.innerHTML = div.innerHTML; // Run the current innerHTML back through the parser
        return div.firstChild.href;
    }
    return LD2h.getMatchersGraph().then(function (matchers) {
        return LD2h.getDataGraph().then(function (localData) {
            var resultPromises = new Array();
            function expandWithMatchers() {
                //Rendering with local RDF
                var elems = $(".render");
                elems.removeClass("render");
                for (var i = 0; i < elems.length; i++) {
                    var elem = $(elems[i]);
                    var context = elem.attr("context");
                    if (context) {
                        context = RDF2h.resolveCurie(context);
                    }
                    var relativeURI = elem.attr("resource");
                    if (typeof relativeURI !== 'undefined') {
                        var uri = canonicalize(relativeURI);
                        var rendered = new RDF2h(matchers).render(localData, rdf.createNamedNode(uri), context);
                        elem.html(rendered);
                        expandWithMatchers();
                    } else {
                        console.warn("Element of class render without resource attribute cannot be rendered.", elem);
                    }
                }
                //Remote resources
                var elems = $(".fetch");
                elems.removeClass("fetch");
                var currentElem = 0;
                function processsNextElem() {
                    if (currentElem >= elems.length) {
                        return;
                    }
                    var elem = $(elems[currentElem++]);
                    var context = elem.attr("context");
                    if (context) {
                        context = RDF2h.resolveCurie(context);
                    }
                    var relativeURI = elem.attr("resource");
                    if (typeof relativeURI !== 'undefined') {
                        var uri = canonicalize(relativeURI);
                        var graphUri = uri.split("#")[0];
                        resultPromises.push(LD2h.store.match(
                                null,
                                null,
                                null,
                                graphUri,
                                function (error, data) {
                                    if (!data) {
                                        console.warn("Couldn't get any triple from "+graphUri+". reason: "+error);
                                    } else {
                                        console.log("Got graph of size "+data.length+" from "+graphUri);
                                    }
                                    var rendered = new RDF2h(matchers).render(data, rdf.createNamedNode(uri), context);
                                    elem.html(rendered);
                                    expandWithMatchers();
                                }));
                    } else {
                        console.warn("Element of class fetch without resource attribute cannot be rendered.", elem);
                    }
                    processsNextElem();
                }
                processsNextElem();
            }
            expandWithMatchers();
            return Promise.all(resultPromises);
        });
    });
       
}

LD2h.getDataGraph = function() {
    return new Promise(function(resolve, reject) {
        var matchersTtl = $("#data").text();
        rdf.parsers.parse('text/turtle', matchersTtl, null, window.location.toString().split('#')[0]).then(function (data) {
            console.log(data.toString());
            resolve(data);
        });
    });
};

LD2h.getMatchersGraph = function () {
    return new Promise(function(resolve, reject) {
        function parse(matchersTtl) {
            rdf.parsers.parse('text/turtle',matchersTtl, null, window.location.toString().split('#')[0]).then(function (matchers) {
                console.log(matchers.toString());
                resolve(matchers);
            });
        }
        var matchersElem = $("#matchers");
        if (matchersElem[0]) {
            if (matchersElem.attr("src")) {
                console.warn("Using script element with src causes is not recommended, use <link rel=\"matchers\" instead");
                $.get(matchersElem.attr("src"), function (matchersTtl) {
                    parse(matchersTtl);
                });
            } else {
                var matchersTtl = matchersElem.text();
                parse(matchersTtl);
            }
        } else {
            var matcherLinks = $("link[rel='matchers']");
            if (matcherLinks.length > 0) {
                var matchersGraph = rdf.createGraph();
                var currentLink = 0;
                var processLink = function() {
                    var href = matcherLinks[currentLink++].href;
                    $.get(href, function (matchersTtl) {
                        rdf.parsers.parse('text/turtle', matchersTtl, null, window.location.toString().split('#')[0]).then(function (matchers) {
                            console.log(matchers.toString());
                            matchersGraph.addAll(matchers);
                            if (matcherLinks.length > currentLink) {
                                processLink();
                            } else {
                                resolve(matchersGraph);
                            }
                        });
                    });
                };
                processLink();
            } else {
                console.warn("No matchers could be found, specify a script element with \n\
                id matchers or link headers of type matchers");
            }
        }
    });
};

if (typeof window !== 'undefined') {
    window.LD2h = LD2h;
}
if (typeof module !== 'undefined') {
    module.exports = LD2h;
}
},{"rdf-ext":"rdf-ext","rdf-store-ldp/lite":3,"rdf2h":"rdf2h"}]},{},[4])
//# sourceMappingURL=ld2h.js.map
