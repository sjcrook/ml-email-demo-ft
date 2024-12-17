xquery version "1.0-ml";

module namespace chkdoc = "http://marklogic.com/rest-api/resource/checkDocService";
declare namespace rapi = "http://marklogic.com/rest-api";
declare namespace roxy = "http://marklogic.com/roxy";
declare namespace xhtml = "http://www.w3.org/1999/xhtml";

declare
%roxy:params("uri=xs:string")
function chkdoc:get(
  $context as map:map,
  $params as map:map
) as document-node()*
{
  let $uri := map:get($params,"uri")

  return
  if (fn:empty(cts:uri-match($uri))) then document {"Error"}
  else chkdoc:build-response($uri)

};

declare function chkdoc:build-response ($uri) {
  let $doc := fn:doc($uri)
  let $chapters := ("Issuer","Guarantor","Dealers","Type","ISIN code","Issue Size","Nominal Value","Minimum Trading Number","Trade Date","Initial Valuation Date","Issue Date","Reference Date for the Issuer","Reference Date for the Holder","Maturity Date","Issue Price","Product Description","Target Market","Negative Target Market","Reference Value","Underlying","Settlement at the option of the Issuer","Issuer’s Valuation Date","Issuer’s Optional Settlement Date","Settlement at the option of the Holder","Holder’s Valuation Date","Holder’s Optional Settlement Date","Issuer’s Optional Settlement Amount","Holder’s Optional Settlement Amount","Currency","Settlement Type","Common code","Telekurs code","Listing","Paying Agent","Calculation Agent","Exchange Business Day","Scheduled Trading Day","Business Day for Payment","Business Day Convention","Central Depositary","Documentation","Governing Law","Commissions","Secondary Market","Section 871(m) of the Internal Revenue Code","Selling Restrictions","Risk Factors","Specific Risk Factors","DISCLAIMER","Investor Responsibility")
  let $docValues := for $v in $doc//xhtml:span/string() return fn:normalize-space($v)

  let $results := array-node{
    for $chapter in $chapters
      let $result := json:object()
      let $_ := map:put($result,$chapter,$chapter=$docValues)
      return $result
  }

  return document {$results}
};
