"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.treeExportFormatter = void 0;
const utils_1 = require("@slickgrid-universal/utils");
const constants_1 = require("../constants");
const domUtilities_1 = require("../services/domUtilities");
const utilities_1 = require("../services/utilities");
const formatterUtilities_1 = require("./formatterUtilities");
/** Formatter that must be use with a Tree Data column */
const treeExportFormatter = (row, cell, value, columnDef, dataContext, grid) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    const gridOptions = grid.getOptions();
    const treeDataOptions = gridOptions === null || gridOptions === void 0 ? void 0 : gridOptions.treeDataOptions;
    const collapsedPropName = (_a = treeDataOptions === null || treeDataOptions === void 0 ? void 0 : treeDataOptions.collapsedPropName) !== null && _a !== void 0 ? _a : constants_1.Constants.treeDataProperties.COLLAPSED_PROP;
    const hasChildrenPropName = (_b = treeDataOptions === null || treeDataOptions === void 0 ? void 0 : treeDataOptions.hasChildrenPropName) !== null && _b !== void 0 ? _b : constants_1.Constants.treeDataProperties.HAS_CHILDREN_PROP;
    const treeLevelPropName = (_c = treeDataOptions === null || treeDataOptions === void 0 ? void 0 : treeDataOptions.levelPropName) !== null && _c !== void 0 ? _c : constants_1.Constants.treeDataProperties.TREE_LEVEL_PROP;
    const indentMarginLeft = (_d = treeDataOptions === null || treeDataOptions === void 0 ? void 0 : treeDataOptions.exportIndentMarginLeft) !== null && _d !== void 0 ? _d : 5;
    const exportIndentationLeadingChar = (_e = treeDataOptions === null || treeDataOptions === void 0 ? void 0 : treeDataOptions.exportIndentationLeadingChar) !== null && _e !== void 0 ? _e : '.';
    const exportIndentationLeadingSpaceCount = (_f = treeDataOptions === null || treeDataOptions === void 0 ? void 0 : treeDataOptions.exportIndentationLeadingSpaceCount) !== null && _f !== void 0 ? _f : 3;
    const groupCollapsedSymbol = (_h = (_g = gridOptions === null || gridOptions === void 0 ? void 0 : gridOptions.excelExportOptions) === null || _g === void 0 ? void 0 : _g.groupCollapsedSymbol) !== null && _h !== void 0 ? _h : '⮞';
    const groupExpandedSymbol = (_k = (_j = gridOptions === null || gridOptions === void 0 ? void 0 : gridOptions.excelExportOptions) === null || _j === void 0 ? void 0 : _j.groupExpandedSymbol) !== null && _k !== void 0 ? _k : '⮟';
    let outputValue = value;
    // when a queryFieldNameGetterFn is defined, then get the value from that getter callback function
    outputValue = (0, utilities_1.getCellValueFromQueryFieldGetter)(columnDef, dataContext, value);
    if (outputValue === null || outputValue === undefined || dataContext === undefined) {
        return '';
    }
    if (!dataContext.hasOwnProperty(treeLevelPropName)) {
        throw new Error('[Slickgrid-Universal] You must provide valid "treeDataOptions" in your Grid Options, however it seems that we could not find any tree level info on the current item datacontext row.');
    }
    const treeLevel = (_l = dataContext === null || dataContext === void 0 ? void 0 : dataContext[treeLevelPropName]) !== null && _l !== void 0 ? _l : 0;
    let toggleSymbol = '';
    let indentation = 0;
    if (dataContext[hasChildrenPropName]) {
        toggleSymbol = (dataContext === null || dataContext === void 0 ? void 0 : dataContext[collapsedPropName]) ? groupCollapsedSymbol : groupExpandedSymbol; // parent with child will have a toggle icon
        indentation = treeLevel === 0 ? 0 : (indentMarginLeft * treeLevel);
    }
    else {
        indentation = (indentMarginLeft * (treeLevel === 0 ? 0 : treeLevel + 1));
    }
    const indentSpacer = (0, utils_1.addWhiteSpaces)(indentation);
    if (treeDataOptions === null || treeDataOptions === void 0 ? void 0 : treeDataOptions.titleFormatter) {
        outputValue = (0, formatterUtilities_1.parseFormatterWhenExist)(treeDataOptions.titleFormatter, row, cell, columnDef, dataContext, grid);
    }
    const leadingChar = (treeLevel === 0 && toggleSymbol) ? '' : (treeLevel === 0 ? `${exportIndentationLeadingChar}${(0, utils_1.addWhiteSpaces)(exportIndentationLeadingSpaceCount)}` : exportIndentationLeadingChar);
    outputValue = `${leadingChar}${indentSpacer}${toggleSymbol} ${outputValue}`;
    const sanitizedOutputValue = (0, domUtilities_1.sanitizeHtmlToText)(outputValue); // also remove any html tags that might exist
    return sanitizedOutputValue;
};
exports.treeExportFormatter = treeExportFormatter;
//# sourceMappingURL=treeExportFormatter.js.map