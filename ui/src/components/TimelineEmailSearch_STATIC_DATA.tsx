import { Timeline } from "ml-fasttrack";

const TimelineEmailSearch = () => {

  const data2 = [
    {
        "s": "trade",
        "p": "hasTradeDateTime",
        "o": "2000-04-11T17:45:00Z",
        "entityType": "trade"
    },
    {
        "s": "transcript-0",
        "p": "hasTranscriptDateTime",
        "o": "2000-04-11T10:22:00.000Z",
        "entityType": "transcript"
    },
    {
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

  return (
          <div  style={{ height: '100%', width: '100%', overflow: 'hidden' }}>
            <Timeline
              data={data2}
              config={config}
              theme={'light'}
            >
          </Timeline>
          </div>
  );
}

export default TimelineEmailSearch;
