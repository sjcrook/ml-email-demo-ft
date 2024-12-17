xquery version "1.0-ml";

module namespace speechseg = "http://marklogic.com/rest-api/resource/speechSegments";
declare namespace rapi = "http://marklogic.com/rest-api";
declare namespace roxy = "http://marklogic.com/roxy";

declare
%roxy:params("uri=xs:string")
function speechseg:get(
  $context as map:map,
  $params as map:map
) as document-node()*
{
  let $uri := map:get($params,"uri")

  return
  if (fn:empty(cts:uri-match($uri))) then document {"Error"}
  else speechseg:build-response($uri)

};

declare function speechseg:convert2HTML($transcripts as node()*) as item()* {
  for $node in $transcripts
    return
      typeswitch($node)
        case text() return $node
        case element(confirmationForm) return element a {attribute {"href"} {"/v1/documents?uri=%2FxDoc%2Fconf-sign%C3%A9e_Cfin-" || $node/string() || ".pdf"},attribute {"target"} {"_BLANK" || $node/string() || ".pdf"},speechseg:convert2HTML($node/node())}
        default return speechseg:convert2HTML($node/node())
};

declare function speechseg:build-response($uri) {
  let $transcript := fn:doc($uri)
  return
    document{
      array-node {
        for $SpeechSegment in $transcript//headers//SpeechSegment
        return
          object-node{
            "stime" :  $SpeechSegment/@stime/string(),
            "text" : $SpeechSegment/string(),
            "htmltext" : xdmp:quote(speechseg:convert2HTML($SpeechSegment))
        }
      }
    }
};
