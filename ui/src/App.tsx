import { useContext } from "react";
import { MLContext, SearchBox, ResultsSnippet } from "ml-fasttrack"
import { GridLayout, GridLayoutItem } from "@progress/kendo-react-layout";
 
//...
 
const App = () => {
    return (
        <div className="grid-layout-container">
            <GridLayout
            cols={[{ width: '350' }, { width: 'auto' }]}
            style={{ padding: 10, backgroundColor: 'lightPink' }}
            >
            <GridLayoutItem row={1} col={1} style={{ marginRight: 10 }}>
                <GridLayout>
                <GridLayoutItem row={1} col={1} style={{ marginBottom: 10 }}>
                    {/* {context.searchResponse?.facets?.format && (
                    <StringFacet
                        title="Format"
                        name="format"
                        data={context.searchResponse?.facets?.format}
                        onSelect={handleFacetClick}
                    />
                    )} */}
                    Some Format contentxx
                </GridLayoutItem>
                <GridLayoutItem row={2} col={1} style={{ marginBottom: 10 }}>
                    {/* {context.searchResponse?.facets?.artist && (
                    <StringFacet
                        title="Artist"
                        name="artist"
                        data={context.searchResponse?.facets?.artist}
                        onSelect={handleFacetClick}
                    />
                    )} */}{' '}
                    Some Artist content
                </GridLayoutItem>
                </GridLayout>
            </GridLayoutItem>
            <GridLayoutItem row={1} col={2}>
                <GridLayout>
                <GridLayoutItem
                    row={1}
                    col={1}
                    style={{ marginTop: 1, marginBottom: 10 }}
                >
                    {/* <SearchBox
                    className={'sb'}
                    onSearch={(params) => context.setQtext(params.q)}
                    /> */}
                    Some searchbox here
                    <style>{`
                                .sb {
                                    margin-top: 20px;
                                    margin-bottom: 20px;
                                    width: 100%;
                                }
                                .sb input {
                                    width: 600px;
                                }
                                .sb span.k-input {
                                    height: 40px;
                                }
                                .sb span.k-button-text {
                                    margin-top: 5px;
                                }
                            `}</style>
                </GridLayoutItem>
                <GridLayoutItem row={2} col={1} style={{ marginBottom: 10 }}>
                    <GridLayout>
                    <GridLayoutItem
                        row={1}
                        col={2}
                        style={{ marginLeft: 'auto', marginRight: 'auto' }}
                    >
                        <div>
                        {/* {context.documentResponse && (
                            <Dialog
                            title={context.documentResponse.uri}
                            onClose={handleWindowClose}
                            width={'100%'}
                            height={'100%'}
                            >
                            <pre>{renderDocument()}</pre>
                            </Dialog>
                        )} */}
                        </div>
                        {/* <ResultsCustom
                        results={context.searchResponse.results}
                        className="myResultCustom"
                        multipleValueSeparator={','}
                        renderItem={({ dataItem, index }) =>
                            myResultRender(dataItem, index, handleResultClick)
                        }
                        headerClassName={'headerContainer'}
                        footerClassName={'footerContainer'}
                        paginationClassName={'paginationContainer'}
                        paginationHeader={true}
                        paginationFooter={true}
                        pagerButtonCount={5}
                        pageSizeChanger={[10, 25, 50, 100]}
                        paginationSize={'medium'}
                        showPreviousNext={true}
                        showInfoSummary={true}
                        /> */}{' '}
                        some custom results
                    </GridLayoutItem>
                    </GridLayout>
                </GridLayoutItem>
                </GridLayout>
            </GridLayoutItem>
            </GridLayout>
        </div>
    )
}

export default App;