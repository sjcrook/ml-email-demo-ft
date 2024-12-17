declareUpdate();

var URI;

const doc = cts.doc(URI).toObject();

const newDoc = {
    "envelope": {
        "headers": doc.envelope.headers
    }
};

if (doc.envelope.triples && doc.envelope.triples["sem:triple"] && Array.isArray(doc.envelope.triples["sem:triple"])) {
        newDoc.envelope.triples = doc.envelope.triples["sem:triple"].map(triple => ({
            "triple": {
                "subject": triple["sem:subject"],
                "predicate": triple["sem:predicate"],
                "object": triple["sem:object"]
            }
        }))
}

newDoc.envelope.instance = doc.envelope.instance;

xdmp.documentInsert(
    URI,
    newDoc,
    { collections : [ "/type/" + URI.split("/")[1] ] }
);