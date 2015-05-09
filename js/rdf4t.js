"use strict";

function RDF4t() {
}

RDF4t.expand = function() {
    function canonicalize(url) {
        //see http://stackoverflow.com/questions/470832/getting-an-absolute-url-from-a-relative-one-ie6-issue/22918332#22918332
        var div = document.createElement('div');
        div.innerHTML = "<a></a>";
        div.firstChild.href = url; // Ensures that the href is properly escaped
        div.innerHTML = div.innerHTML; // Run the current innerHTML back through the parser
        return div.firstChild.href;
    }
    RDF4t.getMatchersGraph(function (matchers) {
        function expandWithMatchers() {
            //Rendering with local RDF
            RDF4t.getDataGraph(function (data) {
                var elems = $(".render");
                elems.removeClass("render");
                for (var i = 0; i < elems.length; i++) {
                    var elem = $(elems[i]);
                    var relativeURI = elem.attr("resource");
                    if (typeof relativeURI !== 'undefined') {
                        var uri = canonicalize(relativeURI);
                        var rendered = new RDF2h(matchers).render(data, rdf.createNamedNode(uri));
                        elem.html(rendered);
                        expandWithMatchers();
                    } else {
                        console.warn("Element of class render without resource attribute cannot be rendered.", elem);
                    }
                }
            });
            //Remote resources
            var elems = $(".fetch");
            elems.removeClass("fetch");
            for (var i = 0; i < elems.length; i++) {
                var elem = $(elems[i]);
                var relativeURI = elem.attr("resource");
                if (typeof relativeURI !== 'undefined') {
                    var uri = canonicalize(relativeURI);
                    var store = new rdf.LdpStore();
                    store.match(
                            uri.split("#")[0],
                            null,
                            null,
                            null,
                            function (data) {
                                var rendered = new RDF2h(matchers).render(data, rdf.createNamedNode(uri));
                                elem.html(rendered);
                            });
                    expandWithMatchers();
                } else {
                    console.warn("Element of class fetch without resource attribute cannot be rendered.", elem);
                }
            }
        }
        expandWithMatchers();
    });
}

RDF4t.getDataGraph = function(callback) {
    var matchersTtl = $("#data").text();
    rdf.parseTurtle(matchersTtl, function (data) {
        console.log(data.toString());
        callback(data);
    }, window.location.toString());
}

RDF4t.getMatchersGraph = function(callback) {
    var matchersTtl = $("#matchers").text();
    rdf.parseTurtle(matchersTtl, function (matchers) {
        console.log(matchers.toString());
        callback(matchers);
    }, window.location.toString());
}