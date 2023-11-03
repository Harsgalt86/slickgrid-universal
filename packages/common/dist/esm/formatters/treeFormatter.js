import { Constants } from '../constants';
import { parseFormatterWhenExist } from './formatterUtilities';
import { sanitizeTextByAvailableSanitizer, } from '../services/domUtilities';
import { getCellValueFromQueryFieldGetter, } from '../services/utilities';
/** Formatter that must be use with a Tree Data column */
export const treeFormatter = (row, cell, value, columnDef, dataContext, grid) => {
    var _a, _b, _c, _d, _e;
    const gridOptions = grid.getOptions();
    const treeDataOptions = gridOptions === null || gridOptions === void 0 ? void 0 : gridOptions.treeDataOptions;
    const indentMarginLeft = (_a = treeDataOptions === null || treeDataOptions === void 0 ? void 0 : treeDataOptions.indentMarginLeft) !== null && _a !== void 0 ? _a : 15;
    const collapsedPropName = (_b = treeDataOptions === null || treeDataOptions === void 0 ? void 0 : treeDataOptions.collapsedPropName) !== null && _b !== void 0 ? _b : Constants.treeDataProperties.COLLAPSED_PROP;
    const hasChildrenPropName = (_c = treeDataOptions === null || treeDataOptions === void 0 ? void 0 : treeDataOptions.hasChildrenPropName) !== null && _c !== void 0 ? _c : Constants.treeDataProperties.HAS_CHILDREN_PROP;
    const treeLevelPropName = (_d = treeDataOptions === null || treeDataOptions === void 0 ? void 0 : treeDataOptions.levelPropName) !== null && _d !== void 0 ? _d : Constants.treeDataProperties.TREE_LEVEL_PROP;
    let outputValue = value;
    // when a queryFieldNameGetterFn is defined, then get the value from that getter callback function
    outputValue = getCellValueFromQueryFieldGetter(columnDef, dataContext, value);
    if (outputValue === null || outputValue === undefined || dataContext === undefined) {
        return '';
    }
    if (!dataContext.hasOwnProperty(treeLevelPropName)) {
        throw new Error('[Slickgrid-Universal] You must provide valid "treeDataOptions" in your Grid Options, however it seems that we could not find any tree level info on the current item datacontext row.');
    }
    const treeLevel = (_e = dataContext === null || dataContext === void 0 ? void 0 : dataContext[treeLevelPropName]) !== null && _e !== void 0 ? _e : 0;
    const indentSpacer = `<span style="display:inline-block; width:${indentMarginLeft * treeLevel}px;"></span>`;
    const slickTreeLevelClass = `slick-tree-level-${treeLevel}`;
    let toggleClass = '';
    if (dataContext[hasChildrenPropName]) {
        toggleClass = (dataContext === null || dataContext === void 0 ? void 0 : dataContext[collapsedPropName]) ? 'collapsed' : 'expanded'; // parent with child will have a toggle icon
    }
    if (treeDataOptions === null || treeDataOptions === void 0 ? void 0 : treeDataOptions.titleFormatter) {
        outputValue = parseFormatterWhenExist(treeDataOptions.titleFormatter, row, cell, columnDef, dataContext, grid);
    }
    const sanitizedOutputValue = sanitizeTextByAvailableSanitizer(gridOptions, outputValue, { ADD_ATTR: ['target'] });
    const spanToggleClass = `slick-group-toggle ${toggleClass}`.trim();
    const outputHtml = `${indentSpacer}<span class="${spanToggleClass}" aria-expanded="${toggleClass === 'expanded'}"></span><span class="slick-tree-title" level="${treeLevel}">${sanitizedOutputValue}</span>`;
    return { addClasses: slickTreeLevelClass, text: outputHtml };
};
//# sourceMappingURL=treeFormatter.js.map