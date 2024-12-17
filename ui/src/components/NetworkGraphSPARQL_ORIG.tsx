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
        const sq =
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

        const email = searchResponse.results.find(item => item.uri === documentResponse.uri).extracted?.content[0].email;

        if (email) {
            context.postSparql(combinedQuery, { "bind:mParam": email }).then(response => {
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

    SPARQLResults?.results?.bindings?.forEach(sr => {
        // nodes
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
                        "text": "(email)",
                        color: "rgba(200, 200, 200, 0.5)"
                    }
                ],
                type: "email"
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
                        "text": "(name)",
                        color: "rgba(200, 200, 200, 0.5)"
                    }
                ],
                type: "name"
            } 
        ];

        function getNodeConfig(type) {
            return nodeConfigs.find(nodeConfig => nodeConfig.type === type);
        }

        if (!graph[sr.s.value]) {
            //graph[sr.s.value] = { label: [{ text: sr.s.value }] };
            const newNodeConfig = JSON.parse(JSON.stringify(getNodeConfig(sr.sType.value)));
            newNodeConfig.label[0].text = sr.s.value;
            graph[sr.s.value] = newNodeConfig;

        }
        if (!graph[sr.o.value]) {
            //graph[sr.o.value] = { label: [{ text: sr.o.value }] };
            const newNodeConfig = JSON.parse(JSON.stringify(getNodeConfig(sr.oType.value)));
            newNodeConfig.label[0].text = sr.o.value;
            graph[sr.o.value] = newNodeConfig;
        }
        // links
        graph[sr.s.value + '_' + sr.o.value] = {
            id1: sr.s.value,
            id2: sr.o.value,
            label: { text: sr.p.value.split("#")[1], backgroundColor: "rgba(255, 255, 255, 0.8)" },
            end1: { arrow: false },
            end2: { arrow: true }
        };
    });

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