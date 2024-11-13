export const escapeJson = (input:string): string => {

    if (!input) {
        return '';
    }

    return input.replace(/[<>&\u2028\u2029]/g, escape);
};


const escape = function (char: string): string {

    return replacements.get(char);
};


const replacements = new Map([
    ['<', '\\u003c'],
    ['>', '\\u003e'],
    ['&', '\\u0026'],
    ['\u2028', '\\u2028'],
    ['\u2029', '\\u2029']
]);
