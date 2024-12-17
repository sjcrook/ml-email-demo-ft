export const convertExtractedDataToJSON = (data, attributeValues) => {

    function getElementValue(str) {
        const re = new RegExp("^<(\\w+:)?(\\w+).*?>(.*)<.*$", "s");
        try {
            return str.match(re).slice(2).map(item => item.replace(/[\r\n]+/, ""));
        } catch (e) {
              return null;
        } 
    }
        
    function getAttributeValue(str, xpath) {
        const xpathPair = xpath.split('/@');
          const re = new RegExp('^<(\\w+:)?(' + xpathPair[0] + ').+?' + xpathPair[1] + '="([^"]*)"');
        try {
            return str.match(re).slice(2);
        } catch (e) {
            return null;
        }
    }    

    const obj = {};
    for (let i = 0; i < data.length; i++) {
        let pair = getElementValue(data[i]);
        if (pair === null) {
            let j = 0;
            let found = false;
            while (j < attributeValues.length && !found) {
                pair = getAttributeValue(data[i], attributeValues[j]);
                if (pair === null) {
                    j++;
                } else {
                    found = true;
                    obj[pair[0]] = pair[1];
                }
            }
        } else {
            if (obj[pair[0]]) {
                if (Array.isArray(obj[pair[0]])) {
                    obj[pair[0]].push(pair[1]);
                } else {
                    obj[pair[0]] = [ obj[pair[0]], pair[1] ];
                }
            } else {
                obj[pair[0]] = pair[1];      
            }
        }
    }
    return obj;
}
