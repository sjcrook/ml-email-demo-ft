import { MarkLogicContext, NetworkGraph } from "ml-fasttrack";
import { useContext, useState } from "react";
import { convertExtractedDataToJSON } from "../utils/dataTransform";

/*
        artist1: {
            label: [{ text: 'Artist 1' }]
        },

        link1: {
            id1: 'title1',
            id2: 'label1',
            label: { text: 'onLabel' }
        },
*/

const NetworkGraphTestPage = () => {
    
    const [ layout, setLayout ] = useState({ orientation: 'down', curvedLinks: true });

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
                                obj[npn] = { label: [ { text: v[m] } ]}
                            }
                        }
                    }
                }
                for (let p = 0; p < npns.id1.length; p++) {
                    for (let q = 0; q < npns.id2.length; q++) {
                        let lpn = "link_" + npns.id1[p] + "_" + npns.id2[q];
                        if (!obj[lpn]) {
                            obj[lpn] = {
                                id1: npns.id1[p],
                                id2: npns.id2[q],
                                label: linksConfig[j].label
                            }            
                        }
                    }
                }
            }
        }
        return obj;
    }
    
    const context = useContext(MarkLogicContext);

    if (!context.searchResponse) {
        return <div>No results</div>;
    }

    const attributeValuesConfig = [
        'weeks/@last'
    ];

    const linksConfig = [
        { id1: "title", id2: "album", label: { text: "onAlbum" } },
        { id1: "album", id2: "label", label: { text: "onLabel" } },
        { id1: "title", id2: "genre", label: { text: "hasGenre" } },
        { id1: "title", id2: "writer", label: { text: "hasWriter" } },
        { id1: "title", id2: "artist", label: { text: "by" } }
    ];
    
    const extractedContentAsJSON = [];
    for (let i = 0; i < context.searchResponse.results.length; i++) {
        extractedContentAsJSON.push(convertExtractedDataToJSON(context.searchResponse.results[i].extracted.content, attributeValuesConfig));
    }

    const items = createGraphObject(extractedContentAsJSON, linksConfig);

    /*
    const items = {
        "node_Title1":{"label":[{"text":"Title1"}]}, "node_Album1":{"label":[{"text":"Album1"}]}, "link_node_Title1_node_Album1":{"id1":"node_Title1", "id2":"node_Album1", "label":{"text":"onAlbum"}}, "node_Label1":{"label":[{"text":"Label1"}]}, "link_node_Album1_node_Label1":{"id1":"node_Album1", "id2":"node_Label1", "label":{"text":"onLabel"}}, "node_Genre1":{"label":[{"text":"Genre1"}]}, "link_node_Title1_node_Genre1":{"id1":"node_Title1", "id2":"node_Genre1", "label":{"text":"hasGenre"}}, "node_Writer1":{"label":[{"text":"Writer1"}]}, "node_Writer2":{"label":[{"text":"Writer2"}]}, "link_node_Title1_node_Writer1":{"id1":"node_Title1", "id2":"node_Writer1", "label":{"text":"hasWriter"}}, "link_node_Title1_node_Writer2":{"id1":"node_Title1", "id2":"node_Writer2", "label":{"text":"hasWriter"}}, "node_Artist1":{"label":[{"text":"Artist1"}]}, "link_node_Title1_node_Artist1":{"id1":"node_Title1", "id2":"node_Artist1", "label":{"text":"by"}}, "node_Title2":{"label":[{"text":"Title2"}]}, "link_node_Title2_node_Album1":{"id1":"node_Title2", "id2":"node_Album1", "label":{"text":"onAlbum"}}, "node_Genre2":{"label":[{"text":"Genre2"}]}, "link_node_Title2_node_Genre2":{"id1":"node_Title2", "id2":"node_Genre2", "label":{"text":"hasGenre"}}, "node_Writer3":{"label":[{"text":"Writer3"}]}, "link_node_Title2_node_Writer1":{"id1":"node_Title2", "id2":"node_Writer1", "label":{"text":"hasWriter"}}, "link_node_Title2_node_Writer3":{"id1":"node_Title2", "id2":"node_Writer3", "label":{"text":"hasWriter"}}, "link_node_Title2_node_Artist1":{"id1":"node_Title2", "id2":"node_Artist1", "label":{"text":"by"}}

        title1: {
            label: [{ text: 'Title 1' }]
        },
        label1: {
            label: [{ text: 'Label 1' }]
        },
        album1: {
            label: [{ text: 'Album 1' }]
        },
        genre1: {
            label: [{ text: 'Genre 1' }]
        },
        writer1: {
            label: [{ text: 'Writer 1' }]
        },
        artist1: {
            label: [{ text: 'Artist 1' }]
        },


        link1: {
            id1: 'title1',
            id2: 'label1',
            label: { text: 'onLabel' }
        },
        link2: {
            id1: 'title1',
            id2: 'album1',
            label: { text: 'onAlbum' }
        },
        link3: {
            id1: 'title1',
            id2: 'genre1',
            label: { text: 'hasGenre' }
        },
        link4: {
            id1: 'title1',
            id2: 'writer1',
            label: { text: 'writtenBy' }
        },
        link5: {
            id1: 'title1',
            id2: 'artist1',
            label: { text: 'hasArtist' }
        },


        title2: {
            label: [{ text: 'Title 2' }]
        },


        link6: {
            id1: 'title2',
            id2: 'label1',
            label: { text: 'onLabel' }
        }

    };
    */
     
    /*const settings = {
        options: {
            navigation: true,
            backgroundColor: 'black',
            curvedLinks: true
        }
    };*/

    console.log('here');

    const settings = {
        curvedLinks: true,
        orientation: 'up'
    };
      
      return (
        <div id="test" style={{ height: '800px' }}>
          <NetworkGraph
            items={items}
            settings={{ layout, options: {backgroundColor: 'blue', navigation: true }}}
          />
        </div>
      );

}

export default NetworkGraphTestPage;