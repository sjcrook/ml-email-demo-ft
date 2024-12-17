import { MarkLogicContext, Timeline } from "ml-fasttrack";
import { useContext } from "react";
import { convertExtractedDataToJSON } from "../utils/dataTransform";

const TimelineExample = () => {
    const context = useContext(MarkLogicContext);

    if (context.searchResponse) {
        const data = context.searchResponse.results.map(result => ({
            uri: result.uri,
            extracted : {
                song: convertExtractedDataToJSON(result.extracted.content, [ 'weeks/@last' ])
            }
        }));

        const config = {
            "entityTypeConfig": {
                "path": "extracted.*~"
            },
            "entities": [
                {
                    "entityType": "song",
                    "path": "extracted.song",
                    "label": "title",
                    "eventPath": "$",
                    "items": [
                        {
                            "label": "weeks",
                            "timePath": "weeks"
                        }
                    ],
                    "detailConfig": [
                        {
                            "label": "Title",
                            "path": "title"
                        },
                        {
                            "label": "Artist",
                            "path": "artist"
                        },
                        {
                            "label": "Last week in charts",
                            "path": "weeks"
                        },
                        {
                            "label": "Album",
                            "path": "album"
                        },
                        {
                            "label": "Genre",
                            "path": "genre"
                        },
                        {
                            "label": "Writer",
                            "path": "writer"
                        }
                    ]
                }
            ]
        };

        const containerStyle = {
            "height": "400px"
        };
          
        const settings = {
            "entityTypes": {
                "default": {
                    "labelColor": "#000000"
                }
            },
            "options": {
                "backgroundColor": "white",
                "focus": {
                    "backgroundColor": "#8CEDD0"
                },
                "scales": {
                    "textColor": "#000000"
                }
            }
        };
      
        return (
            <Timeline
                data={data}
                config={config}
                containerStyle={containerStyle}
                settings={settings}
            />
        );      
    } else {
        return "Run search first";
    }
}

export default TimelineExample;