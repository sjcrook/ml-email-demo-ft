import { Button } from "@progress/kendo-react-buttons";
import { MarkLogicContext, NetworkGraph } from "ml-fasttrack";
import { useContext, useRef, useState } from "react";
import { InputSuffix, TextBox } from "@progress/kendo-react-inputs";
import { searchIcon } from "@progress/kendo-svg-icons";

const NetworkGraphSPARQLExample = () => {
    
    const [ layout, setLayout ] = useState({ orientation: 'down', curvedLinks: true });
    const [ items, setItems ] = useState({});
    const [ SPARQLResults, setSPARQLResults ] = useState(null);
    const qTextInputRef = useRef();

    const context = useContext(MarkLogicContext);

/*
                SELECT DISTINCT ?s ?p ?o
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
                }
*/

    const onClickHandler = () => {
        const sq =
            `
                SELECT DISTINCT ?s ?p ?o
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
                }
                LIMIT 30
            `
/*
            `
                SELECT * WHERE { ?s ?p ?o . } LIMIT 10
            `
*/
            ;

        const combinedQuery = {
            qtext: '',
            sparql: sq
        };

        context.postSparql(combinedQuery, { "bind:mParam": "mark.taylor@enron.com" }).then(response => {
            console.log('postSparql', response);
            setSPARQLResults(response);
        }).catch(err => console.log('err', err));    
    };

    const onRightClickNodeHandler = (node) => {
        console.log('onRightClickNodeHandler', node);
    };

    const getNodeData = (nodeType, value) => {
        const nodeData = JSON.parse(JSON.stringify(nodesConfig.find(item => item.entityType === nodeType)));
        nodeData.label[0].text = value;
        return nodeData;
    };

    function createGraphObject(results, linksConfig) {
        const obj = {};
        for (let i = 0; i < results.length; i++) {
            for (let j = 0; j < linksConfig.length; j++) {
                const npns = { id1: [], id2: [] };
                for (let k = 1; k <= 2; k++) {
                    const nt = linksConfig[j]["id" + k];
                    let v = results[i][nt];
                    if (!Array.isArray(v)) {
                        v = [ v ];
                    }
                    for (let m = 0; m < v.length; m++) {
                        if (v[m] !== undefined) {
                            let npn = "node_" + nt + "_" + v[m];
                            npns["id" + k].push(npn);
                            if (!obj[npn]) {
                                obj[npn] = getNodeData(nt, v[m]);
                            }
                        }
                    }
                }
                for (let p = 0; p < npns.id1.length; p++) {
                    for (let q = 0; q < npns.id2.length; q++) {
                        let lpn = "link_" + npns.id1[p] + "_" + npns.id2[q];
                        if (!obj[lpn]) {
                            obj[lpn] = {
                                ...linksConfig[j],
                                id1: npns.id1[p],
                                id2: npns.id2[q]
                            }            
                        }
                    }
                }
            }
        }
        return obj;
    }

    const nodesConfig = [
        {
            "color": "rgba(255,255,255,1)",
            "size": 1.2,
            "fontIcon": {
                "color": "rgb(95, 227, 191)",
                "text": "fa-music"
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
                    "text": "(title)",
                    color: "rgba(200, 200, 200, 0.5)"
                }
            ],
            "entityType": "title"
        },
        {
            "color": "rgba(255,255,255,1)",
            "fontIcon": {
                "color": "rgb(139,0,139)",
                "text": "fa-record-vinyl"
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
                    "text": "(album)",
                    color: "rgba(200, 200, 200, 0.5)"
                }
            ],
            "entityType": "album"
        },
        {
            "color": "rgba(255,255,255,1)",
            "fontIcon": {
                "color": "rgb(46,139,87)",
                "text": "fa-tag"
            },
            "border": {
                "color": "rgba(46,139,87, 0.5)"
            },
            "label": [
                {
                    "text": null,
                    "position": "s"
                },
                {
                    "text": "(label)",
                    color: "rgba(200, 200, 200, 0.5)"
                }
            ],
            "entityType": "label"
        },
        {
            "color": "rgba(255,255,255,1)",
            "fontIcon": {
                "color": "rgb(222,184,135)",
                "text": "fa-palette"
            },
            "border": {
                "color": "rgba(222,184,135, 0.5)"
            },
            "label": [
                {
                    "text": null,
                    "position": "s"
                },
                {
                    "text": "(artist)",
                    color: "rgba(200, 200, 200, 0.5)"
                }
            ],
            "entityType": "artist"
        },
        {
            "color": "rgba(255,255,255,1)",
            "fontIcon": {
                "color": "rgb(30,144,255)",
                "text": "fa-guitar"
            },
            "border": {
                "color": "rgba(30,144,255, 0.5)"
            },
            "label": [
                {
                    "text": null,
                    "position": "s"
                },
                {
                    "text": "(genre)",
                    color: "rgba(200, 200, 200, 0.5)"
                }
            ],
            "entityType": "genre"
        },
        {
            "color": "rgba(255,255,255,1)",
            "fontIcon": {
                "color": "rgb(255,165,0)",
                "text": "fa-pen-fancy"
            },
            "border": {
                "color": "rgba(255,165,0, 0.5)"
            },
            "label": [
                {
                    "text": null,
                    "position": "s"
                },
                {
                    "text": "(writer)",
                    color: "rgba(200, 200, 200, 0.5)"
                }
            ],
            "entityType": "writer"
        }
    ];
    
    const linksConfig = [
        { id1: "title", id2: "album", label: { text: "onAlbum", backgroundColor: "rgba(255, 255, 255, 0.5)" } },
        { id1: "album", id2: "label", label: { text: "onLabel", backgroundColor: "rgba(255, 255, 255, 0.5)" } },
        { id1: "title", id2: "genre", label: { text: "hasGenre", backgroundColor: "rgba(255, 255, 255, 0.5)" } },
        { id1: "title", id2: "writer", label: { text: "hasWriter", backgroundColor: "rgba(255, 255, 255, 0.5)" } },
        { id1: "title", id2: "artist", label: { text: "by", backgroundColor: "rgba(255, 255, 255, 0.5)" } }
    ];

    /*
    if (Object.keys(items).length === 0 && SPARQLResults) { 
        const extractedContentAsJSON = [];
        for (let i = 0; i < SPARQLResults.results.bindings.length; i++) {
            extractedContentAsJSON.push(Object.fromEntries(Object.entries(SPARQLResults.results.bindings[i]).map(e => [ e[0], e[1].value ])));
        }
    
        setItems(() => createGraphObject(extractedContentAsJSON, linksConfig));
    }
    */

    const options = {
        "navigation": true,
        "overview": false,
        "backgroundColor": "pink",
        "iconFontFamily": "Font Awesome 5 Free Solid",
        "fit": "auto"
    };

    let graph = {};

    // nodes
    SPARQLResults?.results?.bindings?.forEach(sr => {
        // nodes
        const nodeConfigs = [
            {
                "color": "rgba(255,0,255,1)",
                "fontIcon": {
                    "color": "rgb(30,144,255)",
                    "text": "fa-user"
                },
                "border": {
                    "color": "rgba(30,144,255, 0.5)"
                },
                "label": [
                    {
                        "text": "top label",
                        "position": "s"
                    },
                    {
                        "text": "bottom label",
                        color: "rgba(200, 200, 200, 0.5)"
                    }
                ],
                type: "email"
            }, {
                "color": "rgba(255,255,255,1)",
                "fontIcon": {
                    "color": "rgb(30,144,255)",
                    "text": "fa-user"
                },
                "border": {
                    "color": "rgba(30,144,255, 0.5)"
                },
                "label": [
                    {
                        "text": "top label",
                        "position": "s"
                    },
                    {
                        "text": "bottom label",
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
            label: { text: "sends to", backgroundColor: "rgba(255, 255, 255, 0.8)" },
            end1: { arrow: false },
            end2: { arrow: true }
        };
    });

    console.log('graph', graph);
      
    return (
        <div className="box">
            <div><button onClick={onClickHandler}></button></div>
            <div className="row content" style={{ height: '800px' }}>
                <NetworkGraph
                    items={graph}
                    settings={{
                        layout,
                        onContextMenu: (node) => onRightClickNodeHandler(node),
                        options: options
                    }}
                />
            </div>
            <style>{`
                .xbox {
                    display: flex;
                    flex-flow: column;
                    height: 100%;
                }

                .xbox .row {
                    border: 1px dotted grey;
                }

                .xbox .row.header {
                    flex: 0 1 auto;
                    /* The above is shorthand for:
                    flex-grow: 0,
                    flex-shrink: 1,
                    flex-basis: auto
                    */
                }

                .xbox .row.content {
                    flex: 1 1 auto;
                }
            `}</style>
        </div>
    );

}

export default NetworkGraphSPARQLExample;