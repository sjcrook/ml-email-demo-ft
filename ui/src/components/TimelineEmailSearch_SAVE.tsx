import { Timeline } from "ml-fasttrack";

interface Props {
    data: any;
}

const TimelineEmailSearch = ({ data }: Props) => {
    console.log('TimelineEmailSearch', data);

    const onTimelineClickHandler = (event) => {
        console.log('onTimelineClickHandler event data', event);
    };

    /*
    const dataCurrentx = [
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
    */
/*
    const data2 = [
        {
            "uri": "/songs/Helen-Reddy+I-Am-Woman.xml",
            "extracted": {
                "song": {
                    "title": "I Am Woman",
                    "weeks": "1972-12-09"
                }
            }
        },
        {
            "uri": "/songs/Helen-Reddy+I-Am-Woman.xml2",
            "extracted": {
                "song2": {
                    "title": "I Am Woman",
                    "weeks": "1972-12-09"
                }
            }
        }
    ];


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
                ]
            },
            {
                "entityType": "song2",
                "path": "extracted.song2",
                "label": "title",
                "eventPath": "$",
                "items": [
                    {
                        "label": "weeks",
                        "timePath": "weeks"
                    }
                ]
            }
        ]
    };
*/
/*
    const data2 = [
        {
            "uri": "1",
            "detail": {
                "trade": {
                    "s": "trade",
                    "p": "hasTradeDateTime",
                    "o": "2000-04-11T17:45:00Z",
                    "entityType": "trade"
                }
            }
        },
        {
            "uri": "2",
            "detail": {
                "transcript": {
                    "s": "transcript-0",
                    "p": "hasTranscriptDateTime",
                    "o": "2000-04-11T10:22:00.000Z",
                    "entityType": "transcript"
                }
            }
        },
        {
            "uri": "3",
            "detail": {
                "email": {
                    "s": "email-1",
                    "p": "hasEmailDateTime",
                    "o": "2000-04-11T08:25:00.000Z",
                    "entityType": "email"
                }
            }
        }
    ];

    const config = {
        entityTypeConfig: {
            path: "detail.*~"
        },
        entities: [
            {
                entityType: 'email',
                path: 'detail.email',
                eventPath: "$",
                label: 's',
                items: [
                    {
                        label: 'o',
                        timePath: 'o'
                    }
                ]
            },
            {
                entityType: 'trade',
                path: 'detail.trade',
                eventPath: "$",
                label: 's',
                items: [
                    {
                        label: 'o',
                        timePath: 'o'
                    }
                ]
            },
            {
                entityType: 'transcript',
                path: 'detail.transcript',
                eventPath: "$",
                label: 's',
                items: [
                    {
                        label: 'o',
                        timePath: 'o'
                    }
                ]
            }
        ]
    };
*/
/*
    const data2 = [
        {
            "uri": "1",
                "trade": {
                    "s": "trade",
                    "p": "hasTradeDateTime",
                    "o": "2000-04-11T17:45:00Z",
                    "entityType": "trade"
                }
        },
        {
            "uri": "2",
                "transcript": {
                    "s": "transcript-0",
                    "p": "hasTranscriptDateTime",
                    "o": "2000-04-11T10:22:00.000Z",
                    "entityType": "transcript"
                }
        },
        {
            "uri": "3",
                "email": {
                    "s": "email-1",
                    "p": "hasEmailDateTime",
                    "o": "2000-04-11T08:25:00.000Z",
                    "entityType": "email"
                }
        }
    ];

    const config = {
        entityTypeConfig: {
            path: "$*~"
        },
        entities: [
            {
                entityType: 'email',
                path: 'email',
                eventPath: "$",
                label: 's',
                items: [
                    {
                        label: 'o',
                        timePath: 'o'
                    }
                ]
            },
            {
                entityType: 'trade',
                path: 'trade',
                eventPath: "$",
                label: 's',
                items: [
                    {
                        label: 'o',
                        timePath: 'o'
                    }
                ]
            },
            {
                entityType: 'transcript',
                path: 'transcript',
                eventPath: "$",
                label: 's',
                items: [
                    {
                        label: 'o',
                        timePath: 'o'
                    }
                ]
            }
        ]
    };
*/
/*
/// WORKING 
const data2 = [
    {
        "uri": "1",
        "s": "trade",
        "p": "hasTradeDateTime",
        "o": "2000-04-11T17:45:00Z",
        "entityType": "trade"
    },
    {
        "uri": "2",
        "s": "transcript-0",
        "p": "hasTranscriptDateTime",
        "o": "2000-04-11T10:22:00.000Z",
        "entityType": "transcript"
    },
    {
        "uri": "3",
        "s": "email-1",
        "p": "hasEmailDateTime",
        "o": "2000-04-11T08:25:00.000Z",
        "entityType": "email"
    }
];
  
  const config = {
        entities: [
            {
                entityType: 'email',
                path: '$',
                label: 's',
                eventPath: '$',
                items: [
                    {
                        label: 's',
                        timePath: 'o'
                    }
                ]
            },
            {
                entityType: 'trade',
                path: '$',
                label: 's',
                eventPath: '$',
                items: [
                    {
                        label: 's',
                        timePath: 'o'
                    }
                ]
            },
            {
                entityType: 'transcript',
                path: '$',
                label: 's',
                eventPath: '$',
                items: [
                    {
                        label: 's',
                        timePath: 'o'
                    }
                ]
            }
        ]
    };
*/

    const data2 = [
        {
            "trade": {
                "TradeID": "Trade1234",
                "TradeDateTime": "2000-04-11T17:45:00Z"
            },
            "uri": "/trades/BT-2000-04-11-012.json"
        }/*,
        {
            "transcript": {
                "metadata": {
                    "dateTime": "2000-04-11T10:22:00.000Z",
                    "subject": "transcript subject"
                }
            },
            "uri": "/transcripts/12411311491770357731.json"
        },
        {
            "email": {
                "headers": {
                    "date-metas": {
                        "dateTime": "2000-04-11T08:25:00.000Z"
                    }
                },
                "instance": {
                    "Subject": "email subject"
                }
            },
            "uri": "/emails/62bf7683-63b7-4465-9420-f3azazeree9b.json"
        }*/
    ];

    const config = {
        "entityTypeConfig": {
            "path": "$"
        },
        "entities": [
            {
                "entityType": "trade",
                "path": "trade",
                "label": "TradeID",
                "eventPath": "$",
                "items": [
                    {
                        "label": "TradeDateTime",
                        "timePath": "TradeDateTime"
                    }
                ]
            }/*,
            {
                "entityType": "transcript",
                "path": "transcript",
                "label": "metadata.subject",
                "eventPath": "$",
                "items": [
                    {
                        "label": "metadata.dateTime",
                        "timePath": "metadata.dateTime"
                    }
                ]
            },
            {
                "entityType": "email",
                "path": "email",
                "label": "instance.Subject",
                "eventPath": "$",
                "items": [
                    {
                        "label": "headers['date-metas'].dateTime",
                        "timePath": "headers['date-metas'].dateTime"
                    }
                ]
            }*/
        ]
    };


    const containerStyle = {
        "height": "250px"
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
        <div>
            <div>START</div>
            <Timeline
                data={data2}
                config={config}
                containerStyle={containerStyle}
                settings={settings}
                showTooltip={true}
                onTimelineClick={onTimelineClickHandler}
            />
            <div>END</div>
        </div>
    );
}

export default TimelineEmailSearch;