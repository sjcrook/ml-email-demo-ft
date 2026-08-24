import { NetworkGraph } from "ml-fasttrack";

interface Props {
  documentResponse: any;
}

const DocumentMetadataGraph = ({ documentResponse }: Props) => {
  const uri = documentResponse?.uri ?? "document";
  const data = documentResponse?.data ?? {};
  const isTrade = uri.startsWith("/trades/");
  const metadata = isTrade
    ? [
        ["Broker", data?.trade?.Broker],
        ["Client", data?.trade?.Client?.Name],
        ["Security", data?.trade?.Security?.Symbol],
        ["Trade date", data?.trade?.TradeDate],
      ]
    : [
        ["From", data?.email?.instance?.From],
        ["To", data?.email?.instance?.To],
        ["Subject", data?.email?.instance?.Subject],
        ["Date", data?.email?.instance?.Date],
      ];

  const rootId = uri;
  const graph: Record<string, any> = {
    [rootId]: {
      color: "rgba(69, 255, 72, 0.13)",
      fontIcon: {
        color: "rgb(45, 120, 80)",
        text: isTrade ? "fa-chart-line" : "fa-envelope",
      },
      border: { color: "rgba(45, 120, 80, 0.6)", width: 2 },
      label: [
        { text: uri, position: "s" },
        { text: isTrade ? "(trade)" : "(email)", color: "rgba(80, 80, 80, 0.7)" },
      ],
    },
  };

  metadata.forEach(([label, value]) => {
    if (!value) {
      return;
    }
    const nodeId = `${rootId}-${label}`;
    graph[nodeId] = {
      color: "rgba(255, 255, 255, 1)",
      fontIcon: { color: "rgb(139, 0, 139)", text: "fa-user" },
      border: { color: "rgba(139, 0, 139, 0.5)" },
      label: [{ text: String(value), position: "s" }],
    };
    graph[`${rootId}-${nodeId}`] = {
      id1: rootId,
      id2: nodeId,
      label: { text: label, backgroundColor: "rgba(255, 255, 255, 0.8)" },
      end1: { arrow: false },
      end2: { arrow: true },
    };
  });

  return (
    <NetworkGraph
      items={graph}
      settings={{
        layout: { orientation: "down", curvedLinks: true },
        options: {
          navigation: true,
          overview: false,
          backgroundColor: "pink",
          iconFontFamily: "Font Awesome 5 Free Solid",
          fit: "auto",
        },
      }}
      height="100%"
      width="100%"
    />
  );
};

export default DocumentMetadataGraph;
