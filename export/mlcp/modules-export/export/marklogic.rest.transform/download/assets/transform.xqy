xquery version "1.0-ml";
module namespace download = "http://marklogic.com/rest-api/transform/download";
import module namespace extut = "http://marklogic.com/rest-api/lib/extensions-util"
    at "/MarkLogic/rest-api/lib/extensions-util.xqy";
declare namespace xsl = "http://www.w3.org/1999/XSL/Transform";
declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";
declare private variable $transform-uri := "/marklogic.rest.transform/download/assets/transform.xsl";
declare function download:transform(
    $context as map:map,
    $params  as map:map,
    $content as document-node()
) as document-node()?
{
    extut:execute-transform($transform-uri,$context,$params,$content)
};
