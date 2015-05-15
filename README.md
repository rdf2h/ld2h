# LD2h

Expand tags by rendering local or remote RDF resources, recursively.

To see it in action check out [http://rdf2h.github.io/ld2h/example.html](http://rdf2h.github.io/ld2h/example.html).

## Include the required scripts

    &lt;script src="js/libs/rdf2h/rdf2h.js">&lt;/script>
    &lt;script src="js/libs/jquery/jquery.min.js">&lt;/script>
    &lt;script src="js/ld2h.js">&lt;/script>

## Link a matcher file

    &lt;link rel="matchers" href="matchers-example.ttl" type="text/turtle" />

alternatively you can also define the matchers inline in a script element with id `matchers`:

        &lt;script id="matchers" type="text/turtle">
            @prefix rdf: &lt;http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
            @prefix rdfs: &lt;http://www.w3.org/2000/01/rdf-schema#> .
            @prefix r2h: &lt;http://rdf2h.github.io/2015/rdf2h#> .
            @prefix dc: &lt;http://dublincore.org/2012/06/14/dcelements#>.
            [ a r2h:Matcher ;
                    r2h:triplePattern [    
                    r2h:subject r2h:this;
                    r2h:predicate rdfs:label;
                ];
                r2h:template [ 
                    r2h:context r2h:Default;
                    r2h:mustache '''&lt;h1>{{rdfs:label}}&lt;/h1>
                    {{#rdfs:comment}}
                            &lt;p>Comment: {{.}}&lt;/p>
                    {{/rdfs:comment}}'''
                ]
            ].

        &lt;/script>

To learn how to define matchers check out the rdf2h documentation: 
[http://rdf2h.github.io/rdf2h/manual.html#matchers](http://rdf2h.github.io/rdf2h/manual.html#matchers)

## Include some data

This is not needed if you only want to render &lt;i>fetched&lt;/i> remote resources.

    &lt;script id="data" type="text/turtle">
        @prefix s: &lt;https://schema.org/>.
        @prefix foaf: &lt;http://xmlns.com/foaf/0.1/> .

        &lt;> s:headline "An LD2h demo page" .
        &lt;> s:text '''Everything you see on this page is content expressed in RDF either within this
    page or from somewhere else on the web rendered  in the browser using 
    &lt;a href="http://rdf2h.github.io/rdf2h">RDF2h&lt;/a> and mustache templates.'''.
    &lt;/script>

## Render resources

Wherever you want a resource from the included RDF graph to be rendered give the
tag a resource attribute and specify `render` as class. The following causes the 
whole HTML document to be replaced with the result of rendering the resource with
the URI of the page as HTML:

    &lt;html class="render" resource="">

## Fetch resources

LD2h can retrieve RDF descriptions from the web and render the result, for 
example you can the following tag to your HTML:

    &lt;span resource="https://www.w3.org/People/Berners-Lee/card#i" class="fetch">TimBL from remote RDF should appear here&lt;/span>
        &lt;/p>


