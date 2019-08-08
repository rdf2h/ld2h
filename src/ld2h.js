var rdf = require('ext-rdflib');
var RDF2h = require('rdf2h');
var GraphNode = require("rdfgraphnode-rdfext");


function LD2h() {
}

//LD2h.store = new LdpStore();

//Needed for inserted scripts to be executed
function replaceElement(element) {
    const newElement = document.createElement(element.nodeName);
    //copy attributes (eg. src)
    for (let i = 0; i < element.attributes.length; i++) {
        newElement.setAttribute(element.attributes[i].name, element.attributes[i].value);
    }
    newElement.innerHTML = element.innerHTML;
    element.parentNode.insertBefore(newElement, element);
    element.remove();
}

function insertHTML(node, htmlString) {
    node.innerHTML = "";
    //innerHTML should work if no scripts are included
    if (!/<script/i.test(htmlString)) {
        try {
            node.innerHTML = htmlString;
        }
        //fail silently and try elaborated method below
        catch (e) {}
    }
    //if innerHTML failed or wasn't executed
    if (node.innerHTML === "") {
        const tmp = document.createElement(node.nodeName);
        tmp.innerHTML = htmlString;
        if (tmp.hasChildNodes()) {
            scripts = tmp.getElementsByTagName("script");
            if (scripts.length > 0) {
                scripts = Array.from(scripts)
                for (let i = 0; i < scripts.length; i++) {
                    replaceElement(scripts[i]);
                }
            }
            //tmp.firstChild is live, so this will move all children
            while (tmp.firstChild) {
                console.log(tmp.firstChild)
                node.appendChild(tmp.firstChild);
            }
        } else {
            console.log("no children");
        }
    }
}

function setHtmlContent(node, content) {
    if (node.nodeName === "HTML") {
        let tmp = document.createElement("html");
        tmp.innerHTML = content;
        let head = tmp.getElementsByTagName("head")[0].innerHTML;
        let body = tmp.getElementsByTagName("body")[0].innerHTML;
        insertHTML(node.getElementsByTagName("head")[0], head);
        insertHTML(node.getElementsByTagName("body")[0], body);
    } else {
        node.innerHTML = content;
    }
}

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
                let renderElems = document.getElementsByClassName("render");
                for (var i = 0; i < renderElems.length; i++) {
                    let elem = renderElems[i];
                    elem.classList.remove("render");
                    var context = elem.getAttribute("context")
                    if (context) {
                        context = RDF2h.resolveCurie(context);
                    }
                    var relativeURI = elem.getAttribute("resource");
                    if (typeof relativeURI !== 'undefined') {
                        var uri = canonicalize(relativeURI);
                        var rendered = new RDF2h(renderers).render(localData, rdf.sym(uri), context);
                        setHtmlContent(elem, rendered);
                        resultPromises.push(expandWithRenderers());
                    } else {
                        console.warn("Element of class render without resource attribute cannot be rendered.", elem);
                    }
                }
                //Remote resources
                let fetchElems = document.getElementsByClassName("fetch");
                for (var i = 0; i < fetchElems.length; i++) {
                    let elem = fetchElems[i];
                    elem.classList.remove("fetch")
                    var context = elem.getAttribute("context");
                    if (context) {
                        context = RDF2h.resolveCurie(context);
                    }
                    var relativeURI = elem.getAttribute("resource");
                    if ((relativeURI !== null) && (typeof relativeURI !== 'undefined')) {
                        var uri = canonicalize(relativeURI);
                        var relativeGraphURI = elem.getAttribute("graph");
                        var graphUri;
                        if (relativeGraphURI) { //empty strings are ignored
                            graphUri = canonicalize(relativeGraphURI);
                        } else {
                            graphUri = uri.split("#")[0];
                        }
                        GraphNode.rdfFetch(graphUri).catch(function(error) {
                                        console.warn("Error retrieving "+graphUri+": "+error);
                                    }).then(function(response) {
                                        return response.graph().then(
                                            data =>  {
                                                console.log("Got graph of size "+data.length+" from "+graphUri);
                                                var rendered = new RDF2h(renderers).render(data, rdf.sym(uri), context);
                                                setHtmlContent(elem, rendered);
                                                return expandWithRenderers();
                                            }
                                        );
                                }).catch(function(error) {
                                    console.warn("Error rendering "+graphUri+": "+error);
                                    if (error.stack) {
                                        console.warn(error.stack);
                                    }
                                });
                    } else {
                        console.warn("Element of class fetch without resource attribute cannot be rendered.", elem);
                    }
                }
                return Promise.all(resultPromises);
            }
            return expandWithRenderers();     
        });
    });
       
}

LD2h.getDataGraph = function() {
    return new Promise(function(resolve, reject) {
        let dataElem  = document.getElementById("data");
        if (dataElem) {
            let serializedRDF = dataElem.tagName == "SCRIPT" ? dataElem.innerHTML : dataElem.outerHTML;
            let serializationFormat = dataElem.getAttribute("type");
            if (!serializationFormat) {
                serializationFormat = dataElem.tagName == "SCRIPT" ? "applictaion/ld+json" : "text/html";
            }
            var data = rdf.graph();
            rdf.parse(serializedRDF, data, window.location.toString().split('#')[0], serializationFormat, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        } else {
            resolve(rdf.graph());
        }
    });
};

LD2h.getRenderersGraph = function () {
    return new Promise(function(resolve, reject) {
        function parse(serializedRDF, serializationFormat) {
            var graph = rdf.graph();
            if (!serializationFormat) {
                serializationFormat = 'text/turtle';
            }
            rdf.parse(serializedRDF, graph, window.location.toString().split('#')[0], serializationFormat, () => resolve(graph));
        }
        let renderersElem = document.getElementById("renderers");
        if (renderersElem) {
            let src = renderersElem.getAttribute("src")
            if (src) {
                console.warn('Using script element with src causes is not recommended, use <link rel="renderers" instead');
                fetch(src,
                    {headers: {
                        "Accept": "text/turtle",
                    }})
                    .then(r => {
                        if (r.ok) {
                            return r.text();
                        }
                        throw new Error(src + " responded with " + r.status);
                    })
                    .then(j => {
                        parse(j);
                    })
                    .catch(e => console.error(e));
            } else {
                var serializedRDF = renderersElem.innerHTML;
                parse(serializedRDF, renderersElem.getAttribute("type"));
            }
        } else {
            let rendererLinks = document.querySelectorAll("link[rel='renderers']");
            console.log(rendererLinks);
            if (rendererLinks.length > 0) {
                let graphPromises = new Array();
                for (let i = 0; i < rendererLinks.length; i++) {
                    var href = rendererLinks[i].href.split('#')[0];
                    graphPromises.push(GraphNode.rdfFetch(href).then(r => r.graph()));
                }

                resolve(Promise.all(graphPromises));
                
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