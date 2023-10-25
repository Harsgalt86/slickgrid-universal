"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fakeHyperlinkFormatter = void 0;
/** Takes any text value and display it as a fake a hyperlink (only styled as an hyperlink), this can be used in combo with "onCellClick" event */
const fakeHyperlinkFormatter = (_row, _cell, value) => {
    return value ? `<span class="fake-hyperlink">${value}</span>` : '';
};
exports.fakeHyperlinkFormatter = fakeHyperlinkFormatter;
//# sourceMappingURL=fakeHyperlinkFormatter.js.map