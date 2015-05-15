# LD2h

Expand tags by rendering local or remote RDF resources, recursively.

To see it in action check out [http://rdf2h.github.io/ld2h/example.html](http://rdf2h.github.io/ld2h/example.html).

## Include the required scripts

    <script src="js/libs/rdf2h/rdf2h.js"></script>
    <script src="js/libs/jquery/jquery.min.js"></script>
    <script src="js/ld2h.js"></script>

## Link a matcher file

    <link rel="matchers" href="matchers-example.ttl" type="text/turtle" />

alternatively you can also define the matchers inline in a script element with id `matchers`:

        <script id="matchers" type="text/turtle">
            @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
            @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
            @prefix r2h: <http://rdf2h.github.io/2015/rdf2h#> .
            @prefix dc: <http://dublincore.org/2012/06/14/dcelements#>.
            [ a r2h:Matcher ;
                    r2h:triplePattern [    
                    r2h:subject r2h:this;
                    r2h:predicate rdfs:label;
                ];
                r2h:template [ 
                    r2h:context r2h:Default;
                    r2h:mustache '''<h1>{{rdfs:label}}</h1>
                    {{#rdfs:comment}}
                            <p>Comment: {{.}}</p>
                    {{/rdfs:comment}}'''
                ]
            ].

        </script>

To learn how to define matchers check out the rdf2h documentation: 
[http://rdf2h.github.io/rdf2h/manual.html#matchers](http://rdf2h.github.io/rdf2h/manual.html#matchers)

## Include some data

This is not needed if you only want to render <i>fetched</i> remote resources.

    <script id="data" type="text/turtle">
        @prefix s: <https://schema.org/>.
        @prefix foaf: <http://xmlns.com/foaf/0.1/> .

        <> s:headline "An LD2h demo page" .
        <> s:text '''Everything you see on this page is content expressed in RDF either within this
    page or from somewhere else on the web rendered  in the browser using 
    <a href="http://rdf2h.github.io/rdf2h">RDF2h</a> and mustache templates.'''.
    </script>

## Render resources

Wherever you want a resource from the included RDF graph to be rendered give the
tag a resource attribute and specify `render` as class. The following causes the 
whole HTML document to be replaced with the result of rendering the resource with
the URI of the page as HTML:

    <html class="render" resource="">

## Fetch resources

LD2h can retrieve RDF descriptions from the web and render the result, for 
example you can the following tag to your HTML:

    <span resource="https://www.w3.org/People/Berners-Lee/card#i" class="fetch">TimBL from remote RDF should appear here</span>
        </p>


