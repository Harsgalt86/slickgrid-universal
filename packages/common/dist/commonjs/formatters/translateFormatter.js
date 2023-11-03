"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.translateFormatter = void 0;
/** Takes a cell value and translates it (translater). Requires an instance of the Translate Service:: `translater: this.translate */
const translateFormatter = (_row, _cell, value, columnDef, _dataContext, grid) => {
    const gridOptions = (grid && typeof grid.getOptions === 'function') ? grid.getOptions() : {};
    const translater = gridOptions.translater || (columnDef && columnDef.params && columnDef.params.translater);
    if (!translater || typeof translater.translate !== 'function') {
        throw new Error(`"Formatters.translate" requires the Translate Service to be provided as a Grid Options "translater" (or "i18n" depending on which framework you use).
    For example: this.gridOptions = { enableTranslate: true, translater: this.translateService }`);
    }
    // make sure the value is a string (for example a boolean value would throw an error)
    if (value !== undefined && value !== null && typeof value !== 'string') {
        value = value + '';
    }
    return value ? translater.translate(value) : '';
};
exports.translateFormatter = translateFormatter;
//# sourceMappingURL=translateFormatter.js.map