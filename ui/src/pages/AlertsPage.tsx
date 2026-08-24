//import { APP_CONFIG } from "../local";
import { useContext, useEffect, useState } from "react";
import { DataGrid, MarkLogicContext } from "ml-fasttrack";
import { GridLayout, GridLayoutItem } from "@progress/kendo-react-layout";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { Button } from "@progress/kendo-react-buttons";
import AlertGraphTimeline from "../components/AlertGraphTimeline";

const MAX_CONCURRENT_TRADE_REQUESTS = 4;

const runWithConcurrency = async <T,>(
  tasks: Array<() => Promise<T>>,
  limit = MAX_CONCURRENT_TRADE_REQUESTS,
): Promise<T[]> => {
  const results = new Array<T>(tasks.length);
  let nextTaskIndex = 0;

  const worker = async () => {
    while (nextTaskIndex < tasks.length) {
      const taskIndex = nextTaskIndex++;
      results[taskIndex] = await tasks[taskIndex]();
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(limit, tasks.length) }, worker),
  );
  return results;
};

const AlertsPage = () => {
  const context = useContext(MarkLogicContext);
  const [results, setResults] = useState<any[]>([]);
  const [alertURI, setAlertURI] = useState(null);
  const [expandedRowUri, setExpandedRowUri] = useState(null);

  const trade = async (uri: string) => {
    return context.getDocument(uri).then((doc) => {
      // console.log("doc:"+JSON.stringify(doc.trade.Broker));
      context.setDocumentResponse(null);
      return {
        broker: doc.trade.Broker,
        security: doc.trade.Security.Symbol,
        date: doc.trade.TradeDateTime,
      };
    });
  };

  useEffect(() => {
    context
      .request({
        url: "/v1/eval",
        method: "POST",
        data: { javascript: 'cts.search(cts.collectionQuery("alerts"))' },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "multipart/mixed; boundary=BOUNDARY",
        },
      })
      .then((response) => {
        const r = response
          .split("\r\n--BOUNDARY\r\n")
          .slice(1)
          .slice(0, -1)
          .map((item) => {
            const json = JSON.parse(
              item.replace(
                /^.*X\-URI:\s(.*.json?)\s+({.*)$/s,
                '{ "uri": "$1", "alert": $2 }',
              ),
            );
            json.alert = json.alert.alert;
            return json;
          });

        runWithConcurrency<any>(
          r.map((item) => async () => {
            const typeCounts = { transcripts: 0, emails: 0 };
            const docDetails = await trade(item.alert.URI);
            item.alert.referringDocs.forEach(
              (rD) => (typeCounts[rD.replace(/^\/(.*)\/.*$/, "$1")] += 1),
            );
            //  console.log("doc:"+JSON.stringify(docDetails));
            return {
              uri: item.uri,
              words: item.alert.triggerWords,
              relatedUris: Array.from(
                new Set([item.alert.URI, ...item.alert.referringDocs]),
              ),
              subject:
                docDetails.broker +
                "/" +
                docDetails.security +
                "/" +
                docDetails.date,
              securityCount: typeCounts.transcripts + typeCounts.emails,
              ...typeCounts,
            };
          }),
        ).then((results) => setResults(results));
      });
  }, []);

  const toggleDialog = (uri) => {
    context.setDocumentResponse(null);
    setAlertURI(uri);
  };

  const toggleExpandedRow = (uri) => {
    setExpandedRowUri((prev) => (prev === uri ? null : uri));
  };

  return (
    <div>
      <GridLayout
        className={"gridAlertResults"}
        rows={[{ height: "auto" }]}
        cols={[{ width: "auto" }]}
      >
        <GridLayoutItem row={1} col={1} style={{}}>
          <DataGrid
            data={results}
            gridColumns={[
              {
                title: "Subject",
                field: "subject",
                cell: (props) => {
                  const rowUri = props?.dataItem?.uri;
                  const isExpanded = expandedRowUri === rowUri;
                  const relatedUris = props?.dataItem?.relatedUris || [];
                  return (
                    <td
                      className="alertRowCell"
                      onClick={() => toggleExpandedRow(rowUri)}
                    >
                      <div className="alertRowSubject">{props?.dataItem?.subject}</div>
                      {isExpanded ? (
                        <div className="alertRelatedUris">
                          <div className="alertRelatedUrisTitle">Related URI documents</div>
                          <ul>
                            {relatedUris.map((relatedUri, index) => (
                              <li key={relatedUri + index}>{relatedUri}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </td>
                  );
                },
              },
              { title: "Security Count", field: "securityCount" },
              { title: "Trigger words", field: "words" },
              {
                title: "Action",
                cell: (props) => (
                  <td
                    //className={"actionToogle"}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDialog(props?.dataItem?.uri);
                    }}
                  >
                    {<span>{"View"}</span>}
                  </td>
                ),
              },
            ]}
          />
        </GridLayoutItem>
      </GridLayout>
      {alertURI && (
        <Dialog
          className={"toggleDialog"}
          title={"Alert: " + alertURI}
          width={"80vw"}
          height={"80vh"}
          onClose={() => toggleDialog(null)}
        >
          <AlertGraphTimeline alertURI={alertURI} />
        </Dialog>
      )}
    </div>
  );
};

export default AlertsPage;
