import { Timeline } from "ml-fasttrack";

interface Props {
    data: any;
}

const TimelineEmailSearch = ({ data }: Props) => {
    const onTimelineClickHandler = (event) => {
        console.log('onTimelineClickHandler event data', event);
    };
  
    const config = {
        entities: [
            {
                entityType: 'email',
                path: '$',
                label: 's',
                eventPath: '$',
                items: [
                    {
                        label: 'label',
                        timePath: 'dateTime'
                    }
                ],
                detailConfig: [
                    {
                        "label": "URI",
                        "path": "uri"
                    }, {
                        "label": "DateTime",
                        "path": "dateTime"
                    }, {
                        "label": "Entity Type",
                        "path": "entityType"
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
                        label: 'label',
                        timePath: 'dateTime'
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
                        label: 'label',
                        timePath: 'dateTime'
                    }
                ]
            }
        ]
    };

    const containerStyle = {
        "height": "80vh" //"250px"
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

    const windowConfig = {
        title: "Event Info",
        initialHeight: 150,
        initialWidth: 240,
        draggable: true
    };

 //            windowSettings={windowConfig}
   
    return (
        <Timeline
            data={data}
            config={config}
            containerStyle={containerStyle}
            settings={settings}
            onTimelineClick={onTimelineClickHandler}
            showTooltip={false}
        />
    );
}

export default TimelineEmailSearch;