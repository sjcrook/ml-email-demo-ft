xquery version "1.0-ml";

import module namespace spell = "http://marklogic.com/xdmp/spell" at "/MarkLogic/spell.xqy";
import module namespace mem = "http://xqdev.com/in-mem-update" at '/MarkLogic/appservices/utils/in-mem-update.xqy';
declare default element namespace "http://marklogic.com/xdmp/spell";

let $words := ("manipulate", "california", "shutdown", "whitewing", "chewco", "jedi", "SPV", "mark-to-market", "off the book", "special purpose")

return
    spell:insert("/dictionary/supervision.xml", spell:make-dictionary($words))