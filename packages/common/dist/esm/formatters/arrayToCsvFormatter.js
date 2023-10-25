/** Takes an array of string and converts it to a comma delimited string */
export const arrayToCsvFormatter = (_row, _cell, value) => {
    if (value && Array.isArray(value) && value.length > 0) {
        const values = value.join(', ');
        return `<span title="${values}">${values}</span>`;
    }
    return value;
};
//# sourceMappingURL=arrayToCsvFormatter.js.map