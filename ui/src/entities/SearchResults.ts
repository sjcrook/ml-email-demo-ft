interface Highlight {
    highlight: string;
}

export interface Match {
    "path": string;
    "match-text": (string | Highlight)[];
}

interface SearchResult {
    "index": number;
    "uri": string;
    "path": string;
    "score": number;
    "confidence": number;
    "fitness": number;
    "href": number;
    "mimetype": string;
    "format": string;
    "matches": Match[]
}

export interface FacetValue {
    name: string;
    count: number;
    value: string;
    checked?: boolean;
}

interface FacetResults {
    type: string;
    facetValues: FacetValue[]
}

interface FacetsResults {
    [key: string]: FacetResults;
}

export default interface SearchResults {
    "snippet-format": string;
    "total": number;
    "start": number;
    "page-length": number;
    results?: SearchResult[];
    "facets": FacetsResults;
}