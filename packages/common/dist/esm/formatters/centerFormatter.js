/** Align cell value to the center (alias to Formatters.center) */
export const centerFormatter = (_row, _cell, value) => {
    let outputValue = value;
    if (value === null || value === undefined) {
        outputValue = '';
    }
    return `<center>${outputValue}</center>`;
};
//# sourceMappingURL=centerFormatter.js.map