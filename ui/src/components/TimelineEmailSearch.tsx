import { Timeline } from "ml-fasttrack";

interface Props {
    data: any;
}

const TimelineEmailSearch = ({ data }: Props) => {
    const onTimelineClickHandler = (event) => {
        console.log('onTimelineClickHandler event data', event);
    };

    const config = {
        entityTypeConfig: {
            path: '$.*~'
        },
        entities: [
            {
                entityType: 'email',
                path: '$.email',
                label: 'uri',
                eventPath: '$',
                items: [
                    {
                        label: "headers['date-metas'].dateTime",
                        timePath: "headers['date-metas'].dateTime"
                    }
                ]
            },
            {
                entityType: 'trade',
                path: '$.trade',
                label: 'uri',
                eventPath: '$',
                items: [
                    {
                        label: 'TradeDateTime',
                        timePath: 'TradeDateTime'
                    }
                ]
            },
            {
                entityType: 'transcript',
                path: '$.transcript',
                label: 'uri',
                eventPath: '$',
                items: [
                    {
                        label: 'metadata.dateTime',
                        timePath: 'metadata.dateTime'
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