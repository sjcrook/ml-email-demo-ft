//import { APP_CONFIG } from "../local";
import { useContext, useEffect, useState } from "react";
import { DataGrid, MarkLogicContext } from "ml-fasttrack";
import { GridLayout, GridLayoutItem } from "@progress/kendo-react-layout";
import { Dialog, DialogActionsBar } from '@progress/kendo-react-dialogs';
import { Button } from '@progress/kendo-react-buttons';
import AlertGraphTimeline from "../components/AlertGraphTimeline";

const AlertsPage = () => {
    const context = useContext(MarkLogicContext);
    const [ results, setResults ] = useState(null);
    const [ alertURI, setAlertURI ] = useState(null);

    
    
    const trade = async (uri : string) => {
        return context.getDocument(uri).then( doc => {
           // console.log("doc:"+JSON.stringify(doc.trade.Broker));
            return {
                broker: doc.trade.Broker, 
                security: doc.trade.Security.Symbol,
                date: doc.trade.TradeDateTime 
            }
        })
    }
    
    useEffect(() => {
        context.request({
            url: '/v1/eval',
            method: 'POST',
            data: { javascript: 'cts.search(cts.collectionQuery("alerts"))' },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'multipart/mixed; boundary=BOUNDARY'
            }
        }).then(response => {
            const r = response.split("\r\n--BOUNDARY\r\n").slice(1).slice(0, -1).map(item => {
                const json = JSON.parse(item.replace(/^.*X\-URI:\s(.*.json?)\s+({.*)$/s, '{ "uri": "$1", "alert": $2 }'));
                json.alert = json.alert.alert;
                return json;
            })

            Promise.all(r.map(async item => {
                const typeCounts = { transcripts: 0, emails: 0 };
                const docDetails = await trade(item.alert.URI);
                item.alert.referringDocs.forEach(rD => typeCounts[rD.replace(/^\/(.*)\/.*$/, "$1")] += 1);
                  //  console.log("doc:"+JSON.stringify(docDetails));
                return {
                    uri: item.uri,
                    words: item.alert.triggerWords,
                    subject: docDetails.broker+"/"+ docDetails.security+"/"+docDetails.date, 
                    ...typeCounts
                }
            })).then(results => setResults(results));   
           
        })
    }, []);

    const toggleDialog = (uri) => {
        setAlertURI(uri);
    };

    // {"uri":"/alert/trades/BT-2000-04-11-012.json","typeCounts":{"transcripts":1,"emails":1}}

    return (
        <div>
            <GridLayout
                rows={[ { height: 'auto' } ]}
                cols={[ { width: "auto" } ]}
                style={{ padding: 30 }}
            >
                <GridLayoutItem row={1} col={1} style={{ }}>
                    <DataGrid
                        data={results}
                        gridColumns={[
                            { title: "Subject", field: "subject" },
                            { title: "Transcripts Count", field: "transcripts" },
                            { title: "Emails Count", field: "emails" },
                            { title: "Trigger words", field: "words"},
                            {
                                title: "Action",
                                cell: (props) => (
                                    <td 
                                        onClick={() => toggleDialog(props?.dataItem?.uri)} 
                                        style={{ color: '#0d6efd', cursor: 'pointer' }}
                                    >
                                        { (<span>{"View"}</span>)}
                                    </td>
                                )
                            }
                        ]}
                    />
                </GridLayoutItem>
            </GridLayout>
            {
                alertURI &&
                <Dialog title={'Alert: ' + alertURI } onClose={() => toggleDialog(null)} width={"100%"} height={"100%"}>
                    <AlertGraphTimeline alertURI={alertURI} />
                </Dialog>
            }
        </div>
    );
};

export default AlertsPage;