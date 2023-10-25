/** Takes any text value and display it as a fake a hyperlink (only styled as an hyperlink), this can be used in combo with "onCellClick" event */
export const fakeHyperlinkFormatter = (_row, _cell, value) => {
    return value ? `<span class="fake-hyperlink">${value}</span>` : '';
};
//# sourceMappingURL=fakeHyperlinkFormatter.js.map