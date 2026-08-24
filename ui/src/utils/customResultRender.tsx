import { Card, GridLayout, GridLayoutItem } from "@progress/kendo-react-layout";
import { Match } from "../entities/SearchResults";
import { Fragment } from "react/jsx-runtime";
import { Button } from "@progress/kendo-react-buttons";
import { codeIcon, cssIcon, fileIcon } from "@progress/kendo-svg-icons";
import { useEffect, useState } from "react";

const displayMatchText = (match: Match) => {
  const result = match["match-text"].map((item) => {
    if (typeof item === "string") {
      return item;
    } else {
      return (
        <span style={{ backgroundColor: "yellow" }}>{item.highlight}</span>
      );
    }
  });
  const first = result[0];
  if (typeof first === "string" && !first.startsWith("...")) {
    result.unshift("...");
  }
  const last = result[result.length - 1];
  if (typeof last === "string" && !last.startsWith("...")) {
    result.push("...");
  }
  return (
    <>
      {result.map((item, index) => (
        <Fragment key={"displayMatchText-" + index}>{item}</Fragment>
      ))}
    </>
  );
};

const displayMatches = (matches: Match[], index: number) => {
  return (
    <>
      {matches.map((match: Match, index2) => (
        <div key={"display-matches-" + index + "-" + index2}>
          {displayMatchText(match)}
        </div>
      ))}
    </>
  );
};

type ResultMetadata = {
  broker?: string;
  callers?: string[];
  client?: string;
  date?: string;
  from?: string;
  to?: string;
};

const extractResultMetadata = (preUri: string, doc: any): ResultMetadata | null => {
  // Root element is "email"/"transcript"/"trade" directly (see
  // datahub/src/main/ml-config/databases/final-database.json path-expressions),
  // not wrapped in a "content" array as originally assumed.
  switch (preUri) {
    case "/emails":
      return {
        date: doc?.email?.instance?.Date,
        from: doc?.email?.instance?.From,
        to: doc?.email?.instance?.To,
      };
    case "/transcripts":
      return {
        date: doc?.transcript?.metadata?.date,
        callers: [
          doc?.transcript?.metadata?.caller1?.name,
          doc?.transcript?.metadata?.caller2?.name,
        ].filter(Boolean),
      };
    case "/trades":
      return {
        date: doc?.trade?.TradeDate,
        client: doc?.trade?.Client?.Name,
        broker: doc?.trade?.Broker,
      };
    default:
      return null;
  }
};

// Module-scope cache/in-flight map keyed by uri: the ml-fasttrack result list
// re-mounts row components far more often than the visible data changes, so
// without this dedupe every remount re-issues a network call per row and the
// browser is quickly flooded with duplicate requests (ERR_INSUFFICIENT_RESOURCES).
const resultMetadataCache = new Map<string, ResultMetadata | null>();
const resultMetadataRequests = new Map<string, Promise<ResultMetadata | null>>();

const fetchResultMetadata = async (
  context: any,
  uri: string,
  preUri: string,
): Promise<ResultMetadata | null> => {
  if (resultMetadataCache.has(uri)) {
    return resultMetadataCache.get(uri) ?? null;
  }
  let request = resultMetadataRequests.get(uri);
  if (!request) {
    request = context
      .request({
        url: "/v1/documents",
        method: "GET",
        params: { uri, format: "json" },
      })
      .then((doc: any) => {
        const metadata = extractResultMetadata(preUri, doc);
        resultMetadataCache.set(uri, metadata);
        return metadata;
      })
      .catch(() => null) // don't cache request failures, so a later retry can succeed
      .finally(() => resultMetadataRequests.delete(uri)) as Promise<ResultMetadata | null>;
    resultMetadataRequests.set(uri, request);
  }
  return request;
};

const ResultCard = ({
  dataItem,
  index,
  handleResultClick,
  context,
}: {
  dataItem: any;
  index: number;
  handleResultClick: Function;
  context: any;
}) => {
  const preUri = dataItem.uri.substring(0, dataItem.uri.lastIndexOf("/"));
  const [metadata, setMetadata] = useState<ResultMetadata | null>(
    resultMetadataCache.get(dataItem.uri) ?? null,
  );

  useEffect(() => {
    let cancelled = false;
    fetchResultMetadata(context, dataItem.uri, preUri).then((resultMetadata) => {
      if (!cancelled) {
        setMetadata(resultMetadata);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [dataItem.uri]);


  const icon = dataItem?.uri.endsWith(".json")
    ? cssIcon
    : dataItem?.uri.endsWith(".xml")
      ? codeIcon
      : fileIcon;

  return (
    <Card
      style={{ padding: 10, marginTop: 10, marginBottom: 10 }}
      key={"searchresults-" + index}
    >
      <GridLayout>
        <GridLayoutItem row={1} col={1}>
          <Button
            themeColor={"base"}
            onClick={() => handleResultClick(dataItem.uri)}
            fillMode="outline"
            svgIcon={icon}
            style={{ float: "right" }}
          />
        </GridLayoutItem>
        <GridLayoutItem row={2} col={1} style={{ marginBottom: 10 }}>
          <span style={{ fontWeight: "bold" }}>
            {preUri}
            {metadata?.date ? `/${metadata.date}` : ""}
            {metadata?.from ? ` | From: ${metadata.from}` : ""}
            {metadata?.to ? ` | To: ${metadata.to}` : ""}
            {metadata?.callers?.length ? ` | Callers: ${metadata.callers.join(", ")}` : ""}
            {metadata?.client ? ` | Client: ${metadata.client}` : ""}
            {metadata?.broker ? ` | Broker: ${metadata.broker}` : ""}
          </span>
        </GridLayoutItem>
        <GridLayoutItem row={3} col={1} style={{ paddingLeft: 20 }}>
          {displayMatches(dataItem.matches, index)}
        </GridLayoutItem>
      </GridLayout>
    </Card>
  );
};

export const customResultRender = (
  dataItem: any,
  index: number,
  handleResultClick: Function,
  context: any,
) => {
  if (dataItem.uri.includes("/alert")) {
    return null;
  }
  return (
    <ResultCard
      key={"searchresults-" + index}
      dataItem={dataItem}
      index={index}
      handleResultClick={handleResultClick}
      context={context}
    />
  );
};

