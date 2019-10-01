var ld2h=function(e){var t={};function r(n){if(t[n])return t[n].exports;var o=t[n]={i:n,l:!1,exports:{}};return e[n].call(o.exports,o,o.exports,r),o.l=!0,o.exports}return r.m=e,r.c=t,r.d=function(e,t,n){r.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},r.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r.t=function(e,t){if(1&t&&(e=r(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)r.d(n,o,function(t){return e[t]}.bind(null,o));return n},r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(t,"a",t),t},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p="",r(r.s=2)}([function(e,t){e.exports=$rdf},function(e,t,r){var n=r(0),o=r(5);let i=(e=>e||window.Headers)(o.Headers);function s(){return new s.Impl(...arguments)}s.Impl=class{constructor(e,t,r){this._graph=t,Array.isArray(e)?this.nodes=e:this.nodes=[e],this.sources=r}get graph(){if(!this._graph)throw Error("Operation not possible as no Graph is available, try fetching first");return this._graph}get node(){if(1!==this.nodes.length)throw Error("Operation not possible as this GraphNode is underdetermined");return this.nodes[0]}get termType(){return this.node.termType}get value(){return this.node.value}fetch(){if("NamedNode"!==this.termType||this.sources&&this.sources.indexOf(this.value.split("#")[0])>-1)return Promise.resolve(this);var e=this.value.split("#")[0];return s.rdfFetch(e).then(e=>e.graph()).then(t=>s(this.node,t,[e]))}each(e){var t=this.nodes.map(t=>e(s([t],this.graph,this.sources)));return Promise.all(t)}fetchEach(e){var t=this.nodes.map(t=>s([t],this.graph,this.sources).fetch().then(e));return Promise.all(t)}split(){return this.nodes.map(e=>s([e],this.graph,this.sources))}out(e){return s(this.graph.each(this.node,e),this.graph,this.sources)}in(e){return s(this.graph.statementsMatching(void 0,e,this.node).map(e=>e.subject),this.graph,this.sources)}},s.rdfFetch=function(e,t,r){var s=this;return function(e,t={}){return t.headers||(t.headers=new i),t.headers.get("Accept")||t.headers.set("Accept","text/turtle;q=1, application/n-triples;q=.9, application/rdf+xml;q=.8, application/ld+json;q=.7, */*;q=.1"),o(e,t).then(t=>t.ok?(t.graph=(()=>new Promise((r,o)=>{let i=n.graph(),s=t.headers.get("Content-type").split(";")[0];return t.text().then(t=>{n.parse(t,i,e,s,(e,t)=>{e?o(e):r(t)})})})),t):t)}(e,t).then(function(n){return n.status<300?n:r&&401===n.status?(console.log("Got 401 response, attempting to login"),r().then(function(){return s.rdfFetch(e,t)})):n})},e.exports=s},function(e,t,r){"use strict";var n=r(3),o=r(0),i=r(4),s=r(1);function a(){}function u(e,t){if("HTML"===e[0].nodeName){var r=document.createElement("html");r.innerHTML=t;var n=r.getElementsByTagName("head")[0].innerHTML,o=r.getElementsByTagName("body")[0].innerHTML;e.find("head").html(n),e.find("body").html(o)}else e.html(t)}a.expand=function(){function e(e){var t=document.createElement("div");return t.innerHTML="<a></a>",t.firstChild.href=e,t.innerHTML=t.innerHTML,t.firstChild.href}return a.getRenderersGraph().then(function(t){return a.getDataGraph().then(function(r){return function a(){var h,c=new Array;(h=n(".render")).removeClass("render");for(var l=0;l<h.length;l++){var f=n(h[l]),p=f.attr("context");p&&(p=i.resolveCurie(p));var d=f.attr("resource");if(void 0!==d){var g=e(d);u(f,new i(t).render(r,o.sym(g),p)),c.push(a())}else console.warn("Element of class render without resource attribute cannot be rendered.",f)}(h=n(".fetch")).removeClass("fetch");var v=0;return function r(){if(!(v>=h.length)){var c=n(h[v++]),l=c.attr("context");l&&(l=i.resolveCurie(l));var f=c.attr("resource");if(void 0!==f){var p,d=e(f),g=c.attr("graph");p=void 0!==g?e(g):d.split("#")[0],s.rdfFetch(p).catch(function(e){console.warn("Error retrieving "+p+": "+e)}).then(function(e){return e.graph().then(function(e){console.log("Got graph of size "+e.length+" from "+p);var r=new i(t).render(e,o.sym(d),l);return u(c,r),a()})}).catch(function(e){console.warn("Error rendering "+p+": "+e),e.stack&&console.warn(e.stack)})}else console.warn("Element of class fetch without resource attribute cannot be rendered.",c);r()}}(),Promise.all(c)}()})})},a.getDataGraph=function(){return new Promise(function(e,t){var r=n("#data"),i="SCRIPT"==r[0].tagName?r.text():r[0].outerHTML,s=r.attr("type");s||(s="SCRIPT"==r[0].tagName?"applictaion/ld+json":"text/html");var a=o.graph();o.parse(i,a,window.location.toString().split("#")[0],s,function(r,n){r?t(r):e(n)})})},a.getRenderersGraph=function(){return new Promise(function(e,t){function r(t,r){var n=o.graph();r||(r="text/turtle"),o.parse(t,n,window.location.toString().split("#")[0],r,function(){return e(n)})}var i=n("#renderers");if(i[0]){if(i.attr("src"))console.warn('Using script element with src causes is not recommended, use <link rel="renderers" instead'),n.get(i.attr("src"),function(e){r(e)});else r(i.text(),i.attr("type"))}else{var a=n("link[rel='renderers']");if(a.length>0){for(var u=new Array,h=0;h<a.length;h++){var c=a[h].href.split("#")[0];u.push(s.rdfFetch(c).then(function(e){return e.graph()}))}e(Promise.all(u))}else console.warn("No renderers could be found, specify a script element with \n                id renderers or link headers of type renderers")}})},"undefined"!=typeof window&&(window.LD2h=a),e.exports=a},function(e,t){e.exports=$},function(e,t,r){var n=r(0),o=r(1),i=r(6),s=r(7);new Array;function a(e,t){Array.isArray(e)||(e=[e]),this.tbox=t||e[0],this.rendererGraphs=e.reverse(),this.env={}}!function(){s.rdf2h;var e=i.Context.prototype.lookup;i.Context.prototype.lookup=function(t){if(this.view instanceof a.Renderee){var r=this.view.rdf2h,i=this.view.graphNode,s=i.graph,u=this.view.context;function h(e){var t=function(e){let t=[],r=!1,n=!1,o="";function i(){o.length>0&&(t.push(o),o="")}for(var s=0;s<e.length;s++){let t=e[s];n&&("-"!==t&&(i(),r=!0),o+="<",n=!1),"<"!==t?r&&">"==t?(o+=t,i(),r=!1):r||"/"!=t?o+=t:i():n=!0}return i(),t}(e);return function e(t,r){let o=function(e){return"."===e?t:e.endsWith("<-")?t.in(a.resolveCurie(e.substring(0,e.length-2))):e.startsWith("^")?t.in(a.resolveCurie(e.substring(1))):t.out(a.resolveCurie(e))}(r[0]);if(1===r.length){var i=o.nodes;if(0===i.length){if(t.nodes[0].language&&a.resolveCurie(r[0]).equals(n.sym("http://purl.org/dc/terms/language")))return[n.literal(t.nodes[0].language)];if(t.nodes[0].datatype&&a.resolveCurie(r[0]).equals(a.resolveCurie("rdf:type")))return[t.nodes[0].datatype]}return i}return e(o,r.slice(1))}(i,t)}if(t.startsWith("@prefix ")){var c=(d=t.split(" "))[1],l=d[2],f=c.substring(0,c.length-1),p=l.substring(1,l.length-1);return a.prefixMap[f]=p,""}if(t.startsWith(":render ")){var d,g,v=(d=t.split(" "))[1];(g=d[2])&&(g=a.resolveCurie(g)),g||(g=u);var w=h(v);return w.length>1&&console.warn("Argument of render evaluates to more than one node!"),w.length>0?r.render(s,w[0],g):""}if(t.startsWith(":continue"))return(g=(d=t.split(" "))[1])&&(g=a.resolveCurie(g)),g||(g=u),i.nodes.length>1&&console.warn(":continue invoked in context with more than one node, this shouldn't be possible!"),r.render(s,i.nodes[0],g);if(t.startsWith("+"))return h(t=t.substring(1)).length>0;var m=h(t);return 1===m.length?new a.Renderee(r,o(m[0],s),u):m.map(function(e){return new a.Renderee(r,o(e,s),u)})}return e.call(this,t)}}(),a.Renderee=function(e,t,r){if(!t.nodes)throw new Error("second argument must be a GraphNode");if(1!==t.nodes.length)throw new Error("Renderee must be a single node");this.rdf2h=e,this.graphNode=t,this.context=r},a.Renderee.prototype.toString=function(){return this.graphNode.value?this.graphNode.value:this.graphNode.toString()},a.prototype.getRenderer=function(e){s.rdf2h;let t=this.tbox;let r=this;let a=function(e){return"Literal"===e.node.termType?[e.node.datatype]:e.out(s.rdf("type")).nodes.sort((e,r)=>e.equals(r)?0:e.equals(s.rdfs("Resource"))?1:r.equals(s.rdfs("Resource"))?-1:0===t.match(e,s.rdfs("subClassOf"),r).length?0===t.match(r,s.rdfs("subClassOf"),e).length?e.value.localeCompare(r.value):1:-1).concat([s.rdfs("Resource")])}(e.graphNode),u=function(e,t){let n=r.rendererGraphs;return e.reduce((e,r)=>e||n.reduce((e,n)=>(r=o(r,n),e||function(e){return e.find(e=>t.equals(e.out(s.rdf2h("context")).node))}(r.in(s.rdf2h("type")).split())),null),null)}(a,e.context);if(!u)throw Error("No renderer found with context: <"+e.context.value+"> for any of the types "+a.map(e=>"<"+e.value+">").join()+". The resource <"+e.graphNode.value+"> could thus not be rendered.");let h=u.out(s.rdf2h("mustache"));if(h.nodes.length>0)return function(e){return function(t){return i.render(e,t)}}(h.value);let c=u.out(s.rdf2h("javaScript"));return function(e){try{let t=(t,r)=>e.rdf2h.render(t.graph,t.node,r||e.context),r="",i=e=>{r+=e},s=new Function("n","context","$rdf","render","print","GraphNode","env",c.value)(e.graphNode,e.context,n,t,i,o,e.rdf2h.env);return s?r+s:r}catch(e){e.message=e.message+" in "+c.value;let t=e.stack.split("\n"),r=t.findIndex(e=>e.indexOf("RDF2h.render")>0);throw e.stack=t.splice(0,r-1).join("\n"),e}}},a.prototype.render=function(e,t,r){t.termType||(t=n.sym(t)),r||(r=s.rdf2h("Default"));var i=new a.Renderee(this,o(t,e),r);return this.getRenderer(i)(i)},a.prefixMap={},a.prefixMap.rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#",a.prefixMap.rdfs="http://www.w3.org/2000/01/rdf-schema#",a.prefixMap.r2h="http://rdf2h.github.io/2015/rdf2h#",a.prefixMap.schema="http://schema.org/",a.prefixMap.rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#",a.prefixMap.dct="http://purl.org/dc/terms/",a.resolveCurie=function(e){if(e.startsWith("<")&&e.endsWith(">"))return n.sym(e.substring(1,e.length-1));var t=e.split(":"),r=t[0],o=t[1];return a.prefixMap[r]?n.sym(a.prefixMap[r]+o):n.sym(e)},"undefined"!=typeof window&&(window.RDF2h=a),e.exports=a},function(e,t){e.exports=fetch},function(e,t,r){var n,o,i;
/*!
 * mustache.js - Logic-less {{mustache}} templates with JavaScript
 * http://github.com/janl/mustache.js
 */
/*!
 * mustache.js - Logic-less {{mustache}} templates with JavaScript
 * http://github.com/janl/mustache.js
 */
!function(r,s){"object"==typeof t&&t&&"string"!=typeof t.nodeName?s(t):(o=[t],void 0===(i="function"==typeof(n=s)?n.apply(t,o):n)||(e.exports=i))}(0,function(e){var t=Object.prototype.toString,r=Array.isArray||function(e){return"[object Array]"===t.call(e)};function n(e){return"function"==typeof e}function o(e){return e.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g,"\\$&")}function i(e,t){return null!=e&&"object"==typeof e&&t in e}var s=RegExp.prototype.test;var a=/\S/;function u(e){return!function(e,t){return s.call(e,t)}(a,e)}var h={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","/":"&#x2F;","`":"&#x60;","=":"&#x3D;"};var c=/\s*/,l=/\s+/,f=/\s*=/,p=/\s*\}/,d=/#|\^|\/|>|\{|&|=|!/;function g(e){this.string=e,this.tail=e,this.pos=0}function v(e,t){this.view=e,this.cache={".":this.view},this.parent=t}function w(){this.cache={}}g.prototype.eos=function(){return""===this.tail},g.prototype.scan=function(e){var t=this.tail.match(e);if(!t||0!==t.index)return"";var r=t[0];return this.tail=this.tail.substring(r.length),this.pos+=r.length,r},g.prototype.scanUntil=function(e){var t,r=this.tail.search(e);switch(r){case-1:t=this.tail,this.tail="";break;case 0:t="";break;default:t=this.tail.substring(0,r),this.tail=this.tail.substring(r)}return this.pos+=t.length,t},v.prototype.push=function(e){return new v(e,this)},v.prototype.lookup=function(e){var t,r=this.cache;if(r.hasOwnProperty(e))t=r[e];else{for(var o,s,a=this,u=!1;a;){if(e.indexOf(".")>0)for(t=a.view,o=e.split("."),s=0;null!=t&&s<o.length;)s===o.length-1&&(u=i(t,o[s])),t=t[o[s++]];else t=a.view[e],u=i(a.view,e);if(u)break;a=a.parent}r[e]=t}return n(t)&&(t=t.call(this.view)),t},w.prototype.clearCache=function(){this.cache={}},w.prototype.parse=function(t,n){var i=this.cache,s=i[t];return null==s&&(s=i[t]=function(t,n){if(!t)return[];var i,s,a,h=[],v=[],w=[],m=!1,y=!1;function x(){if(m&&!y)for(;w.length;)delete v[w.pop()];else w=[];m=!1,y=!1}function b(e){if("string"==typeof e&&(e=e.split(l,2)),!r(e)||2!==e.length)throw new Error("Invalid tags: "+e);i=new RegExp(o(e[0])+"\\s*"),s=new RegExp("\\s*"+o(e[1])),a=new RegExp("\\s*"+o("}"+e[1]))}b(n||e.tags);for(var k,T,C,E,M,R,N=new g(t);!N.eos();){if(k=N.pos,C=N.scanUntil(i))for(var j=0,P=C.length;j<P;++j)u(E=C.charAt(j))?w.push(v.length):y=!0,v.push(["text",E,k,k+1]),k+=1,"\n"===E&&x();if(!N.scan(i))break;if(m=!0,T=N.scan(d)||"name",N.scan(c),"="===T?(C=N.scanUntil(f),N.scan(f),N.scanUntil(s)):"{"===T?(C=N.scanUntil(a),N.scan(p),N.scanUntil(s),T="&"):C=N.scanUntil(s),!N.scan(s))throw new Error("Unclosed tag at "+N.pos);if(M=[T,C,k,N.pos],v.push(M),"#"===T||"^"===T)h.push(M);else if("/"===T){if(!(R=h.pop()))throw new Error('Unopened section "'+C+'" at '+k);if(R[1]!==C)throw new Error('Unclosed section "'+R[1]+'" at '+k)}else"name"===T||"{"===T||"&"===T?y=!0:"="===T&&b(C)}if(R=h.pop())throw new Error('Unclosed section "'+R[1]+'" at '+N.pos);return function(e){for(var t,r=[],n=r,o=[],i=0,s=e.length;i<s;++i)switch((t=e[i])[0]){case"#":case"^":n.push(t),o.push(t),n=t[4]=[];break;case"/":o.pop()[5]=t[2],n=o.length>0?o[o.length-1][4]:r;break;default:n.push(t)}return r}(function(e){for(var t,r,n=[],o=0,i=e.length;o<i;++o)(t=e[o])&&("text"===t[0]&&r&&"text"===r[0]?(r[1]+=t[1],r[3]=t[3]):(n.push(t),r=t));return n}(v))}(t,n)),s},w.prototype.render=function(e,t,r){var n=this.parse(e),o=t instanceof v?t:new v(t);return this.renderTokens(n,o,r,e)},w.prototype.renderTokens=function(e,t,r,n){for(var o,i,s,a="",u=0,h=e.length;u<h;++u)s=void 0,"#"===(i=(o=e[u])[0])?s=this.renderSection(o,t,r,n):"^"===i?s=this.renderInverted(o,t,r,n):">"===i?s=this.renderPartial(o,t,r,n):"&"===i?s=this.unescapedValue(o,t):"name"===i?s=this.escapedValue(o,t):"text"===i&&(s=this.rawValue(o)),void 0!==s&&(a+=s);return a},w.prototype.renderSection=function(e,t,o,i){var s=this,a="",u=t.lookup(e[1]);if(u){if(r(u))for(var h=0,c=u.length;h<c;++h)a+=this.renderTokens(e[4],t.push(u[h]),o,i);else if("object"==typeof u||"string"==typeof u||"number"==typeof u)a+=this.renderTokens(e[4],t.push(u),o,i);else if(n(u)){if("string"!=typeof i)throw new Error("Cannot use higher-order sections without the original template");null!=(u=u.call(t.view,i.slice(e[3],e[5]),function(e){return s.render(e,t,o)}))&&(a+=u)}else a+=this.renderTokens(e[4],t,o,i);return a}},w.prototype.renderInverted=function(e,t,n,o){var i=t.lookup(e[1]);if(!i||r(i)&&0===i.length)return this.renderTokens(e[4],t,n,o)},w.prototype.renderPartial=function(e,t,r){if(r){var o=n(r)?r(e[1]):r[e[1]];return null!=o?this.renderTokens(this.parse(o),t,r,o):void 0}},w.prototype.unescapedValue=function(e,t){var r=t.lookup(e[1]);if(null!=r)return r},w.prototype.escapedValue=function(t,r){var n=r.lookup(t[1]);if(null!=n)return e.escape(n)},w.prototype.rawValue=function(e){return e[1]},e.name="mustache.js",e.version="2.3.2",e.tags=["{{","}}"];var m=new w;return e.clearCache=function(){return m.clearCache()},e.parse=function(e,t){return m.parse(e,t)},e.render=function(e,t,n){if("string"!=typeof e)throw new TypeError('Invalid template! Template should be a "string" but "'+function(e){return r(e)?"array":typeof e}(e)+'" was given as the first argument for mustache#render(template, view, partials)');return m.render(e,t,n)},e.to_html=function(t,r,o,i){var s=e.render(t,r,o);if(!n(i))return s;i(s)},e.escape=function(e){return String(e).replace(/[&<>"'`=\/]/g,function(e){return h[e]})},e.Scanner=g,e.Context=v,e.Writer=w,e})},function(e,t,r){var n=r(0);e.exports={schema:function(e){return n.sym("http://schema.org/"+e)},rdf:function(e){return n.sym("http://www.w3.org/1999/02/22-rdf-syntax-ns#"+e)},rdfs:function(e){return n.sym("http://www.w3.org/2000/01/rdf-schema#"+e)},foaf:function(e){return n.sym("http://xmlns.com/foaf/0.1/"+e)},rdf2h:function(e){return n.sym("http://rdf2h.github.io/2015/rdf2h#"+e)}}}]);
//# sourceMappingURL=ld2h.js.map