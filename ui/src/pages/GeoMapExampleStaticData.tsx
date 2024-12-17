import { GeoMap, WindowCard } from "ml-fasttrack";
import { useState } from "react";

const GeoMapExampleStaticData = () => {
    const [ markerDetails, setMarkerDetails ] = useState(null);

    const esriApiKey = "AAPK6cf767e6231f419a855c5c7906053ce4YtrbqWoROtFVu0a3Kp8WR3bozgti9MNw3dG3goMkuCzRA1QSa9rW-qGZHKmt0c5c";

    const mapPinSymbol = {
        type: "text",
        color: "tomato",
        text: "\ue61d", // esri-icon-map-pin
        font: {
            size: 28,
            family: "CalciteWebCoreIcons"
        }
    };

    const markersResults = [
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
        return data;
    };

    const shapesResults = [
        {
            geometry: {
                type: "polygon",
                rings: [
                    [
                        [-64.78, 32.3],
                        [-66.07, 18.45],
                        [-80.21, 25.78],
                        [-64.78, 32.3]
                    ]
                ]
            },
            symbol: {
                type: "simple-fill",
                color: [227, 139, 79, 0.4],
                outline: {
                    type: "simple-line",
                    color: [0, 128, 0],
                    width: 1
                }
            }
        }, {
            geometry: {
                type: "polyline",
                paths: [
                    [
                        [-123.1207, 49.2827], // Vancouver
                        [-114.0719, 51.0447], // Calgary
                        [-113.4937, 53.5461]  // Edmonton
                    ]
                ]
            },
            symbol: {
                type: 'simple-line',
                color: "blue",
                width: 3
            }
        }
    ];

    const transformShapes = (data) => {
        return data;
    };

    const onClickMap = (attr, evt) => {
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
                        title={markerDetails.info.name}
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
                popupFeatureLayer={[            
                    {
                        url: "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trailheads_Styled/FeatureServer/0",
                        outFields: ["TRL_NAME","CITY_JUR","X_STREET","PARKING","ELEV_FT"],
                        popupTemplate: {
                            "title": "Trailhead",
                            "content": "<b>Trail:</b> {TRL_NAME}<br><b>City:</b> {CITY_JUR}<br><b>Cross Street:</b> {X_STREET}<br><b>Parking:</b> {PARKING}<br><b>Elevation:</b> {ELEV_FT} ft"
                        }
                    }, {
                        url: "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trails_Styled/FeatureServer/0",
                        outFields: ["TRL_NAME","ELEV_GAIN"],
                        popupTemplate: {
                            title: "Trail Information",
                            content: [{
                                type: "media",
                                mediaInfos: [{
                                    type: "column-chart",
                                    caption: "",
                                    value: {
                                        fields: [ "ELEV_MIN","ELEV_MAX" ],
                                        normalizeField: null,
                                        tooltipField: "Min and max elevation values"
                                    }
                                }]
                            }]
                        }
                    }
                ]}
            />
        </>
    );
};

export default GeoMapExampleStaticData;