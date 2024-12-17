module namespace inv = "http://demo.marklogic.com/constraints/investigation";

declare default collation "http://marklogic.com/collation/codepoint";

declare namespace search = "http://marklogic.com/appservices/search";

declare namespace xhtml = "http://www.w3.org/1999/xhtml";

declare variable $inv:ERR_CANNOT_PARSE := "ERR_CANNOT_PARSE";
declare variable $inv:MSG_CANNOT_PARSE := "Cannot parse provided query";


declare function inv:parse($p, $q)
{

    try {
      (:)
      let $_     := xdmp:log("** XB:p **")
    	let $_     := xdmp:log($p)
      let $_     := xdmp:log("** XB:q **")
    	let $_     := xdmp:log($q)
      let $_     := xdmp:log("** XB:text **")
    	let $_     := xdmp:log($p//search:text/text())
      :)
        let $investigation  := $p//search:text/text()
        let $query := cts:and-query((cts:not-query(cts:document-query("/dictionary/investigation.xml")),$investigation))
        (:)
        let $query :=
            if($etat = $ec:ETAT_SANS_EFFET) then
                cts:element-value-query(xs:QName("motifFinEffet"), "SANS EFFET")
            else if($etat = $ec:ETAT_FERME) then
                cts:and-query((
                    cts:path-range-query("//es:instance/cadreContractuel/dateFinEffet", "<", $today),
                    cts:not-query(cts:element-value-query(xs:QName("motifFinEffet"), "SANS EFFET"))
                ))
            else if($etat = $ec:ETAT_OUVERT) then
                cts:and-query((
                    cts:path-range-query("//es:instance/cadreContractuel/dateEffetContrat", "<=", $today),
                    cts:or-query((
                        cts:not-query(cts:element-query(xs:QName("dateFinEffet"), cts:and-query(()))),
                        cts:path-range-query("//es:instance/cadreContractuel/dateFinEffet", ">=", $today)
                     ))
                ))
            else if($etat = $ec:ETAT_AVENIR) then
                cts:path-range-query("//es:instance/cadreContractuel/dateEffetContrat", ">", $today)
            else
                error()
        :)

        return document { $query }/node()
    }
    catch ($ex) {
        error(xs:QName($inv:ERR_CANNOT_PARSE), $inv:MSG_CANNOT_PARSE, $ex)
    }
};


declare function inv:start-facet(
  $constraint as element(search:constraint),
  $query as cts:query?,
  $facet-options as xs:string*,
  $quality-weight as xs:double?,
  $forests as xs:unsignedLong*)
as item()*
{
      (:)
      let $_     := xdmp:log("** XB:constraint **")
      let $_     := xdmp:log($constraint)
      let $_     := xdmp:log("** XB:query **")
      let $_     := xdmp:log($query)
      let $_     := xdmp:log("** XB:facet-options **")
      let $_     := xdmp:log($facet-options)
      :)
  let $today := current-date()
  let $m := map:map()
  let $_ := for $word in fn:doc("/dictionary/investigation.xml")//word/text()
            let $count := xdmp:estimate(cts:search(fn:doc(), cts:and-query((cts:not-query(cts:document-query("/dictionary/investigation.xml")),$word, $query)) )) 
            where $count > 0
            return map:put($m, 
                           $word, 
                           $count
            	             )
(:)
  let $_ := map:put(
    $m,
    $ec:ETAT_AVENIR,
    xdmp:estimate(cts:search(
      doc(),
      cts:and-query((
        $query,
        cts:path-range-query("//es:instance/cadreContractuel/dateEffetContrat", ">", $today)
      ))
    ))
  )

  let $_ := map:put(
      $m,
      $ec:ETAT_SANS_EFFET,
      xdmp:estimate(cts:search(
        doc(),
        cts:and-query((
          $query,
          cts:element-value-query(xs:QName("motifFinEffet"), "SANS EFFET")
        ))
      ))
    )

  let $_ := map:put(
    $m,
    $ec:ETAT_FERME,
    xdmp:estimate(cts:search(
      doc(),
      cts:and-query((
        $query,
        cts:and-query((
            cts:path-range-query("//es:instance/cadreContractuel/dateFinEffet", "<", $today),
            cts:not-query(cts:element-value-query(xs:QName("motifFinEffet"), "SANS EFFET"))
        ))
      ))
    ))
  )

  let $_ := map:put(
    $m,
    $ec:ETAT_OUVERT,
    xdmp:estimate(cts:search(
      doc(),
      cts:and-query((
          $query,
          cts:path-range-query("//es:instance/cadreContractuel/dateEffetContrat", "<=", $today),
          cts:or-query((
            cts:not-query(cts:element-query(xs:QName("dateFinEffet"), cts:and-query(()))),
            cts:path-range-query("//es:instance/cadreContractuel/dateFinEffet", ">=", $today)
         ))
      ))
    ))
  )
:)

  return $m
};

declare function inv:finish-facet(
  $start as item()*,
  $constraint as element(search:constraint),
  $query as cts:query?,
  $facet-options as xs:string*,
  $quality-weight as xs:double?,
  $forests as xs:unsignedLong*)
as element(search:facet)
{
(: Uses the annotation from the constraint to extract the regions :)
  let $e := element search:facet {
    attribute name {$constraint/@name},
    for $key in map:keys($start)
    return
      element search:facet-value{
          attribute name { $key },
          attribute count { map:get($start, $key) }
      }
  }
  return $e

};
