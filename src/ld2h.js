
var rdf = require('rdf-ext');
var RDF2h = require('rdf2h');
var LdpStore = require('rdf-store-ldp');

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
    LD2h.getMatchersGraph(function (matchers) {
        LD2h.getDataGraph(function (localData) {
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
                        LD2h.store.match(
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
                                });
                    } else {
                        console.warn("Element of class fetch without resource attribute cannot be rendered.", elem);
                    }
                    processsNextElem();
                }
                processsNextElem();
            }
            expandWithMatchers();
        });
    });
}

LD2h.getDataGraph = function(callback) {
    var matchersTtl = $("#data").text();
    rdf.parsers.parse('text/turtle', matchersTtl, null, window.location.toString().split('#')[0]).then(function (data) {
        console.log(data.toString());
        callback(data);
    });
};

LD2h.getMatchersGraph = function (callback) {
    function parse(matchersTtl) {
        rdf.parsers.parse('text/turtle',matchersTtl, null, window.location.toString().split('#')[0]).then(function (matchers) {
            console.log(matchers.toString());
            callback(matchers);
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
                            callback(matchersGraph);
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
    
};

if (typeof window !== 'undefined') {
    window.LD2h = LD2h;
}
if (typeof module !== 'undefined') {
    module.exports = LD2h;
}