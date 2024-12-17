
let graph = {};
let graphTypes = {};

bindings.forEach(sr => {
    if (!graph[sr.s.value]) {
        if (sr.p.value === 'http://marklogic.com/predicate/ofType') {
        }
    }


    if (!graph[sr.s.value]) {
        if (graphTypes[sr.s.value]) {
            const newNodeConfig = JSON.parse(JSON.stringify(getNodeConfig(graphTypes[sr.s.value])));
            newNodeConfig.label[0].text = sr.s.value;
            graph[sr.s.value] = newNodeConfig;
        } else {
            graph[sr.s.value] = 'unknown';
        }
    } else {
        if (graph[sr.s.value] === 'unknown') {
            if (graphTypes[sr.s.value]) {

            }    
        }
    }
});

bindings = [
    {
        "s": { "type": "uri", "value": "http://marklogic.com/transcripts/13695564404345957306.json" },
        "p": { "type": "uri", "value": "http://marklogic.com/predicate/hasCaller" },
        "o": { "type": "uri", "value": "http://marklogic.com/transcripts/13695564404345957306.json/caller1" }
    }, {
        "s": { "type": "uri", "value": "http://marklogic.com/transcripts/13695564404345957306.json" },
        "p": { "type": "uri", "value": "http://marklogic.com/predicate/hasCaller" },
        "o": { "type": "uri", "value": "http://marklogic.com/transcripts/13695564404345957306.json/caller2" }
    }, {
        "s": { "type": "uri", "value": "http://marklogic.com/transcripts/13695564404345957306.json" },
        "p": { "type": "uri", "value": "http://marklogic.com/predicate/ofType" },
        "o": { "type": "literal", "value": "transcript" }
    }, {
        "s": { "type": "uri", "value": "http://marklogic.com/transcripts/13695564404345957306.json" },
        "p": { "type": "uri", "value": "http://marklogic.com/predicate/hasCallDateTime" },
        "o": { "datatype": "http://www.w3.org/2001/XMLSchema#dateTime", "type": "literal", "value": "2001-01-22T15:48:00Z" }
    }, {
        "s": { "type": "uri", "value": "http://marklogic.com/transcripts/13695564404345957306.json/caller1" },
        "p": { "type": "uri", "value": "http://marklogic.com/predicate/hasCallerLastName" },
        "o": { "type": "literal", "value": "Brown" }
    }, {
        "s": { "type": "uri", "value": "http://marklogic.com/transcripts/13695564404345957306.json/caller1" },
        "p": { "type": "uri", "value": "http://marklogic.com/predicate/hasCallerFirstName" },
        "o": { "type": "literal", "value": "Michael" }
    }, {
        "s": { "type": "uri", "value": "http://marklogic.com/transcripts/13695564404345957306.json/caller1" },
        "p": { "type": "uri", "value": "http://marklogic.com/predicate/ofType" },
        "o": { "type": "literal", "value": "transcript caller" }
    }, {
        "s": { "type": "uri", "value": "http://marklogic.com/transcripts/13695564404345957306.json/caller2" },
        "p": { "type": "uri", "value": "http://marklogic.com/predicate/hasCallerFirstName" },
        "o": { "type": "literal", "value": "David" }
    }, {
        "s": { "type": "uri", "value": "http://marklogic.com/transcripts/13695564404345957306.json/caller2" },
        "p": { "type": "uri", "value": "http://marklogic.com/predicate/hasCallerLastName" },
        "o": { "type": "literal", "value": "Williams" }
    }, {
        "s": { "type": "uri", "value": "http://marklogic.com/transcripts/13695564404345957306.json/caller2" },
        "p": { "type": "uri", "value": "http://marklogic.com/predicate/ofType" },
        "o": { "type": "literal", "value": "transcript caller" }
    }
]