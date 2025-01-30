//import { MarkLogicContext, NetworkGraph } from "ml-fasttrack";
//import { useContext, useEffect, useState } from "react";

import { MarkLogicContext, NetworkGraph } from "ml-fasttrack";
import { useContext, useEffect, useState } from "react";
import TimelineEmailSearch from "./TimelineEmailSearch";
import { Card, CardBody, CardHeader, CardTitle, GridLayout, GridLayoutItem } from "@progress/kendo-react-layout";
import { Button } from "@progress/kendo-react-buttons";
import { xIcon } from '@progress/kendo-svg-icons';
import parse from 'html-react-parser';

interface Props {
    alertURI: string;
}

const AlertGraphTimeline = ({ alertURI }: Props) => {
    const context = useContext(MarkLogicContext);
    const [ results, setResults ] = useState({ docs: [], graph: {} });
    const [ detailViewDoc, setDetailViewDoc ] = useState(null);

    const layout = { orientation: 'down', curvedLinks: true };

    useEffect(() => {
        context.request({
            url: '/v1/eval',
            method: 'POST',
            data: {
                javascript: `
                    'use strict';

                    const docs = Array.from(cts.doc("/alert/trades/BT-2000-04-11-012.json").xpath('/alert/(URI | referringDocs)')).map(uri => {
                         const doc = cts.doc(uri).toObject();
                          var result = new NodeBuilder();
                            cts.highlight(doc, cts.wordQuery(cts.doc("/dictionary/supervision.xml").xpath("//xmlns:word/text()", {"xmlns":"http://marklogic.com/xdmp/spell"}).toArray()),
                            function(builder,text,node,queries,start) {
                                builder.addText( \`<b>\${text}</b>\`)
                              }, result
                            );

                        
                         let json = xdmp.toJSON( xdmp.unquote(xdmp.quote( result.toNode()))).toObject()
                       
                        const rootKey = Object.keys(json)[0];
                        json[rootKey].uri = uri;
                        return json;
                    });

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

                    function getNodeConfig(type, labelText) {
                        const nodeConfig = JSON.parse(JSON.stringify(nodeConfigs.find(nodeConfig => nodeConfig.type === type)));
                        nodeConfig.label[0].text = labelText;
                        return nodeConfig;
                    }

                    function createLink(node1, node2, text) {
                        return {
                            id1: node1,
                            id2: node2,
                            label: { text: text, backgroundColor: "rgba(255, 255, 255, 0.8)" },
                            end1: { arrow: false },
                            end2: { arrow: true }
                        };
                    }

                    const graph = {};

                    const trade = docs.filter(doc => doc.trade)[0].trade;

                    graph['trade'] = getNodeConfig('trade', trade.uri);

                    graph['tradeID'] = getNodeConfig('leaf', trade.TradeID);
                    graph['trade_tradeID'] = createLink('trade', 'tradeID', 'hasTradeID');

                    graph['tradeDateTime'] = getNodeConfig('leaf', trade.TradeDateTime);
                    graph['trade_tradeDateTime'] = createLink('trade', 'tradeDateTime', 'hasTradeDateTime');

                    graph[trade.Client.Name] = getNodeConfig('leaf', trade.Client.Name);
                    graph['trade_tradeClientName'] = createLink('trade', trade.Client.Name, 'hasClientName');

                    const emails = docs.filter(doc => doc.email).map(doc => doc.email);

                    emails.forEach((email, i) => {
                        const eReplace = (email) => email.replace(/(\\w+)\.(\\w+)@.*/, "$1 $2").replace(/(\\b[a-z](?!\\s))/g, function(x){return x.toUpperCase();});
                        const eX = 'email-' + i;
                        graph[eX] = getNodeConfig('email', email.uri);
                        graph[eX + '_trade'] = createLink(eX, 'trade', 'hasAssociationWith');
                    
                        graph[eX + 'emailDateTime'] = getNodeConfig('leaf', email.headers['date-metas'].dateTime);
                        graph[eX + 'emailDateTime_' + eX ] = createLink(eX, eX + 'emailDateTime', 'hasEmailDateTime');
                    
                        const fromName = eReplace(email.headers['tofrom-metas']['email-from'].email);
                        graph[fromName] = getNodeConfig('leaf', fromName);
                        graph[eX + 'emailFromName_' + eX] = createLink(eX, fromName, 'hasEmailFromName');

                        const toName = eReplace(email.headers['tofrom-metas']['email-to'].email[0]);
                        graph[toName] = getNodeConfig('leaf', toName);
                        graph[eX + 'emailToName_' + eX] = createLink(eX, toName, 'hasEmailToName');
                    });

                    const transcripts = docs.filter(doc => doc.transcript).map(doc => doc.transcript);

                    transcripts.forEach((transcript, i) => {
                        const tX = 'transcript-' + i;
                        graph[tX] = getNodeConfig('transcript', transcript.uri);
                        graph[tX + '_trade'] = createLink(tX, 'trade', 'hasAssociationWith');
                    
                        graph[tX + 'transcriptDateTime'] = getNodeConfig('leaf', transcript.metadata.dateTime);
                        graph[tX + 'transcriptDateTime_' + tX ] = createLink(tX, tX + 'transcriptDateTime', 'hasTranscriptDateTime');
                    
                        const caller1Name = transcript.metadata.caller1.name;
                        graph[caller1Name] = getNodeConfig('leaf', caller1Name);
                        graph[tX + 'transcriptCaller1Name_' + tX] = createLink(tX, caller1Name, 'hasTranscriptCallerName');

                        const caller2Name = transcript.metadata.caller2.name;
                        graph[caller2Name] = getNodeConfig('leaf', caller2Name);
                        graph[tX + 'transcriptCaller2Name_' + tX] = createLink(tX, caller2Name, 'hasTranscriptCallerName');
                    });

                    const result = {
                        "docs": docs,
                        "graph": graph
                    };

                    result;
                `,
                vars: '{ "alertURI": "' + alertURI + '"}'
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'multipart/mixed; boundary=BOUNDARY'
            }
        }).then(response => {
            const json = JSON.parse(response.replace(/^.*Primitive:\smap\s+(.*)\s\-\-BOUNDARY.*$/s, "$1"));
            setResults(json);
        })
    }, []);

    const options = {
        "navigation": true,
        "overview": false,
        "backgroundColor": "pink",
        "iconFontFamily": "Font Awesome 5 Free Solid",
        "fit": "auto"
    };

    const selectNodeHandler = (evt) => {
        //console.log('selectNodeHandler', evt);
    };

    const doubleClickNodeHandler = (evt) => {
        const uri = evt.label[0].text;
        const doc = results.docs.find(doc => {
            const rootKey = Object.keys(doc)[0];
            return uri === doc[rootKey].uri;
        });
        setDetailViewDoc(doc);
    };

    const closeCard = () => {
        setDetailViewDoc(null);
    };

    const renderEmail = (doc) => {
        const e = doc.email.instance;
        return <div>
                <div><span className="rLabel">From:</span> { e.From }</div>
                <div><span className="rLabel">To:</span> { e.To }</div>
                <div><span className="rLabel">Date:</span> { e.Date }</div>
                <div><span className="rLabel">Subject:</span> { e.Subject }</div>
                <div><span className="rLabel">Text:</span></div>
                <div className="textIndent1">{ e.body[0].split("\\\\n").map((t, i) => <p key={ 'e-p-' + i }>{parse(t)}</p>) }</div>
            </div>;
    };

    const renderTrade = (doc) => {
        const t = doc.trade;
        return <div>
                <div><span className="rLabel">AccountNumber:</span> { t.AccountNumber }</div>
                <div><span className="rLabel">Broker:</span> { t.Broker }</div>
                <div><span className="rLabel">Client:</span></div>
                <div className="textIndent1">
                    <div><span className="rLabel">Address:</span> { t.Client.Address }</div>
                    <div><span className="rLabel">Email:</span> { t.Client.Email }</div>
                    <div><span className="rLabel">Name:</span> { t.Client.Name }</div>
                    <div><span className="rLabel">Phone:</span> { t.Client.Phone }</div>
                </div>
                <div><span className="rLabel">Commission:</span> { t.Commission }</div>
                <div><span className="rLabel">Fees:</span> { t.Fees }</div>
                <div><span className="rLabel">PaymentMethod:</span> { t.PaymentMethod }</div>
                <div><span className="rLabel">Price:</span> { t.Price }</div>
                <div><span className="rLabel">Quantity:</span> { t.Quantity }</div>
                <div><span className="rLabel">Security:</span></div>
                <div className="textIndent1">
                    <div><span className="rLabel">Exchange:</span> { t.Security.Exchange }</div>
                    <div><span className="rLabel">Name:</span> { t.Security.Name }</div>
                    <div><span className="rLabel">Symbol:</span> { t.Security.Symbol }</div>
                </div>
                <div><span className="rLabel">SettlementDate:</span> { t.SettlementDate }</div>
                <div><span className="rLabel">TotalAmount:</span> { t.TotalAmount }</div>
                <div><span className="rLabel">TradeDate:</span> { t.TradeDate }</div>
                <div><span className="rLabel">TradeID:</span> { t.TradeID }</div>
                <div><span className="rLabel">TradeTime:</span> { t.TradeTime }</div>
                <div><span className="rLabel">Transaction:</span> { t.Transaction }</div>
                <div><span className="rLabel">TradeDateTime:</span> { t.TradeDateTime }</div>
            </div>;
    };

    const renderTranscript = (doc) => {
        const t = doc.transcript;
        return <div>
                <div><span className="rLabel">Caller:</span> { t.metadata.caller1.name } ({ t.metadata.caller1.role })</div>
                <div><span className="rLabel">Caller:</span> { t.metadata.caller2.name } ({ t.metadata.caller2.role })</div>
                <div><span className="rLabel">Datetime:</span> { t.metadata.dateTime }</div>
                <div><span className="rLabel">Subject:</span> { t.metadata.subject }</div>
                <div><span className="rLabel">Transcript:</span></div>
                <div className="textIndent1">{ t.transcriptText[0].split("\n\n").map((t, i) => <p key={ 't-p-' + i }>{parse(t)}</p>) }</div>
            </div>;
    };

    const docRender = (doc) => {
        switch (Object.keys(doc)[0]) {
            case 'email': return renderEmail(doc);
            case 'trade': return renderTrade(doc);
            case 'transcript': return renderTranscript(doc);
        }
    };

    const displayRHS = () => {
        if (detailViewDoc) {
            const uri = detailViewDoc[Object.keys(detailViewDoc)[0]].uri;
            return <Card style={{ width: '100%', height: '95%' }}>
                        <CardHeader>
                            <div className="container">
                                <span className="rLabel">{ uri }</span>
                                <Button svgIcon={xIcon} fillMode="flat" onClick={() => closeCard()} />
                            </div>
                            <style>{`
                                .container {
                                    display: flex;            /* Enables flexbox layout */
                                    justify-content: space-between; /* Distributes items with space between them */
                                    align-items: center;      /* Vertically aligns items in the container */
                                    width: 100%;              /* Adjust as needed */
                                }
                            `}</style>
                        </CardHeader>
                        <CardBody style={{ overflow: 'auto' }}>
                            { docRender(detailViewDoc) }
                        </CardBody>
                    </Card>;
        } else {
            return <TimelineEmailSearch data={results.docs}/>;
        }
    };

    return (
        <>
            <GridLayout
                cols={[ { width: "50%" }, { width: "50%" } ]}
                style={{ height: "100%", padding: 10 }}
            >
                <GridLayoutItem row={1} col={1} style={{ paddingRight: 20 }}>
                    <NetworkGraph
                        items={results.graph}
                        settings={{
                            layout,
                            options: options
                        }}
                        height={'95%'}
                        width={'100%'}
                        onSelectNode={selectNodeHandler}
                        onDoubleClickNode={doubleClickNodeHandler}
                    />
                </GridLayoutItem>
                <GridLayoutItem row={1} col={2} style={{}}>
                    { displayRHS() }
                </GridLayoutItem>
            </GridLayout>
            <style>{`
                span.rLabel {
                    font-weight: bold;
                }
                div.textIndent1 {
                    padding-left: 20px;
                }
            `}</style>
        </>
    );

    /*
    return (
        <>
            <div className="ngs-container">
                <NetworkGraph
                    items={results.graph}
                    settings={{
                        layout,
                        options: options
                    }}
                    height={'100%'}
                    width={'100%'}
                />
            </div>
            <style>{`
                xdiv.ngs-container {
                    width: calc(100vw - 282px);
                    height: calc(100vh - 350px);
                }
            `}</style>
            <TimelineEmailSearch data={timelineData}/>
        </>
    );
    */

}

export default AlertGraphTimeline;