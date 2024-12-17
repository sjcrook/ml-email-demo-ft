import { GeoMap, MarkLogicContext, WindowCard } from "ml-fasttrack";
import { useContext, useState } from "react";
import { convertExtractedDataToJSON } from "../utils/dataTransform";

const mapPinSymbol = {
    type: "text",
    color: "tomato",
    text: "\ue61d", // esri-icon-map-pin
    font: {
        size: 28,
        family: "CalciteWebCoreIcons"
    }
};

const mapPinSymbolMultiple = {
    type: "text",
    color: "blue",
    text: "\ue61d", // esri-icon-map-pin
    font: {
        size: 28,
        family: "CalciteWebCoreIcons"
    }
};

const GeoMapExample = () => {
    const [ markerDetails, setMarkerDetails ] = useState(null);

    const context = useContext(MarkLogicContext);

    if (!context.searchResponse) {
        return <div>No results</div>;
    }

    const attributeValuesConfig = [
        'weeks/@last'
    ];

    const markersResults = context.searchResponse.results.map(result => result.extracted.content).map(content => convertExtractedDataToJSON(content, attributeValuesConfig));

    const esriApiKey = "AAPK6cf767e6231f419a855c5c7906053ce4YtrbqWoROtFVu0a3Kp8WR3bozgti9MNw3dG3goMkuCzRA1QSa9rW-qGZHKmt0c5c";

    const markersResults_OLD = [
        {
            point: {
                latitude: 38.897661992211155,
                longitude: -77.03653591049455,
                info: {
                    name: "The White House"
                }
            },
            symbol: mapPinSymbol
        }, {
            point: {
                latitude: 39.81183117056678,
                longitude: -77.22599223556483,
                info: {
                    name: "Gettysburg National Military Park Museum"
                }
            },
            symbol: mapPinSymbol
            /*
                \ue635 - esri-icon-globe
            */
        }
    ];

    const transformMarkers = (data) => {
        //return data;
        /*return data.filter(item => item.lat && item.long).map(item => ({
            point: {
                latitude: item.lat,
                longitude: item.long,
                info: {
                    name: item.title,
                    label: item.label
                }
            },
            symbol: mapPinSymbol
        }));*/
        const arr2 = [];
        data.filter(item => item.lat && item.long).forEach((el, idx, arr) => {
            const i = arr2.findIndex(item => item.point.latitude === el.lat && item.point.longitude === el.long);
            if (i > -1) {
                arr2[i].point.info.push({ title: el.title , label: el.label });
            } else {
                arr2.push({
                    point: {
                        latitude: el.lat,
                        longitude: el.long,
                        info: [ { title: el.title , label: el.label } ]
                    }
                });
            }
        });
        arr2.forEach(el => {
            if (el.point.info.length > 1) {
                el.symbol = mapPinSymbolMultiple;
            } else {
                el.symbol = mapPinSymbol;
            }
        });
        console.log('arr2', arr2);
        return arr2;
    };

    const shapesResults = [
    ];

    const transformShapes = (data) => {
        return data;
    };

    const onClickMap = (attr, evt) => {
        //console.log('attr', attr, evt);
        if (attr.info) {
            setMarkerDetails(() => ({ ...attr }));
        }
    };

    const handleWindowClose = () => {
        setMarkerDetails(() => null);
    };

    const handleGeoSearch = (polygonsCoordsArr) => {
        const query = {
            "type": "geo-elem-pair-query",
            "lat": "Latitude",
            "lon": "Longitude",
            "parent": "Location",
            "polygon": polygonsCoordsArr.map((coords) => {
                const pointObj = {
                    "point": coords[0]?.map((ele) => {
                        return {
                            "latitude": parseFloat(ele[1]),
                            "longitude": parseFloat(ele[0])
                        }
                    })
                }
                return pointObj
            })
        }
        console.log('query', query);
        /*
            Do something here like...
                context.addGeoConstraint(query);
        */
    };
    
    const windowDimensions = {
        width: window.innerWidth,
        height: window.innerHeight
    };

    const windowCardDimensions = {
        width: windowDimensions.width / 3,
        height: windowDimensions.height * 0.7
    };

    return (
        <>
            {
                markerDetails &&
                    <WindowCard
                        title="Details"
                        visible={true}
                        toggleDialog={handleWindowClose}
                        initialLeft={windowDimensions.width / 2 - windowCardDimensions.width / 2}
                        initialTop={windowDimensions.height / 2 - windowCardDimensions.height /2}
                        resizable={true}
                        draggable={true}
                        height={200}

                    >
                        <div>Latitude: { markerDetails.latitude }</div>
                        <div>Longitude: { markerDetails.longitude }</div>
                        {
                            markerDetails.info.map((item, i) =>
                                <div key={ 'details' + i }>
                                    <div>Title: { item.title }</div>
                                    <div>Label: { item.label }</div>
                                </div>
                            )
                        }
                    </WindowCard>
            }
            <GeoMap
                esriApiKey={esriApiKey}
                basemap="streets-relief-vector"
                center={[-98.556061, 39.810492]}
                zoom={4}
                markers={markersResults}
                transformMarkers={transformMarkers}
                sketch={true}
                shapes={shapesResults}
                transformShapes={transformShapes}
                symbol={mapPinSymbol}
                viewType="2D"
                useWeb={false}
                portalItemID={"41281c51f9de45edaf1c8ed44bb10e30"} // Trails
                showGallery={false}
                showToggle={false}
                addMarkerOnClick={false}
                width={"100%"}
                height={"600px"}
                onClickMap={onClickMap}                
                activeSelectionColor="#00ff44"
                onGeoSearch={handleGeoSearch}
                sketchPosition="top-right"
            />
        </>
    );
};

export default GeoMapExample;