/** Takes a value and displays it all lowercase */
export const lowercaseFormatter = (_row, _cell, value) => {
    // make sure the value is a string
    if (value !== undefined && typeof value !== 'string') {
        value = value + '';
    }
    return value ? value.toLowerCase() : '';
};
//# sourceMappingURL=lowercaseFormatter.js.map