import { MarkLogicContext, NetworkGraph } from "ml-fasttrack";
import { useContext, useEffect, useState } from "react";
import { convertExtractedDataToJSON } from "../utils/dataTransform";

interface Props {
    documentResponse: any;
    searchResponse: any;
}

const NetworkGraphSPARQL = ({ documentResponse, searchResponse }: Props) => {
    
    const [ SPARQLResults, setSPARQLResults ] = useState(null);

    const context = useContext(MarkLogicContext);

    const layout = { orientation: 'down', curvedLinks: true };

    const onRightClickNodeHandler = (node) => {
        console.log('onRightClickNodeHandler', node);
    };

/*
                SELECT DISTINCT ?s ?sType ?p ?o ?oType
                WHERE {
                    # forward
                    {
                        ?m ?p ?o .
                    }
                    UNION
                    {
                        ?m ?p2 ?s .
                    }
                    UNION
                    {
                        ?m ?p3 ?i .
                        ?i ?p4 ?s .
                    }
                    UNION
                    # backward
                    {
                        ?s ?p5 ?m .
                    }
                    UNION
                    {
                        ?s ?p6 ?o .
                        ?o ?p7 ?m .
                    }
                    UNION
                    {
                        ?s ?p8 ?o .
                        ?o ?p9 ?i .
                        ?i ?p10 ?m .
                    }
                    ?s ?p ?o .

                    FILTER(?m in (?mParam))
                    BIND(IF(CONTAINS(?s, "@"), "email", "name") as ?sType)
                    BIND(IF(CONTAINS(?o, "@"), "email", "name") as ?oType)
                }
*/
    useEffect(() => {
        /*const sq =
            `
                SELECT DISTINCT ?s ?sType ?p ?o ?oType
                WHERE {
                    # forward
                    {
                        ?m ?p ?o .
                    }
                    UNION
                    {
                        ?m ?p2 ?s .
                    }
                    ?s ?p ?o .

                    FILTER(?m in (?mParam))
                    BIND(IF(CONTAINS(?s, "@"), "email", "name") as ?sType)
                    BIND(IF(CONTAINS(?o, "@"), "email", "name") as ?oType)
                }
                LIMIT 30
            `;*/

        const sq =
            `
                SELECT ?s ?p ?o
                WHERE {
                    {
                        ?s ?p ?o;
                        FILTER(?s = ?transcriptURI)
                    }
                    UNION
                    {
                        ?sp ?pp ?s .
                        ?s <http://marklogic.com/predicate/hasCallerFirstName> ?firstName;
                        <http://marklogic.com/predicate/hasCallerLastName> ?lastName .
                    
                        FILTER(?sp = ?transcriptURI)

                        BIND(<http://marklogic.com/predicate/hasCallerName> as ?p)
                        BIND(CONCAT(?firstName, " ", ?lastName) as ?o)
                    }
                    UNION
                    {
                        ?sp ?pp ?s .
                        ?s ?p ?o .
                    
                        FILTER(?sp = ?transcriptURI)
                        FILTER(?p NOT IN (<http://marklogic.com/predicate/hasCallerFirstName>, <http://marklogic.com/predicate/hasCallerLastName>))
                    }
                }
            `;

        const combinedQuery = {
            qtext: '',
            sparql: sq
        };

/*
"extracted": {
                "kind": "array",
                "content": [
                    {
                        "email": "david.forster@enron.com"
                    },
*/

        //const email = searchResponse.results.find(item => item.uri === documentResponse.uri).extracted?.content[0].email;

        // if (email) {
        if (documentResponse.uri) {
            //context.postSparql(combinedQuery, { "bind:mParam": email }).then(response => {
            context.postSparql(combinedQuery, { "bind:transcriptURI": 'http://marklogic.com' + documentResponse.uri }).then(response => {
                setSPARQLResults(response);
            }).catch(err => console.log('err', err));    
        } else {
            setSPARQLResults({});
        }

        //const email = convertExtractedDataToJSON([searchResponse.results.find(item => item.uri === documentResponse.uri).extracted.content[0]], []).email;

    }, []);


    const options = {
        "navigation": true,
        "overview": false,
        "backgroundColor": "pink",
        "iconFontFamily": "Font Awesome 5 Free Solid",
        "fit": "auto"
    };

    let graph = {};

    /*
<http://marklogic.com/transcripts/10242847730969838202.json> <http://marklogic.com/predicate/hasCallDateTime> "2001-07-27T15:48:00Z"^^xs:dateTime
<http://marklogic.com/transcripts/10242847730969838202.json> <http://marklogic.com/predicate/ofType> "transcript"
<http://marklogic.com/transcripts/10242847730969838202.json> <http://marklogic.com/predicate/hasCaller> <http://marklogic.com/transcripts/10242847730969838202.json/caller2>
<http://marklogic.com/transcripts/10242847730969838202.json> <http://marklogic.com/predicate/hasCaller> <http://marklogic.com/transcripts/10242847730969838202.json/caller1>
<http://marklogic.com/transcripts/10242847730969838202.json/caller1> <http://marklogic.com/predicate/hasCallerFirstName> "Jessica"
<http://marklogic.com/transcripts/10242847730969838202.json/caller1> <http://marklogic.com/predicate/hasCallerLastName> "Rodriguez"
<http://marklogic.com/transcripts/10242847730969838202.json/caller1> <http://marklogic.com/predicate/ofType> "transcript caller"
<http://marklogic.com/transcripts/10242847730969838202.json/caller2> <http://marklogic.com/predicate/hasCallerFirstName>  "Jesse"
<http://marklogic.com/transcripts/10242847730969838202.json/caller2> <http://marklogic.com/predicate/hasCallerLastName>  "Kelly"
<http://marklogic.com/transcripts/10242847730969838202.json/caller2> <http://marklogic.com/predicate/ofType> "transcript caller"
     */
    SPARQLResults?.results?.bindings?.forEach(sr => {

        const nodeConfigs = [
            {
                "color": "rgba(255,255,255,1)",
                "fontIcon": {
                    "color": "rgb(95, 227, 191)",
                    "text": "fa-envelope"
                },
                "border": {
                    "color": "rgba(95, 227, 191, 0.5)",
                    //"width": 4
                },
                "label": [
                    {
                        "text": null,
                        "position": "s"
                    },
                    {
                        "text": "(transcript)",
                        color: "rgba(200, 200, 200, 0.5)"
                    }
                ],
                type: "transcript"
            }, {
                "color": "rgba(255,255,255,1)",
                "fontIcon": {
                    "color": "rgb(139,0,139)",
                    "text": "fa-user"
                },
                "border": {
                    "color": "rgba(139,0,139, 0.5)"
                },
                "label": [
                    {
                        "text": null,
                        "position": "s"
                    },
                    {
                        "text": "(transcript caller)",
                        color: "rgba(200, 200, 200, 0.5)"
                    }
                ],
                type: "transcript caller"
            }, {
                "color": "rgba(255,255,255,1)",
                "fontIcon": {
                    "color": "rgb(139,0,139)",
                    "text": "fa-user"
                },
                "border": {
                    "color": "rgba(139,0,139, 0.5)"
                },
                "label": [
                    {
                        "text": null,
                        "position": "s"
                    },
                    {
                        "text": "(transcript caller)",
                        color: "rgba(200, 200, 200, 0.5)"
                    }
                ],
                type: "blank"
            } 
        ];

        function getNodeConfig(type) {
            return nodeConfigs.find(nodeConfig => nodeConfig.type === type);
        }

        if (!graph[sr.s.value] && sr.p.value === 'http://marklogic.com/predicate/ofType') {
            const newNodeConfig = JSON.parse(JSON.stringify(getNodeConfig(sr.o.value)));
            newNodeConfig.label[0].text = sr.s.value;
            graph[sr.s.value] = newNodeConfig;
        }
    
        if (sr.o.type !== 'uri' && sr.p.value !== 'http://marklogic.com/predicate/ofType') {
            const newNodeConfig = JSON.parse(JSON.stringify(getNodeConfig('blank')));
            newNodeConfig.label[0].text = sr.o.value;
            graph[sr.o.value] = newNodeConfig;
        }
    
        // links
        if (sr.p.value !== 'http://marklogic.com/predicate/ofType') {
            graph[sr.s.value + '_' + sr.o.value] = {
                id1: sr.s.value,
                id2: sr.o.value,
                label: { text: sr.p.value.split("/predicate/")[1], backgroundColor: "rgba(255, 255, 255, 0.8)" },
                end1: { arrow: false },
                end2: { arrow: true }
            };
        }
    
    });

    console.log('graph', graph);

    return (
        <NetworkGraph
            items={graph}
            settings={{
                layout,
                onContextMenu: (node) => onRightClickNodeHandler(node),
                options: options
            }}
            height={'100%'}
            width={'100%'}
        />
    );

}

export default NetworkGraphSPARQL;