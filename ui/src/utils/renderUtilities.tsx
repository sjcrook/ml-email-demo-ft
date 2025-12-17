import { Fragment } from "react/jsx-runtime";

const HIGHLIGHT_START = "highlight_start";
const HIGHLIGHT_END = "highlight_end";
const re = new RegExp("(?=" + HIGHLIGHT_START + ")|(?<=" + HIGHLIGHT_END + ")", "g");
const reReplacement = HIGHLIGHT_START + "$1" + HIGHLIGHT_END;
const LEVELS_DOWN_DEFAULT = 12;

const uniqueMatchesRegExp = (uniqueMatches: string[]): RegExp => {
    return new RegExp("(" + uniqueMatches.join("|") + ")", "g");
};

type O = {
    [key: (string | symbol)]: any;
}

export const highlightJSON = (entity: (object | null | Function | string | undefined) = {}, uniqueMatches: string[], levelsDown: number = LEVELS_DOWN_DEFAULT) => { 
    const reUniqueMatches =  uniqueMatchesRegExp(uniqueMatches);
    function walkTree(entity: (object | null | Function | string | undefined), levelsDown: number): any {
        // Walk the JSON object and add highlight placeholder strings around text to be highlighted.
        if (levelsDown === 0) {
            return 'pruned';
        }
        if (typeof entity === 'object') {
            if (Array.isArray(entity)) {
                return entity.map(e => walkTree(e, levelsDown - 1));
            } else if (entity === null) {
                return null;
            } else if (entity.constructor && entity.constructor.name === 'RegExp') {
                return '"' + String(entity).replace(/(\\|")/g, '\\$1') + '"';
            } else {
                const o: O = {};
                for (const [key, value] of Object.entries(entity)) {
                  const wTR = walkTree(value, levelsDown - 1);
                  o[key] = wTR;
                }
                return o;
            }
        } else if (typeof entity === 'function') {
            return String(entity);
        } else if (typeof entity === 'string') {
            if (uniqueMatches.length > 0) {
                return entity.replace(reUniqueMatches, reReplacement);
            } else {
              return entity;
            }
        } else if (typeof entity === 'undefined') {
            return undefined;
        } else {
            return entity;
        }
    }
  
    return walkTree(entity, levelsDown);
};

export const highlightXML = (node: Node, uniqueMatches: string[], levelsDown: number = LEVELS_DOWN_DEFAULT) => {
    const reUniqueMatches =  uniqueMatchesRegExp(uniqueMatches);
    // Walk the XML document and add highlight placeholder strings around text to be highlighted.
    if (uniqueMatches.length > 0) {
        function walk(node: Node, levelsDown: number) {
            if (levelsDown === 0) {
                return 'pruned';
            }
            if (node.nodeType === 3 && node.nodeValue) {
                // text node
                node.nodeValue = node.nodeValue.replace(reUniqueMatches, reReplacement);
            }
            const children = node.childNodes;
            for (let i = 0; i < children.length; i++) { // Children are siblings to each other
                walk(children[i], levelsDown - 1);
            }
        }
        walk(node, levelsDown);
    }
}

export const prettifyXML = (doc: Node) => {
    // Prettify an XML document using a XSL template.
    const xsltDocStr =
        // https://www.delightfulcomputing.com/xslfaq/xsl/sect2/pretty.html
        `<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
            <xsl:output method="xml"/>
            <xsl:param name="indent-increment" select="'    '" />
            <xsl:template match="*">
                <xsl:param name="indent" select="'&#xA;'"/>
                <xsl:value-of select="$indent"/>
                <xsl:copy>
                    <xsl:copy-of select="@*" />
                    <xsl:apply-templates>
                        <xsl:with-param name="indent"
                       select="concat($indent, $indent-increment)"/>
                    </xsl:apply-templates>
                    <xsl:if test="*">
                        <xsl:value-of select="$indent"/>
                    </xsl:if>
                </xsl:copy>
            </xsl:template>
            <xsl:template match="comment()|processing-instruction()">
                <xsl:copy />
            </xsl:template>
            <!-- WARNING: this is dangerous. Handle with care -->
            <xsl:template match="text()[normalize-space(.)='']"/>
        </xsl:stylesheet>`;
    const xsltDoc = (new DOMParser()).parseFromString(xsltDocStr, "application/xml");
    const xsltProcessor = new XSLTProcessor();
    xsltProcessor.importStylesheet(xsltDoc);

    const resultDoc = xsltProcessor.transformToDocument(doc);
    return (new XMLSerializer()).serializeToString(resultDoc);
}

export const highlightText = (data: string, uniqueMatches: string[]) => {
    const reUniqueMatches =  uniqueMatchesRegExp(uniqueMatches);
    return data.replace(reUniqueMatches, reReplacement);
};

/*
            docStr.split(re).map(part => {
                if (part.startsWith(HIGHLIGHT_START)) {
                    return <span style={{ backgroundColor: "yellow" }}>{ part.substring(15, part.indexOf(HIGHLIGHT_END)) }</span>;
                } else {
                    return part;
                }
            })
*/

export const renderDocument = (documentResponse: any, searchResponse: any) => {
    const uniqueMatches: string[] = [];
 //   console.log("response="+JSON.stringify(searchResponse.results));
    
    searchResponse.results.find(item => item.uri === documentResponse.uri).matches.forEach(item => {
        item['match-text'].forEach(item2 => {
            if (typeof item2 === 'object') {
                if (!uniqueMatches.includes(item2.highlight)) {
                    uniqueMatches.push(item2.highlight);
                }   
            }
        });

    });
    const uri = documentResponse.uri;
    const data = documentResponse.data;
    if (uri.endsWith(".json")) {
        return splitAndMap(JSON.stringify(highlightJSON(data, uniqueMatches), null, 4));
    } else if (uri.endsWith(".xml")) {
        // Parse the XML string into a node structure.
        const doc = (new DOMParser()).parseFromString(data.replaceAll("^\"|\"$", ""), "application/xml");
        highlightXML(doc, uniqueMatches);
        return splitAndMap(prettifyXML(doc));
    } else if (uri.endsWith(".txt")) {
        return splitAndMap(highlightText(data, uniqueMatches));
    } else {
        return "No handler exists to render this type of document";
    }
};    

export const splitAndMap = (docStr: string) => {
    return  docStr.split(re).map((part, index) => {
     
        if (part.startsWith(HIGHLIGHT_START)) {
            return <span style={{ backgroundColor: "yellow" }} key={'splitAndMap-' + index}>{ part.substring(15, part.indexOf(HIGHLIGHT_END)) }</span>;
        } else {
            return <Fragment key={'splitAndMap-' + index}>{part}</Fragment>;
        }
    });
};
