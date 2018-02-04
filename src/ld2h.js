
var rdf = require('rdflib');
var RDF2h = require('rdf2h');
var GraphNode = require("rdfgraphnode");


function LD2h() {
}

//LD2h.store = new LdpStore();

LD2h.expand = function() {
    function canonicalize(url) {
        //see http://stackoverflow.com/questions/470832/getting-an-absolute-url-from-a-relative-one-ie6-issue/22918332#22918332
        var div = document.createElement('div');
        div.innerHTML = "<a></a>";
        div.firstChild.href = url; // Ensures that the href is properly escaped
        div.innerHTML = div.innerHTML; // Run the current innerHTML back through the parser
        return div.firstChild.href;
    }
    return LD2h.getRenderersGraph().then(function (renderers) {
        return LD2h.getDataGraph().then(function (localData) {       
            function expandWithRenderers() {
                var resultPromises = new Array();
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
                        var rendered = new RDF2h(renderers).render(localData, rdf.sym(uri), context);
                        elem.html(rendered);
                        resultPromises.push(expandWithRenderers());
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
                        var relativeGraphURI = elem.attr("graph");
                        var graphUri;
                        if (typeof relativeGraphURI !== 'undefined') {
                            graphUri = canonicalize(relativeGraphURI);
                        } else {
                            graphUri = uri.split("#")[0];
                        }
                        GraphNode.rdfFetch(graphUri).catch(function(error) {
                                        console.warn("Error retrieving "+graphUri+": "+error);
                                    }).then(function(response) {
                                        let data = response.graph;
                                    if (!data) {
                                        
                                    } else {
                                        console.log("Got graph of size "+data.length+" from "+graphUri);
                                    }
                                    var rendered = new RDF2h(renderers).render(data, rdf.sym(uri), context);
                                    elem.html(rendered);
                                    return expandWithRenderers();
                                }).catch(function(error) {
                                    console.warn("Error rendering "+graphUri+": "+error);
                                    if (error.stack) {
                                        console.warn(error.stack);
                                    }
                                });
                    } else {
                        console.warn("Element of class fetch without resource attribute cannot be rendered.", elem);
                    }
                    processsNextElem();
                }
                processsNextElem();
                return Promise.all(resultPromises);
            }
            return expandWithRenderers();     
        });
    });
       
}

LD2h.getDataGraph = function() {
    return new Promise(function(resolve, reject) {
        var dataElem  = $("#data")
        var serializedRDF = dataElem.text();
        var serializationFormat = dataElem.attr("type");
        var data = rdf.graph();
        rdf.parse(serializedRDF, data, window.location.toString().split('#')[0], serializationFormat);
        console.log(data.toString());
        resolve(data);
    });
};

LD2h.getRenderersGraph = function () {
    return new Promise(function(resolve, reject) {
        function parse(serializedRDF, serializationFormat) {
            var graph = rdf.graph();
            if (!serializationFormat) {
                serializationFormat = 'text/turtle';
            }
            rdf.parse(serializedRDF, graph, window.location.toString().split('#')[0], serializationFormat);
            resolve(graph);
        }
        var renderersElem = $("#renderers");
        if (renderersElem[0]) {
            if (renderersElem.attr("src")) {
                console.warn("Using script element with src causes is not recommended, use <link rel=\"renderers\" instead");
                $.get(renderersElem.attr("src"), function (renderersTtl) {
                    parse(renderersTtl);
                });
            } else {
                var serializedRDF = renderersElem.text();
                parse(serializedRDF, renderersElem.attr("type"));
            }
        } else {
            var rendererLinks = $("link[rel='renderers']");
            if (rendererLinks.length > 0) {
                var renderersGraph = rdf.graph();
                var currentLink = 0;
                var processLink = function() {
                    var href = rendererLinks[currentLink++].href;
                    $.get(href, function (renderersTtl) {
                        rdf.parse(renderersTtl, renderersGraph, href, 'text/turtle');    
                        if (rendererLinks.length > currentLink) {
                            processLink();
                        } else {
                            resolve(renderersGraph);
                        }
                    });
                };
                processLink();
            } else {
                console.warn("No renderers could be found, specify a script element with \n\
                id renderers or link headers of type renderers");
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