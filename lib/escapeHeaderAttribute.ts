import { assert } from './assert.js';

/**
 * Escape string for usage as an attribute value in HTTP headers.
 *
 * @param attribute - The string to be escaped.
 *
 * @return The escaped string. Will throw on invalid characters that are not supported to be escaped.
 */
export const escapeHeaderAttribute = function (attribute:string): string {

    // Allowed value characters: !#$%&'()*+,-./:;<=>?@[]^_`{|}~ and space, a-z, A-Z, 0-9, \, "

    assert(/^[ \w\!#\$%&'\(\)\*\+,\-\.\/\:;<\=>\?@\[\]\^`\{\|\}~\"\\]*$/.test(attribute), 'Bad attribute value (' + attribute + ')');

    return attribute.replace(/\\/g, '\\\\').replace(/\"/g, '\\"');                             // Escape quotes and slash
};
