export const escapeHtml = function (input:string):string {

    if (!input) {
        return '';
    }

    let escaped = '';

    for (let i = 0; i < input.length; ++i) {

        const charCode = input.charCodeAt(i);

        if (isSafe(charCode)) {
            escaped += input[i];
        }
        else {
            escaped += escapeHtmlChar(charCode);
        }
    }

    return escaped;
};


const escapeHtmlChar = function (charCode) {

    const namedEscape = namedHtml.get(charCode);
    if (namedEscape) {
        return namedEscape;
    }

    if (charCode >= 256) {
        return '&#' + charCode + ';';
    }

    const hexValue = charCode.toString(16).padStart(2, '0');
    return `&#x${hexValue};`;
};


const isSafe = function (charCode:number):boolean {

    return safeCharCodes.has(charCode);
};


const namedHtml = new Map([
    [38, '&amp;'],
    [60, '&lt;'],
    [62, '&gt;'],
    [34, '&quot;'],
    [160, '&nbsp;'],
    [162, '&cent;'],
    [163, '&pound;'],
    [164, '&curren;'],
    [169, '&copy;'],
    [174, '&reg;']
]);


const safeCharCodes = (function () {

    const safe = new Set<number>();

    for (let i = 32; i < 123; ++i) {

        if ((i >= 97) ||                    // a-z
            (i >= 65 && i <= 90) ||         // A-Z
            (i >= 48 && i <= 57) ||         // 0-9
            i === 32 ||                     // space
            i === 46 ||                     // .
            i === 44 ||                     // ,
            i === 45 ||                     // -
            i === 58 ||                     // :
            i === 95) {                     // _

            safe.add(i);
        }
    }

    return safe;
}());
