import { Timeline } from "ml-fasttrack";

const TimelineEventDataExample = () => {
    const onTimelineClickHandler = (event) => {
        console.log('onTimelineClickHandler event data', event);
    };

    const data = [
        {
            "uri": "/person/1001.json",
            "extracted": {
                "kind": "array",
                "content": [
                    {
                        "envelope": {
                            "entityType": "person",
                            "id": 1001,
                            "firstName": "Nerta",
                            "lastName": "Hallwood",
                            "title": "Marketing Manager",
                            "status": "active",
                            "activities": [
                                {
                                    "description": "Started at Fadeo",
                                    "ts": "2013-06-22"
                                },
                                {
                                    "description": "Promoted",
                                    "ts": "2019-08-15"
                                },
                                {
                                    "description": "Fired!",
                                    "ts": "2021-03-23"
                                }
                            ]
                        }
                    }
                ]
            }
        },
        // more results...
    ];

    const config = {
        entityTypeConfig: {
            path: "extracted.content[0].envelope.entityType"
        },
        entities: [
            {
                entityType: 'person',
                path: 'extracted.content[0].envelope',
                label: 'lastName',
                eventPath: 'activities',
                items: [
                    {
                        label: 'description',
                        timePath: 'ts'
                    },           
                ],
                detailConfig: [
                    {
                        label: 'First Name',
                        path: 'firstName'
                    },
                    {
                    label: 'Last Name',
                    path: 'lastName'
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
        },
        eventTypes: {
            default: {
                fontIcon: {
                    fontFamily: "Font Awesome 5 Free",
                    fontWeight: 900,
                    text: "\uf101"
                }
            },
            "Started at Fadeo": {
                color: "orange"
            },
            "Promoted": {
                color: "fuchsia"
            },
            "Fired!": {
                color: "red"
            }
        }
    };
    
    return (
        <div>
            <div>Timeline start 1</div>
                <Timeline
                    data={data}
                    config={config}
                    containerStyle={containerStyle}
                    settings={settings}
                    showTooltip={true}
                    onTimelineClick={onTimelineClickHandler}
                />
            <div>Timeline end 2</div>
        </div>
    );
}

export default TimelineEventDataExample;