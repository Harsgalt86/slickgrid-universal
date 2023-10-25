"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.treeParseTotalsFormatter = void 0;
const constants_1 = require("../constants");
const treeParseTotalsFormatter = (row, cell, value, columnDef, dataContext, grid) => {
    var _a, _b;
    const gridOptions = grid.getOptions();
    const hasChildrenPropName = (_b = (_a = gridOptions === null || gridOptions === void 0 ? void 0 : gridOptions.treeDataOptions) === null || _a === void 0 ? void 0 : _a.hasChildrenPropName) !== null && _b !== void 0 ? _b : constants_1.Constants.treeDataProperties.HAS_CHILDREN_PROP;
    const { groupTotalsFormatter, treeTotalsFormatter, params } = columnDef;
    // make sure that the user provided a total formatter or else it won't work
    if (!groupTotalsFormatter && !treeTotalsFormatter) {
        throw new Error('[Slickgrid-Universal] When using Formatters.treeParseTotals, you must provide a total formatter via "groupTotalsFormatter" or "treeTotalsFormatter".');
    }
    // treeParseTotalsFormatter will auto-detect if it should execute GroupTotalsFormatter or a list of regular Formatters (it has to be either/or, never both at same time)
    if (dataContext[hasChildrenPropName] && (dataContext === null || dataContext === void 0 ? void 0 : dataContext.__treeTotals) && (groupTotalsFormatter || treeTotalsFormatter)) {
        const totalFormatter = (treeTotalsFormatter !== null && treeTotalsFormatter !== void 0 ? treeTotalsFormatter : groupTotalsFormatter);
        return totalFormatter(dataContext === null || dataContext === void 0 ? void 0 : dataContext.__treeTotals, columnDef, grid);
    }
    else if (params.formatters) {
        // loop through all Formatters, the value of 1st formatter will be used by 2nd formatter and so on.
        // they are piped and executed in sequences
        let currentValue = value;
        for (const formatter of params.formatters) {
            if (!dataContext[hasChildrenPropName] && !(dataContext === null || dataContext === void 0 ? void 0 : dataContext.__treeTotals)) {
                currentValue = formatter(row, cell, currentValue, columnDef, dataContext, grid) || value;
            }
        }
        return currentValue;
    }
    // falling here means dataContext doesn't include any tree totals and user didn't provide any regular formatters
    return value;
};
exports.treeParseTotalsFormatter = treeParseTotalsFormatter;
//# sourceMappingURL=treeParseTotalsFormatter.js.map