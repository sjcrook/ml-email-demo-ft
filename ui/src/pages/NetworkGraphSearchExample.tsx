import { MarkLogicContext, NetworkGraph } from "ml-fasttrack";
import { useContext, useState } from "react";
import { convertExtractedDataToJSON } from "../utils/dataTransform";

const NetworkGraphSearchExample = () => {
    
    const [ layout, setLayout ] = useState({ orientation: 'down', curvedLinks: true });
    const [ items, setItems ] = useState({});

    const onSelectNodeHandler = (evt) => {
        console.log('onSelectNodeHandler', evt);
    };

    const onDoubleClickNodeHandler = (evt) => {
        console.log('onDoubleClickNodeHandler', evt);
        setItems(() => ({
            ...items,
            added: {
                "color": "rgba(255,255,255,1)",
                "size": 1.2,
                "fontIcon": {
                    "color": "rgb(95, 227, 191)",
                    "text": "fa fa-car",
                    "font-weight": 900,
                    "font-family": "Font Awesome 5 Free Solid"
                },
                "border": {
                    "color": "pink",
                    //"width": 4
                },
                "label": [
                    {
                        "text": "This is an added node",
                        "position": "s"
                    },
                    {
                        "text": "(added node)",
                        color: "rgba(200, 200, 200, 0.5)"
                    }
                ],
                "entityType": "title"
            },
            "node_artist_Eddie_Fisher_node_added": { 
                id1: "node_artist_Eddie Fisher",
                id2: "added",
                label: { text: "onAdded", backgroundColor: "rgba(255, 255, 255, 0.5)" }
            }
        }));
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

    const context = useContext(MarkLogicContext);

    if (!context.searchResponse) {
        return <div>No results</div>;
    }

    console.log('searchResponse.results', context.searchResponse.results.map(result => result.extracted.content));

    if (Object.keys(items).length === 0) {
        const attributeValuesConfig = [
            'weeks/@last'
        ];
            
        const extractedContentAsJSON = [];
        for (let i = 0; i < context.searchResponse.results.length; i++) {
            extractedContentAsJSON.push(convertExtractedDataToJSON(context.searchResponse.results[i].extracted.content, attributeValuesConfig));
        }
    
        setItems(() => createGraphObject(extractedContentAsJSON, linksConfig));
    }

    const options = {
        "navigation": true,
        "overview": false,
        "backgroundColor": "pink",
        "iconFontFamily": "Font Awesome 5 Free Solid",
        "fit": "auto"
    };

    console.log('items', items);
      
    return (
        <div id="test" style={{ height: '800px' }}>
            <NetworkGraph
                items={items}
                settings={{ layout, options: options }}
                onSelectNode={onSelectNodeHandler}
                onDoubleClickNode={onDoubleClickNodeHandler}
            />

        </div>
      );

}

export default NetworkGraphSearchExample;