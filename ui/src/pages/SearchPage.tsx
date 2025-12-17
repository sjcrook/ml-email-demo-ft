//import { APP_CONFIG } from "../local";
import { GridLayout, GridLayoutItem, TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import { useContext, useEffect, useState } from "react";
import { SearchBox, ResultsCustom, StringFacet, WindowCard, MarkLogicContext, DateRangeFacet } from "ml-fasttrack";
import { customResultRender } from './customResultRender';
import { Dialog } from "@progress/kendo-react-dialogs";
import { renderDocument } from "../utils/renderUtilities";
import NetworkGraphSPARQL from "../components/NetworkGraphSPARQL";
import searchBox from '../config/SearchBox.config.js';

const initialDateRange = { start: new Date(1980, 0, 1), end: new Date(2030, 0, 1) };

const SearchPage = () => {
    const context = useContext(MarkLogicContext);
    const [tabSelected, setTabSelected] = useState(0);
    const [dateVals, setDateVals] = useState(initialDateRange);


    const queryParameters = new URLSearchParams(window.location.search)
    const q = queryParameters.get("q") // query string
    const c = queryParameters.get("c") // menu collection

    const handleSearch = (params) => {
        handleWindowClose();
        context.setQtext(params?.q);
        context.setCollections(params?.collections);
      }

    const handleFacetClick = (selection) => {
        context.addStringFacetConstraint(selection);
    }

    const updateDateRange = (constraint, previousConstraint, event) => {    
        constraint && context.addRangeFacetConstraint(constraint);
        constraint === undefined && context.removeRangeFacetConstraint(previousConstraint);
        setDateVals(event?.value);
    }

    const resetDateRange = (notused, constraint) => {
        context.removeRangeFacetConstraint(constraint);
        setDateVals(initialDateRange);
    }

    const handleResultClick = (uri: string) => {
        //const uri = snippet?.uri ? snippet.uri : snippet.dataItem ? snippet.dataItem.uri : null;
        if (uri) {
            context.getDocument(uri);
        }
    }

    const handleWindowClose = () => {
        context.setDocumentResponse(null);
    }

    const handleTabSelect = e => {
      setTabSelected(e.selected);
    };

    useEffect(() => {
        // Execute a search on first load of application
        if (typeof context.searchResponse === 'string' && context.searchResponse.length === 0) {
            context.setPageStart(1);
            context.postSearch(context.qtext, 1);
        }
    }, []);

    const windowDimensions = {
        width: window.innerWidth,
        height: window.innerHeight
    };

    const windowCardDimensions = {
        width: windowDimensions.width / 3,
        height: windowDimensions.height * 0.7
    };

    function displayFacet(facetName: string) {
        if (context.searchResponse?.facets?.[facetName]) {
            if (facetName === 'Date') {
                return  <DateRangeFacet
                            title={facetName}
                            name={facetName}
                            isFacet={true}
                            value={dateVals}
                            onSelect={updateDateRange}
                            resetVisible={true}
                            onReset={resetDateRange}
                        />;
            } else {
                return <StringFacet title={facetName} name={facetName} data={context.searchResponse?.facets?.[facetName]} onSelect={handleFacetClick} />;
            }
        }
    }
   //console.log("full"+ JSON.stringify(context.searchResponse.results))
    return (
        <GridLayout
            cols={[ { width: 350 }, { width: "auto" } ]}
            style={{ paddingTop: 10, paddingRight: 10 }}
        >
            <GridLayoutItem row={1} col={1} style={{ marginRight: 10 }}>
                <GridLayout>
                    {
                        [ "Keyword", "EmailFrom", "FirstnameFrom", "EmailTo", "FirstnameTo", "Speaker", "Date" ].map((facetName, i) => (
                            <GridLayoutItem
                                row={ i + 1 }
                                col={1}
                                key={ 'facetName-' + i }
                            >
                                { displayFacet(facetName) }
                            </GridLayoutItem>
                        ))
                    }
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
                            value={q || ''}
                            boxStyle={{ height: 40 }}
                            dropdownItemStyle={{ fontSize: 14 }}
                        />
                        <style>{`
                            .sb {
                                width: 100%;
                            }
                            .sb span.k-button-text {
                                margin-top: 5px;
                            }
                        `}</style>
                    </GridLayoutItem>
                    <GridLayoutItem
                        row={2}
                        col={1}
                        style={{ marginBottom: 10 }}
                    >
                        <div>
                        {
                            /*context.documentResponse &&
                                <Dialog
                                    title={context.documentResponse.uri}
                                    onClose={handleWindowClose}
                                    width={"100%"}
                                    height={"100%"}                
                                >
                                    <pre>
                                        { renderDocument(context.documentResponse, context.searchResponse) }
                                    </pre>
                                </Dialog>
                            */
                            /*
                                    title={context.documentResponse.uri}
                                    visible={true}
                                    toggleDialog={handleWindowClose}
                                    initialLeft={windowDimensions.width / 2 - windowCardDimensions.width / 2}
                                    initialTop={windowDimensions.height / 2 - windowCardDimensions.height /2}
                                    resizable={true}
                                    draggable={true}
                            */
                            context.documentResponse &&
                                <WindowCard
                                    title={context.documentResponse.uri}
                                    visible={true}
                                    toggleDialog={handleWindowClose}
                                    resizable={false}
                                    draggable={false}
                                    initialLeft={100}
                                    initialTop={100}
                                    width={ windowDimensions.width - 200 }
                                    height={ windowDimensions.height - 200 }
                                >
                                    <TabStrip selected={tabSelected} onSelect={handleTabSelect}>
                                        <TabStripTab title="Document">
                                            <pre>
                                                { renderDocument(context.documentResponse, context.searchResponse) }
                                            </pre>
                                        </TabStripTab>
                                        <TabStripTab title="Graph">
                                            <div className="ngs-container">
                                                <NetworkGraphSPARQL documentResponse={context.documentResponse} searchResponse={context.searchResponse} />
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
                                        </TabStripTab>
                                    </TabStrip>
                                </WindowCard>
                        }
                        </div>
                        <ResultsCustom
                            results={context.searchResponse.results}
                            className="myResultCustom"
                            renderItem={( result, index ) => customResultRender(result.dataItem, index, result.dataItem.extracted, handleResultClick)}
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