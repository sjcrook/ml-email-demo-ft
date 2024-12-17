//import { MarkLogicContext, NetworkGraph } from "ml-fasttrack";
//import { useContext, useEffect, useState } from "react";

import { MarkLogicContext, NetworkGraph } from "ml-fasttrack";
import { useContext, useEffect, useState } from "react";
import TimelineEmailSearch from "./TimelineEmailSearch";

interface Props {
    alertURI: string;
}

const AlertGraphTimeline = ({ alertURI }: Props) => {
    const context = useContext(MarkLogicContext);
    const [ results, setResults ] = useState([]);

    const layout = { orientation: 'down', curvedLinks: true };

    useEffect(() => {
        context.request({
            url: '/v1/eval',
            method: 'POST',
            data: {
                javascript: `

                    'use strict';

                    function mT(s, p, o) {
                        return { s: s, p: p, o: o };  
                    }

                    function getTranscriptTriples(rd, i) {
                        const results = [];
                        const transcript = cts.doc(rd).toObject().transcript;
                        results.push(mT('<transcript-' + i + '>', 'hasAssociationWith', '<trade>'));
                        results.push(mT('<transcript-' + i + '>', 'hasTranscriptDateTime', transcript.metadata.dateTime));  
                        results.push(mT('<transcript-' + i + '>', 'hasCallerName', transcript.metadata.caller1.name));
                        results.push(mT('<transcript-' + i + '>', 'hasCallerName', transcript.metadata.caller2.name));
                        return results;
                    }

                    function getEmailTriples(rd, i) {
                        //const eReplace = (email) => email.replace(/(\\w+)\.(\\w+)@.*/, "$1 $2").replace(/(\\b[a-z](?!\\s))/g, function(x){return x.toUpperCase();});
                        const eReplace = (email) => email.replace(/(\\w+)\.(\\w+)@.*/, "$1 $2").replace(/(\\b[a-z](?!\\s))/g, function(x){return x.toUpperCase();});
                        const results = [];
                        const email = cts.doc(rd).toObject().email;
                        results.push(mT('<email-' + i + '>', 'hasAssociationWith', '<trade>'));
                        results.push(mT('<email-' + i + '>', 'hasEmailDateTime', email.headers["date-metas"].dateTime));  
                        results.push(mT('<email-' + i + '>', 'hasFromName', eReplace(email.headers["tofrom-metas"]["email-from"].email)));  
                        results.push(mT('<email-' + i + '>', 'hasToName', eReplace(email.headers["tofrom-metas"]["email-to"].email[0])));  
                        return results;
                    }

                    const alert = cts.doc(alertURI).toObject().alert;

                    const results = [];

                    const trade = cts.doc(alert.URI).toObject().trade;

                    results.push(mT('<trade>', 'hasTradeID', trade.TradeID));
                    results.push(mT('<trade>', 'hasTradeDateTime', trade.TradeDateTime));
                    results.push(mT('<trade>', 'hasClientName', trade.Client.Name));


                    alert.referringDocs.forEach((rd, i) => {
                        if (rd[1] === 't') { // transcript
                            results.push(...getTranscriptTriples(rd, i));
                        } else { // email
                            results.push(...getEmailTriples(rd, i));
                        }
                    });

                    results;`,
                vars: '{ "alertURI": "' + alertURI + '"}'
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'multipart/mixed; boundary=BOUNDARY'
            }
        }).then(response => {
            const json = JSON.parse(response.replace(/^(.*array\s+)(.*)(\s+--BOUNDARY.*)$/s, "$2"));
            console.log(json);
            setResults(json);
        })
    }, []);

    let graph = {};

/*
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
*/
    const nodeConfigs = [
        {
            "color": "rgba(69, 255, 72, 0.13)",
            "fontIcon": {
                "color": "rgba(69, 255, 72, 0.5)",
                "text": "fa-envelope"
            },
            "border": {
                "color": "rgba(69, 255, 72, 0.5)",
                "width": 2
            },
            "label": [
                {
                    "text": "top label",
                    "position": "s"
                },
                {
                    "text": "(email)",
                    color: "rgba(200, 200, 200, 0.5)"
                }
            ],
            type: "email"
        }, {
            "color": "rgba(255,255,255,0)",
            /*"fontIcon": {
                "color": "rgb(30,144,255)",
                "text": "fa-user"
            },
            "border": {
                "color": "rgba(30,144,255, 0.5)"
            },*/
            "label": [
                {
                    "text": "top label",
                    "backgroundColor": "rgba(255,255,255,0)",
                    //"position": "s"
                }
            ],
            type: "leaf"
        }, {
            "color": "rgba(31, 143, 255, 0.13)",
            "fontIcon": {
                "color": "rgba(30, 144, 255, 0.5)",
                "text": "fa fa-handshake-simple"
            },
            "border": {
                "color": "rgba(30, 144, 255, 0.5)",
                "width": 2
            },
            "label": [
                {
                    "text": "top label",
                    "position": "s"
                },
                {
                    "text": "(trade)",
                    color: "rgba(200, 200, 200, 0.5)"
                }
            ],
            type: "trade"
        }, {
            "color": "rgba(255, 201, 31, 0.13)",
            "fontIcon": {
                "color": "rgba(255, 201, 31, 0.5)",
                "text": "fa-file-text"
            },
            "border": {
                "color": "rgba(255, 201, 31, 0.5)",
                "width": 2
            },
            "label": [
                {
                    "text": "top label",
                    "position": "s"
                },
                {
                    "text": "(transcript)",
                    color: "rgba(200, 200, 200, 0.5)"
                }
            ],
            type: "transcript"
        } 
    ];
    
    function getNodeConfig(type) {
        return nodeConfigs.find(nodeConfig => nodeConfig.type === type);
    }
    
    results.forEach(sr => {
        const newS = sr.s.replace(/<(.*)>/, "$1");
        const newSType = sr.s.replace(/<(.*?)(?:-\d+)?>/, "$1");
        const newO = sr.o.replace(/<(.*)>/, "$1");
        const newOType = sr.o.replace(/<(.*?)(?:-\d+)?>/, "$1");
      
        if (!graph[newS]) {
            const newNodeConfig = JSON.parse(JSON.stringify(getNodeConfig(newSType)));
            newNodeConfig.label[0].text = newS;
            graph[newS] = newNodeConfig;
        }
    
        if (!graph[newO]) {
            const newNodeConfig = JSON.parse(JSON.stringify(getNodeConfig(/^<.*>$/.test(sr.o) ? newOType : 'leaf')));
            newNodeConfig.label[0].text = newO;
            graph[newO] = newNodeConfig;
        }
        // links
        graph[newS + '_' + newO] = {
            id1: newS,
            id2: newO,
            label: { text: sr.p, backgroundColor: "rgba(255, 255, 255, 0.8)" },
            end1: { arrow: false },
            end2: { arrow: true }
        };
    });
    
    graph;

    const options = {
        "navigation": true,
        "overview": false,
        "backgroundColor": "pink",
        "iconFontFamily": "Font Awesome 5 Free Solid",
        "fit": "auto"
    };

    const filteredResults = results.filter(item => /^has(.*DateTime)$/.test(item.p)).map((item, i) => ({ uri: '/uri/' + i, ...item, s: item.s.replace(/^<(.*)>$/, "$1"), entityType: item.s.replace(/<(.*?)(?:-\d+)?>/, "$1") }));

    console.log('filteredResults', filteredResults);

    return (
        <>
            <div className="ngs-container">
                <NetworkGraph
                    items={graph}
                    settings={{
                        layout,
                        options: options
                    }}
                    height={'100%'}
                    width={'100%'}
                />
            </div>
            <style>{`
                div.ngs-container {
                    width: calc(100vw - 282px);
                    height: calc(100vh - 350px);
                }

                xdiv.ngs-container canvas {
                    position: absolute;
                    top: 4em;
                    bottom: 4em;
                    left: 4em;
                    right: 4em;
                }
            `}</style>
            <TimelineEmailSearch data={filteredResults}/>
        </>
    );

}

export default AlertGraphTimeline;