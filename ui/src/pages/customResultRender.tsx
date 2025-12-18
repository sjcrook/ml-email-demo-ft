import { Card, GridLayout, GridLayoutItem } from "@progress/kendo-react-layout";
import { Match } from "../entities/SearchResults";
import { Fragment } from "react/jsx-runtime";
//import { Tooltip } from "@progress/kendo-react-tooltip";
import { Button } from "@progress/kendo-react-buttons";
import { codeIcon, cssIcon, fileIcon } from '@progress/kendo-svg-icons';



export const customResultRender = (dataItem: any, index: number, handleResultClick: Function) => {


    const truncatedURI = (uri: string) => {
        // URI_LENGTH_START + 3 (...) + URI_LENGTH_END must equal URI_LENGTH_TOTAL
        const URI_LENGTH_TOTAL = 60;
        const URI_LENGTH_START = 20;
        const URI_LENGTH_END = 37;
    
          if (uri.length > URI_LENGTH_TOTAL) {
            return uri.substring(0, URI_LENGTH_START) + '...' + uri.substring(uri.length - URI_LENGTH_END);
        } else {
            return uri;
        }
    };
    
   
      
    const displayMatchText = (match: Match) => {
        let result = match["match-text"].map(item => {
            if (typeof item === "string") {
                return item;
            } else {
                return <span style={{ backgroundColor: "yellow" }}>{ item.highlight }</span>;
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
            <>{ result.map((item, index) => <Fragment key={'displayMatchText-' + index}>{ item }</Fragment>) }</>
        ); 
    };

    const displayMatches = (matches: Match[], index: number) => {
        return (
            <>{
                matches.map((match: Match, index2) => <div key={"display-matches-" + index + "-" + index2 }>{ displayMatchText(match) }</div>)
            }</>
        );
    };


     const parseUri = (uri: string, doc : any) => {
        let createDate = null;
       // console.log("date="+ JSON.stringify(doc));
        const preUri= uri.substring(0, uri.lastIndexOf('/'));

     switch(preUri) {
        case "/emails":
            createDate = doc?.content[1]?.instance?.Date ;
            return preUri + "/" + createDate;
        case "/transcripts":
            createDate = doc?.content[1]?.transcript?.metadata.date ;
            return preUri + "/" + createDate;
        case "/trades":
            createDate = doc?.content[1]?.trade?.TradeDate ;
            return preUri + "/" + createDate;
        default:
            return "fails";
        }
    };
    
    //const icon = dataItem.uri.endsWith(".json") ? "css" : dataItem.uri.endsWith(".xml") ? "code" : "file";
    const icon = dataItem.uri.endsWith(".json") ? cssIcon : dataItem.uri.endsWith(".xml") ? codeIcon : fileIcon;

//<span style={{fontWeight: "bold"}}>{ truncatedURI(dataItem.uri) }</span>
    return !dataItem.uri.includes("/alert") && (
        
        <Card style={{ padding: 10, marginTop: 10, marginBottom: 10 }} key={"searchresults-" + index}>
            <GridLayout>
                <GridLayoutItem row={1} col={1}>
                    <Button
                        themeColor={"base"}
                        onClick={ () => handleResultClick(dataItem.uri) }
                        fillMode="outline"
                        svgIcon={icon}
                        style={{ float: "right" }}
                    />                    
                </GridLayoutItem>
                <GridLayoutItem row={2} col={1} style={{ marginBottom: 10 }}>
                    <span style={{fontWeight: "bold"}}>{ parseUri(dataItem.uri, dataItem.extracted) }</span>
                </GridLayoutItem>
                <GridLayoutItem row={3} col={1} style={{ paddingLeft: 20 }}>
                    { displayMatches(dataItem.matches, index) }
                </GridLayoutItem>
            </GridLayout>
        </Card>
    );
}