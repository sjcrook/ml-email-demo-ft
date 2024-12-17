xquery version "1.0-ml";

module namespace resource = "http://marklogic.com/rest-api/resource/visjs";

import module namespace visjs = "http://marklogic.com/visjs/graph" at "/ext/mlpm_modules/visjs-graph/visjs-lib.xqy";

import module namespace json = "http://marklogic.com/xdmp/json" at "/MarkLogic/json/json.xqy";
import module namespace sem = "http://marklogic.com/semantics" at "/MarkLogic/semantics.xqy";

declare namespace rapi = "http://marklogic.com/rest-api";

(:
declare %rapi:transaction-mode("update") function post(
  $context as map:map,
  $params  as map:map,
  $input   as document-node()*
  ) as document-node()*
{
  let $as-xml := json:transform-from-json($input)

  return insert-triple($as-xml)

};

declare function insert-triple($as-xml as node()) {

  let $s := $as-xml//*:s/data()
  let $p := $as-xml//*:p/string()
  let $o := $as-xml//*:o/string()

  let $triple :=
    element sem:triple {
      element sem:subject {$s},
      element sem:predicate {$p},
      element sem:object {$o}
    }

  let $_ :=
    if(fn:doc-available($s)) then
      xdmp:node-insert-child(fn:doc($s)/*, $triple)
    else if(fn:doc-available($o)) then
      xdmp:node-insert-child(fn:doc($o)/*, $triple)
    else
      sem:rdf-insert(sem:triple(sem:iri($s), $p, $o))

  let $_ :=  xdmp:log("Inserted new triple for " || $s)
  return ()
};:)

(:)
declare function get(
  $context as map:map,
  $params  as map:map
) as document-node()*
{
  let $subjects := map:get($params, "subjects")
  return visjs:build-graph($subjects)
};
:)

declare
function get(
  $context as map:map,
  $params as map:map
) as document-node()*
{
  let $uri := map:get($params,"subject")
  (:)
  let $_   := xdmp:log("*** visjs:get call ***")
  let $_   := xdmp:log("uri: " || $uri)
  :)
  return
  if (fn:empty(cts:uri-match($uri))) then document { "Error"}
  else build-response($uri)

};

declare function build-response ($uri) {
  let $who   := fn:doc($uri)/envelope/headers/tofrom-metas/email-from/email/text()
  let $who-id:= xdmp:hash64($who)
  let $bind  := map:new(map:entry("who", sem:iri($who)))

  let $values := sem:sparql("
      PREFIX ml:<http://demo.marklogic.com#>
      SELECT ?from ?to
      WHERE
       {
          { ?from ml:sendsTo ?who  }
          UNION       
          { ?who ml:sendsTo ?to }
      }
      LIMIT 5
      ",$bind)
  let $results :=
     <results>
       <row><who id="{$who-id}"><value>{$who}</value></who></row>
       {for $value in $values
       let $from := map:get($value,"from")
       let $to   := map:get($value,"to")
       return
         <row>
         { if ($from != "") then <from id="{xdmp:hash64($from)}"><value>{$from}</value></from> else ()}
         { if ($to != "") then <to id="{xdmp:hash64($to)}"><value>{$to}</value></to> else () }
         </row>
       }  
     </results>
  
  let $all-nodes := for $row in $results//row
                    return object-node {
                        "id": fn:string($row//@id),
                        "label": $row//value/text() ,
                        "group": "Person"
                      }
  let $parent-edges := for $row in $results//row/from
                       return object-node {
                        "from": fn:string($row/@id),
                        "to": fn:string($who-id),
                        "label": "sendsEmailTo"
                       }                  
  let $child-edges := for $row in $results//row/to
                      return object-node {
                        "from": fn:string($who-id),
                        "to": fn:string($row/@id),
                        "label": "sendsEmailTo"
                      }                  
  let $all-edges := ($parent-edges, $child-edges)  
  let $for-visjs := object-node {
                        "nodes": array-node{$all-nodes},
                        "edges": array-node{$all-edges}
                      }

  return 
     document {$for-visjs}


};

