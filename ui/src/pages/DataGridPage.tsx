//import { APP_CONFIG } from "../local";
import { useContext, useEffect, useState } from "react";
import { DataGrid, MarkLogicContext, SearchBox } from "ml-fasttrack";
import { MultiSelect } from '@progress/kendo-react-dropdowns';
import { GridLayout, GridLayoutItem } from "@progress/kendo-react-layout";

const DataGridPage = () => {
    const context = useContext(MarkLogicContext);
    const [ dropdownSPARQLResults, setDropdownSPARQLResults ] = useState([]);
    const [ dropdownArray, setDropdownArray ] = useState([]);
    const [ mainSPARQLResults, setMainSPARQLResults ] = useState(null);

    const dropdownSPARQL = `
        PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
        PREFIX skosxl: <http://www.w3.org/2008/05/skos-xl#>

        SELECT DISTINCT ?defPRD ?ardLit ?defCRC ?crc
        WHERE {
            ?prd skos:definition ?defPRD .
        
            ?ard skos:broader ?prd;
                skosxl:prefLabel ?ardPrefLabelIRI .

            ?ardPrefLabelIRI skosxl:literalForm ?ardLit .  
        
            ?ard skos:broader ?prd;
                skos:definition ?defARD .
        
            ?crc a <http://example.com/eDOVE#CRC>;
                skos:broader ?ard;
                skos:definition ?defCRC .

            FILTER (lang(?defPRD) = "en")
            FILTER (lang(?ardLit) = "en")
            FILTER (lang(?defCRC) = "en")
        }
        ORDER BY ?defPRD ?ardLit ?defCRC
    `;

    const mainSPARQL = `
        PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
        PREFIX skosxl: <http://www.w3.org/2008/05/skos-xl#>

        SELECT ?ardLit ?defCRC ?defWTH (CONCAT(?defRD, ":", GROUP_CONCAT(?defLeaf; SEPARATOR=" ")) as ?leaves)
        WHERE {

            ?ard skosxl:prefLabel ?ardPrefLabelIRI .
            ?ardPrefLabelIRI skosxl:literalForm ?ardLit .

            ?crc skos:definition ?defCRC;
                skos:broader ?ard .
            ?dist <http://example.com/eDOVE#distributionFor> ?crc;
                <http://example.com/eDOVE#hasWTH> ?wth .
            ?wth skos:definition ?defWTH .
            ?rd <http://example.com/eDOVE#distributedBy> ?dist;
                skos:definition ?defRD .
            ?leaf skos:broader ?rd;
                skos:definition ?defLeaf .

            #VALUES (?crc) { (<https://vocabulary.progress.com/eDOVE/CRC#8O6>) (<https://vocabulary.progress.com/eDOVE/CRC#8O7>) }
            #VALUES (?crc) { ?crcParams }
            FILTER (?crc IN (?crcParams))
            FILTER (lang(?ardLit) = "en")
            FILTER (lang(?defCRC) = "en")
            FILTER (lang(?defWTH) = "en")
            FILTER (lang(?defRD) = "en")
            FILTER (lang(?defLeaf) = "en")
        }
        GROUP BY ?ardLit ?crc ?wth
        ORDER BY ?ardLit ?defCRC ?defWTH ?leaves
    `;   

    const handleDropdownChange = (evt) => {
        setDropdownArray(evt.value);

        /*context.getSparql(mainSPARQL, {  }).then(response => {
            setMainSPARQLResults(response.results.bindings);
        });*/

        let params = new URLSearchParams();
        evt.value.forEach(item => params.append("bind:crcParams", item.crc.value));

        context.request({
            url: '/v1/graphs/sparql',
            method: 'POST',
            data: mainSPARQL,
            params: params,
            headers: { 'Content-Type': 'application/sparql-query', 'Accept': 'application/sparql-results+json' }
        }).then(response => {
            setMainSPARQLResults(response.results.bindings);
        })
    };

    useEffect(() => {
        context.getSparql(dropdownSPARQL, {}).then(response => {
            const results = response.results.bindings.map(
                item => ({ ...item, concatenated: [ item.defPRD.value, item.ardLit.value, item.defCRC.value ].join("|") })
            );
            setDropdownSPARQLResults(results);
        });
    }, []);

    const bindings = mainSPARQLResults || [];

    const uniqueARDCRCs = [ ...new Set(bindings.map(item => [ item.ardLit.value, item.defCRC.value ].join("|"))) ].toSorted();

    const uniqueWTHs = [ ...new Set(bindings.map(item => item.defWTH.value)) ].toSorted();

    const results = [];

    uniqueARDCRCs.forEach(item => {
        const [ ard, crc ] = item.split("|");
        const result = { ard: ard, crc: crc };
        uniqueWTHs.forEach(item2 => {
            const found = bindings.filter(item3 => item3.ardLit.value === ard && item3.defCRC.value === crc && item3.defWTH.value === item2);
            found.length === 0 ? result[item2] = null : result[item2] = found[0].leaves.value;
        });
        results.push(result);
    });

    const columns = results.length > 0 ? [
        { title: 'ARD', field: 'ard' },
        { title: 'CRC', field: 'crc' }
    ] : [];

    uniqueWTHs.forEach(item => {
        //columns.push({ 'title': item, 'field': item });
        columns.push({
            'title': item,
            'field': item
        });
    });

    return (
        <GridLayout
            rows={[ { height: 50 }, { height: 'auto' } ]}
            cols={[ { width: "auto" } ]}
            style={{ padding: 30 }}
        >
            <GridLayoutItem row={1} col={1} style={{ }}>
                <MultiSelect
                    data={dropdownSPARQLResults}
                    onChange={handleDropdownChange}
                    value={dropdownArray}
                    textField="concatenated"
                    dataItemKey="crc.value"
                    placeholder="Please select ..."
                />            
            </GridLayoutItem>
            { mainSPARQLResults &&

                <GridLayoutItem row={2} col={1} style={{ }}>
                    <DataGrid
                        data={results}
                        gridColumns={columns}
                        pagerButtonCount={5}
                        pageSizeChanger={[1, 2, 5]}
                        paginationSize="medium"
                        paginationFooter={false}
                        showPreviousNext={false}
                        showInfoSummary={false}
                    />
                </GridLayoutItem>
            }
        </GridLayout>
    );
};

export default DataGridPage;