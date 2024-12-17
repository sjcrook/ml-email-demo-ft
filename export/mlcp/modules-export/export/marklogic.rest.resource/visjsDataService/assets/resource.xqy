xquery version "1.0-ml";

module namespace visjs = "http://marklogic.com/rest-api/resource/visjsDataService";
declare namespace rapi = "http://marklogic.com/rest-api";
declare namespace roxy = "http://marklogic.com/roxy";

import module namespace sem = "http://marklogic.com/semantics" at "/MarkLogic/semantics.xqy";

declare
%roxy:params("uri=xs:string")
function visjs:get(
  $context as map:map,
  $params as map:map
) as document-node()*
{
  let $uri := map:get($params,"uri")
  (:)
  let $_   := xdmp:log("*** visjs:get call ***")
  let $_   := xdmp:log("uri: " || $uri)
  :)
  return
  if (fn:empty(cts:uri-match($uri))) then document { "Error"}
  else visjs:build-response($uri)

};

declare function visjs:build-response ($uri) {
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

declare function visjs:put(
  $context as map:map,
  $params as map:map,
  $input as document-node()*
) as document-node()?
{
  xdmp:log("PUT called")
};

declare function visjs:post(
  $context as map:map,
  $params as map:map,
  $input as document-node()*
) as document-node()*
{
  xdmp:log("POST called")
};

declare function visjs:delete(
  $context as map:map,
  $params as map:map
) as document-node()?
{
  xdmp:log("DELETE called")
};