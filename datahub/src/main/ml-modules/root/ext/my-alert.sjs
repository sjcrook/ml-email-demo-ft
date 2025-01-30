declareUpdate();

var uri;

//xdmp.log("Trigger fired on: " + uri);

let words = cts.doc("/dictionary/supervision.xml").xpath("//xmlns:word/text()", { "xmlns": "http://marklogic.com/xdmp/spell" });

// get trade date and time
let trade = cts.doc(uri).toObject().trade;

// search for earlier email or transcript that contains words 
let suspicious_doc =  cts.search(
    cts.andQuery([  
        cts.collectionQuery([ "/type/emails", "/type/transcripts" ]), 
        cts.wordQuery(words,["punctuation-insensitive",  "case-insensitive", "diacritic-insensitive", "whitespace-insensitive", "stemmed"]),  
        cts.pathRangeQuery("/(email/headers/date-metas/dateTime | trade/TradeDateTime | transcript/metadata/dateTime)", "<=", new Date(trade.TradeDateTime)),
        cts.orQuery([
            cts.jsonPropertyValueQuery("email", trade.Client.Email, [ "punctuation-insensitive", "case-insensitive" ]),
            cts.jsonPropertyValueQuery("name", trade.Client.Name, [ "punctuation-insensitive", "case-insensitive" ])
        ])
    ])
);

// if found, insert an alert
if (fn.exists(suspicious_doc)) {
    let alert = {
        alert: {
            "URI": uri,
            "timestamp": new Date(),
            "message": "This is trade alert, one of the listed words is found in the earlier email or transcript",
            "referringDocs": suspicious_doc.toArray().map(doc => fn.baseUri(doc))
        }
    };
    //xdmp.log(uri + ": " + JSON.stringify(alert));
    xdmp.documentInsert("/alert" + uri, alert, { collections: [ "alerts" ] });
}