//import { APP_CONFIG } from "../local";
import {
  GridLayout,
  GridLayoutItem,
  TabStrip,
  TabStripTab,
} from "@progress/kendo-react-layout";
import { useContext, useEffect } from "react";
import {
  SearchBox,
  ResultsCustom,
  StringFacet,
  WindowCard,
  MarkLogicContext,
  DateRangeFacet,
} from "ml-fasttrack";
import { customResultRender } from "../utils/customResultRender";
import { renderDocument } from "../utils/renderUtilities";
import NetworkGraphSPARQL from "../components/NetworkGraphSPARQL";
import DocumentMetadataGraph from "../components/DocumentMetadataGraph";
import searchBox from "../config/SearchBox.config.js";
import { useSearchStore } from "../store";

const initialDateRange = {
  start: new Date(1980, 0, 1),
  end: new Date(2030, 0, 1),
};
const FACET_NAMES = [
  "Broker",
  "Keyword",
  "EmailFrom",
  "FirstnameFrom",
  "EmailTo",
  "FirstNameTo",
  "Speaker",
  "Date",
];

interface SearchParams {
  q?: string;
  collections?: string[];
}

interface DateRange {
  start: Date;
  end: Date;
}

const SearchPage = () => {
  const context = useContext(MarkLogicContext);
  // tabSelected/dateVals live in a store (not component state) so they survive
  // SearchPage unmounting when navigating to Alerts (bell icon) and back.
  const tabSelected = useSearchStore((s) => s.tabSelected);
  const setTabSelected = useSearchStore((s) => s.setTabSelected);
  const dateVals = useSearchStore((s) => s.dateRange);
  const setDateVals = useSearchStore((s) => s.setDateRange);

  const queryParameters = new URLSearchParams(window.location.search);
  const q = queryParameters.get("q"); // query string
  const c = queryParameters.get("c"); // menu collection

  const windowDimensions = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  const windowCardDimensions = {
    width: windowDimensions.width / 3,
    height: windowDimensions.height * 0.7,
  };

  const handleSearch = (params: SearchParams) => {
    context.setQtext(params?.q);
    context.setCollections(params?.collections);
  };

  const handleFacetClick = (selection: string) => {
    context.addStringFacetConstraint(selection);
  };

  const updateDateRange = (constraint, previousConstraint, event) => {
    constraint && context.addRangeFacetConstraint(constraint);
    constraint === undefined &&
      context.removeRangeFacetConstraint(previousConstraint);
    setDateVals(event?.value);
  };

  const resetDateRange = (notused: any, constraint: any) => {
    context.removeRangeFacetConstraint(constraint);
    setDateVals(initialDateRange);
  };

  const handleResultClick = (uri: string) => {
    //const uri = snippet?.uri ? snippet.uri : snippet.dataItem ? snippet.dataItem.uri : null;
    // Must return the promise: customResultRender's parseUri() chains .then() off this.
    setTabSelected(0);
    return uri ? context.getDocument(uri) : Promise.resolve(undefined);
  };

  const handleWindowClose = () => {
    context.setDocumentResponse(null);
  };

  const handleTabSelect = (e) => {
    setTabSelected(e.selected);
  };

  useEffect(() => {
    // Only run the initial search while context.searchResponse is still in its
    // pristine "" state; once a search has completed, remounting (e.g. after
    // navigating to Alerts and back) won't re-trigger it, since searchResponse
    // is shared/global and already holds real results by then.
    if (
      typeof context.searchResponse === "string" &&
      context.searchResponse.length === 0
    ) {
      context.setPageStart(1);
      context.postSearch(context.qtext, 1);
    }
  }, []);

  function displayFacet(facetName: string) {
    const facetData = context.searchResponse?.facets?.[facetName];
    if (facetData) {
      if (facetName === "Date") {
        return (
          <DateRangeFacet
            title={facetName}
            name={facetName}
            isFacet={true}
            value={dateVals}
            onSelect={updateDateRange}
            resetVisible={true}
            onReset={resetDateRange}
          />
        );
      } else {
        return (
          <StringFacet
            title={facetName}
            name={facetName}
            data={facetData}
            onSelect={handleFacetClick}
          />
        );
      }
    }
  }
  //console.log("search:" + JSON.stringify(context.searchResponse));
  return (
    <GridLayout
      cols={[{ width: 350 }, { width: "auto" }]}
      style={{ paddingTop: 10, paddingRight: 10 }}
    >
      <GridLayoutItem row={1} col={1} style={{ marginRight: 10 }}>
        <GridLayout>
          {FACET_NAMES.map((facetName, i) => (
            <GridLayoutItem row={i + 1} col={1} key={"facetName-" + i}>
              {displayFacet(facetName)}
            </GridLayoutItem>
          ))}
        </GridLayout>
      </GridLayoutItem>
      <GridLayoutItem row={1} col={2}>
        <GridLayout>
          <GridLayoutItem row={1} col={1} style={{ marginBottom: 10 }}>
            <SearchBox
              className={"sb"}
              onSearch={handleSearch}
              placeholder="Enter search..."
              searchSuggest={true}
              searchSuggestMin={3}
              searchSuggestSubmit={true}
              searchSuggestLimit={5}
              showLoading={true}
              menuItems={searchBox.items}
              selected={c || 0}
              value={q || ""}
              boxStyle={{ height: 40 }}
              dropdownItemStyle={{ fontSize: 14 }}
            />
          </GridLayoutItem>
          <GridLayoutItem row={2} col={1} style={{ marginBottom: 10 }}>
            <div>
              {context.documentResponse && (
                <WindowCard
                  title={context.documentResponse.uri}
                  visible={true}
                  toggleDialog={handleWindowClose}
                  resizable={false}
                  draggable={false}
                  initialLeft={100}
                  initialTop={100}
                  width={windowDimensions.width - 200}
                  height={windowDimensions.height - 200}
                >
                  <TabStrip selected={tabSelected} onSelect={handleTabSelect}>
                    <TabStripTab title="Document">
                      <pre>
                        {renderDocument(
                          context.documentResponse,
                          context.searchResponse,
                        )}
                      </pre>
                    </TabStripTab>
                    <TabStripTab title="Graph">
                      <div className="ngs-container">
                        {context.documentResponse.uri.startsWith("/transcripts/") ? (
                          <NetworkGraphSPARQL
                            documentResponse={context.documentResponse}
                            searchResponse={context.searchResponse}
                          />
                        ) : (
                          <DocumentMetadataGraph
                            documentResponse={context.documentResponse}
                          />
                        )}
                      </div>
                    </TabStripTab>
                  </TabStrip>
                </WindowCard>
              )}
            </div>
            <ResultsCustom
              results={context.searchResponse.results}
              className="myResultCustom"
              renderItem={({ dataItem, index }) =>
                customResultRender(dataItem, index, handleResultClick, context)
              }
              headerClassName={"headerContainer"}
              footerClassName={"footerContainer"}
              paginationClassName={"paginationContainer"}
              paginationHeader={true}
              paginationFooter={true}
              pagerButtonCount={5}
              pageSizeChanger={[10, 25, 50, 100]}
              paginationSize={"medium"}
              showPreviousNext={true}
              showInfoSummary={true}
            />
          </GridLayoutItem>
        </GridLayout>
      </GridLayoutItem>
    </GridLayout>
  );
};

export default SearchPage;
