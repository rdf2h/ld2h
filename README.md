# LD2h [![Build Status](https://travis-ci.org/rdf2h/ld2h.svg?branch=gh-pages)](https://travis-ci.org/rdf2h/ld2h)

Expand tags by rendering local or remote RDF resources, recursively.

To see it in action check out [http://rdf2h.github.io/ld2h/latest/example.html](http://rdf2h.github.io/ld2h/latest/example.html).

## Include the required scripts

    <script src="//code.jquery.com/jquery-2.1.4.min.js"></script>
    <script src="dist/ld2h.js"></script>

The above includes the parser for `text/turtle` to support more formats you'll 
have to include the respective parsers.

## Link a matcher file

    <link rel="matchers" href="example-renderers.ttl" type="text/turtle" />

alternatively you can also define the matchers inline in a script element with id `matchers`:

        <script id="matchers" type="text/turtle">
            @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
            ....

        </script>

To learn how to define matchers check out the rdf2h documentation: 
[https://rdf2h.github.io/rdf2h-documentation/](https://rdf2h.github.io/rdf2h-documentation/)

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
    
You can also specify a context using the `context` attribute:

    <select  class="render" resource="http://schema.org/Person" context="c:options">
        <option>This will be replaced with the persons....</option>
    </select>

## Fetch resources

LD2h can retrieve RDF descriptions from the web and render the result, for 
example you can the following tag to your HTML:

    <span resource="https://www.w3.org/People/Berners-Lee/card#i" class="fetch">TimBL from remote RDF should appear here</span>
        </p>


### Fetch resource from alternative location

By default LD2h dereferences the URI of the resource to get its description, in 
some situations the RDF description should be retrieved from a different location.
This can be achieved by specifying the `graph` attribute, for example:

    <span resource="http://schema.org/BusOrCoach" 
              graph="https://raw.githubusercontent.com/schemaorg/schemaorg/sdo-deimos/data/releases/3.0/ext-auto.ttl" class="fetch">schema:BusOrCoach with data from ontology on GitHub</span>
        </p>


## Start the process

Start LD2h expansion adding the following code: 

    <script type="text/javascript">
        $(function () {
            LD2h.expand();
        });
    </script>


