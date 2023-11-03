"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hyperlinkFormatter = void 0;
const domUtilities_1 = require("../services/domUtilities");
/**
 * Takes an hyperlink cell value and transforms it into a real hyperlink, given that the value starts with 1 of these (http|ftp|https).
 * The structure will be "<a href="hyperlink">hyperlink</a>"
 *
 * You can optionally change the hyperlink text displayed by using the generic params "hyperlinkText" in the column definition
 * For example: { id: 'link', field: 'link', params: { hyperlinkText: 'Company Website' } } will display "<a href="link">Company Website</a>"
 *
 * You can also optionally provide the hyperlink URL by using the generic params "hyperlinkUrl" in the column definition
 * For example: { id: 'link', field: 'link', params: {  hyperlinkText: 'Company Website', hyperlinkUrl: 'http://www.somewhere.com' } } will display "<a href="http://www.somewhere.com">Company Website</a>"
 */
const hyperlinkFormatter = (_row, _cell, value, columnDef, _dataContext, grid) => {
    const columnParams = columnDef && columnDef.params || {};
    const gridOptions = (grid && typeof grid.getOptions === 'function') ? grid.getOptions() : {};
    let displayedText = columnParams.hyperlinkText ? columnParams.hyperlinkText : value;
    displayedText = (0, domUtilities_1.sanitizeTextByAvailableSanitizer)(gridOptions, displayedText);
    let outputLink = columnParams.hyperlinkUrl ? columnParams.hyperlinkUrl : value;
    outputLink = (0, domUtilities_1.sanitizeTextByAvailableSanitizer)(gridOptions, outputLink);
    const matchUrl = outputLink.match(/^(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:\/~\+#]*[\w\-\@?^=%&amp;\/~\+#])?/i);
    if (matchUrl && Array.isArray(matchUrl) && matchUrl.length > 0) {
        const finalUrl = matchUrl[0];
        return `<a href="${finalUrl}">${displayedText}</a>`;
    }
    return value;
};
exports.hyperlinkFormatter = hyperlinkFormatter;
//# sourceMappingURL=hyperlinkFormatter.js.map