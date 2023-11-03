"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unsubscribeAll = exports.findOrDefault = exports.thousandSeparatorFormatted = exports.parseUtcDate = exports.objectWithoutKey = exports.mapOperatorByFieldType = exports.mapOperatorToShorthandDesignation = exports.mapOperatorType = exports.mapFlatpickrDateFormatWithFieldType = exports.mapMomentDateFormatWithFieldType = exports.isColumnDateType = exports.getColumnFieldType = exports.getTranslationPrefix = exports.getDescendantProperty = exports.getCellValueFromQueryFieldGetter = exports.formatNumber = exports.decimalFormatted = exports.findItemInTreeStructure = exports.unflattenParentChildArrayToTree = exports.flattenToParentChildArray = exports.addTreeLevelAndAggregatorsByMutation = exports.addTreeLevelByMutation = exports.castObservableToPromise = exports.cancellablePromise = exports.CancelledException = void 0;
const un_flatten_tree_1 = require("un-flatten-tree");
const moment_ = require("moment-mini");
const moment = moment_['default'] || moment_; // patch to fix rollup "moment has no default export" issue, document here https://github.com/rollup/rollup/issues/670
const constants_1 = require("../constants");
const index_1 = require("../enums/index");
/** Cancelled Extension that can be only be thrown by the `cancellablePromise()` function */
class CancelledException extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, CancelledException.prototype);
    }
}
exports.CancelledException = CancelledException;
/**
 * From an input Promise, make it cancellable by wrapping it inside an object that holds the promise and a `cancel()` method
 * @param {Promise<any>} - input Promise
 * @returns {Object} - Promise wrapper that holds the promise and a `cancel()` method
 */
function cancellablePromise(inputPromise) {
    let hasCancelled = false;
    if (inputPromise instanceof Promise) {
        return {
            promise: inputPromise.then(result => {
                if (hasCancelled) {
                    throw new CancelledException('Cancelled Promise');
                }
                return result;
            }),
            cancel: () => hasCancelled = true
        };
    }
    return inputPromise;
}
exports.cancellablePromise = cancellablePromise;
/**
 * Try casting an input of type Promise | Observable into a Promise type.
 * @param object which could be of type Promise or Observable
 * @param fromServiceName string representing the caller service name and will be used if we throw a casting problem error
 */
function castObservableToPromise(rxjs, input, fromServiceName = '') {
    let promise = input;
    if (input instanceof Promise) {
        // if it's already a Promise then return it
        return input;
    }
    else if (rxjs.isObservable(input)) {
        promise = rxjs.firstValueFrom(input);
    }
    if (!(promise instanceof Promise)) {
        throw new Error(`Something went wrong, Slickgrid-Universal ${fromServiceName} is not able to convert the Observable into a Promise.`);
    }
    return promise;
}
exports.castObservableToPromise = castObservableToPromise;
/**
 * Mutate the original array and add a treeLevel (defaults to `__treeLevel`) property on each item.
 * @param {Array<Object>} treeArray - hierarchical tree array
 * @param {Object} options - options containing info like children & treeLevel property names
 * @param {Number} [treeLevel] - current tree level
 */
function addTreeLevelByMutation(treeArray, options, treeLevel = 0) {
    var _a;
    const childrenPropName = ((_a = options === null || options === void 0 ? void 0 : options.childrenPropName) !== null && _a !== void 0 ? _a : constants_1.Constants.treeDataProperties.CHILDREN_PROP);
    if (Array.isArray(treeArray)) {
        for (const item of treeArray) {
            if (item) {
                if (Array.isArray(item[childrenPropName]) && item[childrenPropName].length > 0) {
                    treeLevel++;
                    addTreeLevelByMutation(item[childrenPropName], options, treeLevel);
                    treeLevel--;
                }
                item[options.levelPropName] = treeLevel;
            }
        }
    }
}
exports.addTreeLevelByMutation = addTreeLevelByMutation;
function addTreeLevelAndAggregatorsByMutation(treeArray, options, treeLevel = 0, parent = null) {
    var _a;
    const childrenPropName = ((_a = options === null || options === void 0 ? void 0 : options.childrenPropName) !== null && _a !== void 0 ? _a : constants_1.Constants.treeDataProperties.CHILDREN_PROP);
    const { aggregator } = options;
    if (Array.isArray(treeArray)) {
        for (const item of treeArray) {
            if (item) {
                const isParent = Array.isArray(item[childrenPropName]);
                if (Array.isArray(item[childrenPropName]) && item[childrenPropName].length > 0) {
                    aggregator.init(item, true);
                    treeLevel++;
                    addTreeLevelAndAggregatorsByMutation(item[childrenPropName], options, treeLevel, item);
                    treeLevel--;
                }
                if (parent && aggregator.isInitialized && typeof aggregator.accumulate === 'function' && !(item === null || item === void 0 ? void 0 : item.__filteredOut)) {
                    aggregator.accumulate(item, isParent);
                    aggregator.storeResult(parent.__treeTotals);
                }
                item[options.levelPropName] = treeLevel;
            }
        }
    }
}
exports.addTreeLevelAndAggregatorsByMutation = addTreeLevelAndAggregatorsByMutation;
/**
 * Convert a hierarchical (tree) array (with children) into a flat array structure array (where the children are pushed as next indexed item in the array)
 * @param {Array<Object>} treeArray - input hierarchical (tree) array
 * @param {Object} options - you can provide "childrenPropName" (defaults to "children")
 * @return {Array<Object>} output - Parent/Child array
 */
function flattenToParentChildArray(treeArray, options) {
    var _a, _b, _c, _d, _e;
    const identifierPropName = ((_a = options === null || options === void 0 ? void 0 : options.identifierPropName) !== null && _a !== void 0 ? _a : 'id');
    const childrenPropName = ((_b = options === null || options === void 0 ? void 0 : options.childrenPropName) !== null && _b !== void 0 ? _b : constants_1.Constants.treeDataProperties.CHILDREN_PROP);
    const hasChildrenPropName = ((_c = options === null || options === void 0 ? void 0 : options.hasChildrenPropName) !== null && _c !== void 0 ? _c : constants_1.Constants.treeDataProperties.HAS_CHILDREN_PROP);
    const parentPropName = ((_d = options === null || options === void 0 ? void 0 : options.parentPropName) !== null && _d !== void 0 ? _d : constants_1.Constants.treeDataProperties.PARENT_PROP);
    const levelPropName = (_e = options === null || options === void 0 ? void 0 : options.levelPropName) !== null && _e !== void 0 ? _e : constants_1.Constants.treeDataProperties.TREE_LEVEL_PROP;
    if (options === null || options === void 0 ? void 0 : options.shouldAddTreeLevelNumber) {
        if (options === null || options === void 0 ? void 0 : options.aggregators) {
            options.aggregators.forEach((aggregator) => {
                addTreeLevelAndAggregatorsByMutation(treeArray, { childrenPropName, levelPropName, aggregator });
            });
        }
        else {
            addTreeLevelByMutation(treeArray, { childrenPropName, levelPropName });
        }
    }
    const flat = (0, un_flatten_tree_1.flatten)(treeArray, (node) => node[childrenPropName], (node, parentNode) => {
        return {
            [identifierPropName]: node[identifierPropName],
            [parentPropName]: parentNode !== undefined ? parentNode[identifierPropName] : null,
            [hasChildrenPropName]: !!node[childrenPropName],
            ...objectWithoutKey(node, childrenPropName) // reuse the entire object except the children array property
        };
    });
    return flat;
}
exports.flattenToParentChildArray = flattenToParentChildArray;
/**
 * Convert a flat array (with "parentId" references) into a hierarchical (tree) dataset structure (where children are array(s) inside their parent objects)
 * @param flatArray input array (flat dataset)
 * @param options you can provide the following tree data options (which are all prop names, except 1 boolean flag, to use or else use their defaults):: collapsedPropName, childrenPropName, parentPropName, identifierPropName and levelPropName and initiallyCollapsed (boolean)
 * @return roots - hierarchical (tree) data view array
 */
function unflattenParentChildArrayToTree(flatArray, options) {
    var _a, _b, _c, _d, _e;
    const identifierPropName = (_a = options === null || options === void 0 ? void 0 : options.identifierPropName) !== null && _a !== void 0 ? _a : 'id';
    const childrenPropName = (_b = options === null || options === void 0 ? void 0 : options.childrenPropName) !== null && _b !== void 0 ? _b : constants_1.Constants.treeDataProperties.CHILDREN_PROP;
    const parentPropName = (_c = options === null || options === void 0 ? void 0 : options.parentPropName) !== null && _c !== void 0 ? _c : constants_1.Constants.treeDataProperties.PARENT_PROP;
    const levelPropName = (_d = options === null || options === void 0 ? void 0 : options.levelPropName) !== null && _d !== void 0 ? _d : constants_1.Constants.treeDataProperties.TREE_LEVEL_PROP;
    const collapsedPropName = (_e = options === null || options === void 0 ? void 0 : options.collapsedPropName) !== null && _e !== void 0 ? _e : constants_1.Constants.treeDataProperties.COLLAPSED_PROP;
    const inputArray = flatArray || [];
    const roots = []; // items without parent which at the root
    // make them accessible by guid on this map
    const all = {};
    inputArray.forEach((item) => all[item[identifierPropName]] = item);
    // connect childrens to its parent, and split roots apart
    Object.keys(all).forEach((id) => {
        var _a;
        const item = all[id];
        if (!(parentPropName in item) || item[parentPropName] === null || item[parentPropName] === undefined || item[parentPropName] === '') {
            roots.push(item);
        }
        else if (item[parentPropName] in all) {
            const p = all[item[parentPropName]];
            if (!(childrenPropName in p)) {
                p[childrenPropName] = [];
            }
            p[childrenPropName].push(item);
            if (p[collapsedPropName] === undefined) {
                p[collapsedPropName] = (_a = options === null || options === void 0 ? void 0 : options.initiallyCollapsed) !== null && _a !== void 0 ? _a : false;
            }
        }
    });
    // we need and want the Tree Level,
    // we can do that after the tree is created and mutate the array by adding a __treeLevel property on each item
    // perhaps there might be a way to add this while creating the tree for now that is the easiest way I found
    if (options === null || options === void 0 ? void 0 : options.aggregators) {
        options.aggregators.forEach((aggregator) => {
            addTreeLevelAndAggregatorsByMutation(roots, { childrenPropName, levelPropName, aggregator }, 0);
        });
    }
    else {
        addTreeLevelByMutation(roots, { childrenPropName, levelPropName }, 0);
    }
    return roots;
}
exports.unflattenParentChildArrayToTree = unflattenParentChildArrayToTree;
/**
 * Find an item from a tree (hierarchical) view structure (a parent that can have children array which themseleves can children and so on)
 * @param {Array<Object>} treeArray - hierarchical tree dataset
 * @param {Function} predicate - search predicate to find the item in the hierarchical tree structure
 * @param {String} childrenPropertyName - children property name to use in the tree (defaults to "children")
 */
function findItemInTreeStructure(treeArray, predicate, childrenPropertyName) {
    if (!childrenPropertyName) {
        throw new Error('findRecursive requires parameter "childrenPropertyName"');
    }
    const initialFind = treeArray.find(predicate);
    const elementsWithChildren = treeArray.filter((x) => (x === null || x === void 0 ? void 0 : x.hasOwnProperty(childrenPropertyName)) && x[childrenPropertyName]);
    if (initialFind) {
        return initialFind;
    }
    else if (elementsWithChildren.length) {
        const childElements = [];
        elementsWithChildren.forEach((item) => {
            if (item === null || item === void 0 ? void 0 : item.hasOwnProperty(childrenPropertyName)) {
                childElements.push(...item[childrenPropertyName]);
            }
        });
        return findItemInTreeStructure(childElements, predicate, childrenPropertyName);
    }
    return undefined;
}
exports.findItemInTreeStructure = findItemInTreeStructure;
/**
 * Take a number (or a string) and display it as a formatted decimal string with defined minimum and maximum decimals
 * @param input
 * @param minDecimal
 * @param maxDecimal
 * @param decimalSeparator
 * @param thousandSeparator
 */
function decimalFormatted(input, minDecimal, maxDecimal, decimalSeparator = '.', thousandSeparator = '') {
    if (isNaN(+input)) {
        return input;
    }
    const minDec = (minDecimal === undefined) ? 2 : minDecimal;
    const maxDec = (maxDecimal === undefined) ? 2 : maxDecimal;
    let amount = String(Math.round(+input * Math.pow(10, maxDec)) / Math.pow(10, maxDec));
    if ((amount.indexOf('.') < 0) && (minDec > 0)) {
        amount += '.';
    }
    while ((amount.length - amount.indexOf('.')) <= minDec) {
        amount += '0';
    }
    const decimalSplit = amount.split('.');
    let integerNumber;
    let decimalNumber;
    // do we want to display our number with a custom separator in each thousand position
    if (thousandSeparator) {
        integerNumber = decimalSplit.length >= 1 ? thousandSeparatorFormatted(decimalSplit[0], thousandSeparator) : undefined;
    }
    else {
        integerNumber = decimalSplit.length >= 1 ? decimalSplit[0] : amount;
    }
    // when using a separator that is not a dot, replace it with the new separator
    if (decimalSplit.length > 1) {
        decimalNumber = decimalSplit[1];
    }
    let output = '';
    if (integerNumber !== undefined && decimalNumber !== undefined) {
        output = `${integerNumber}${decimalSeparator}${decimalNumber}`;
    }
    else if (integerNumber !== undefined && integerNumber !== null) {
        output = integerNumber;
    }
    return output;
}
exports.decimalFormatted = decimalFormatted;
/**
 * Format a number following options passed as arguments (decimals, separator, ...)
 * @param input
 * @param minDecimal
 * @param maxDecimal
 * @param wrapNegativeNumberInBraquets
 * @param symbolPrefix
 * @param symbolSuffix
 * @param decimalSeparator
 * @param thousandSeparator
 */
function formatNumber(input, minDecimal, maxDecimal, wrapNegativeNumberInBraquets, symbolPrefix = '', symbolSuffix = '', decimalSeparator = '.', thousandSeparator = '') {
    if (isNaN(+input)) {
        return input;
    }
    const calculatedValue = ((Math.round(parseFloat(input) * 1000000) / 1000000));
    if (calculatedValue < 0) {
        const absValue = Math.abs(calculatedValue);
        if (wrapNegativeNumberInBraquets) {
            if (!isNaN(minDecimal) || !isNaN(maxDecimal)) {
                return `(${symbolPrefix}${decimalFormatted(absValue, minDecimal, maxDecimal, decimalSeparator, thousandSeparator)}${symbolSuffix})`;
            }
            const formattedValue = thousandSeparatorFormatted(`${absValue}`, thousandSeparator);
            return `(${symbolPrefix}${formattedValue}${symbolSuffix})`;
        }
        else {
            if (!isNaN(minDecimal) || !isNaN(maxDecimal)) {
                return `-${symbolPrefix}${decimalFormatted(absValue, minDecimal, maxDecimal, decimalSeparator, thousandSeparator)}${symbolSuffix}`;
            }
            const formattedValue = thousandSeparatorFormatted(`${absValue}`, thousandSeparator);
            return `-${symbolPrefix}${formattedValue}${symbolSuffix}`;
        }
    }
    else {
        if (!isNaN(minDecimal) || !isNaN(maxDecimal)) {
            return `${symbolPrefix}${decimalFormatted(input, minDecimal, maxDecimal, decimalSeparator, thousandSeparator)}${symbolSuffix}`;
        }
        const formattedValue = thousandSeparatorFormatted(`${input}`, thousandSeparator);
        return `${symbolPrefix}${formattedValue}${symbolSuffix}`;
    }
}
exports.formatNumber = formatNumber;
/**
 * When a queryFieldNameGetterFn is defined, then get the value from that getter callback function
 * @param {Column} columnDef
 * @param {Object} dataContext
 * @param {String} defaultValue - optional value to use if value isn't found in data context
 * @return outputValue
 */
function getCellValueFromQueryFieldGetter(columnDef, dataContext, defaultValue) {
    if (typeof columnDef.queryFieldNameGetterFn === 'function') {
        const queryFieldName = columnDef.queryFieldNameGetterFn(dataContext);
        // get the cell value from the item or when it's a dot notation then exploded the item and get the final value
        if ((queryFieldName === null || queryFieldName === void 0 ? void 0 : queryFieldName.indexOf('.')) >= 0) {
            defaultValue = getDescendantProperty(dataContext, queryFieldName);
        }
        else {
            defaultValue = dataContext.hasOwnProperty(queryFieldName) ? dataContext[queryFieldName] : defaultValue;
        }
    }
    return defaultValue;
}
exports.getCellValueFromQueryFieldGetter = getCellValueFromQueryFieldGetter;
/**
 * From a dot (.) notation path, find and return a property within an object given a path
 * @param object - object input
 * @param path - path of the complex object, string with dot (.) notation
 * @returns outputValue - the object property value found if any
 */
function getDescendantProperty(object, path) {
    if (!object || !path) {
        return object;
    }
    return path.split('.').reduce((obj, prop) => obj && obj[prop], object);
}
exports.getDescendantProperty = getDescendantProperty;
/** Get I18N Translation Prefix, defaults to an empty string */
function getTranslationPrefix(gridOptions) {
    if (gridOptions && gridOptions.translationNamespace) {
        return gridOptions.translationNamespace + (gridOptions.translationNamespaceSeparator || '');
    }
    return '';
}
exports.getTranslationPrefix = getTranslationPrefix;
/** From a column definition, find column type */
function getColumnFieldType(columnDef) {
    return columnDef.outputType || columnDef.type || index_1.FieldType.string;
}
exports.getColumnFieldType = getColumnFieldType;
/** Verify if the identified column is of type Date */
function isColumnDateType(fieldType) {
    switch (fieldType) {
        case index_1.FieldType.date:
        case index_1.FieldType.dateTime:
        case index_1.FieldType.dateIso:
        case index_1.FieldType.dateTimeIso:
        case index_1.FieldType.dateTimeShortIso:
        case index_1.FieldType.dateTimeIsoAmPm:
        case index_1.FieldType.dateTimeIsoAM_PM:
        case index_1.FieldType.dateEuro:
        case index_1.FieldType.dateEuroShort:
        case index_1.FieldType.dateTimeEuro:
        case index_1.FieldType.dateTimeShortEuro:
        case index_1.FieldType.dateTimeEuroAmPm:
        case index_1.FieldType.dateTimeEuroAM_PM:
        case index_1.FieldType.dateTimeEuroShort:
        case index_1.FieldType.dateTimeEuroShortAmPm:
        case index_1.FieldType.dateTimeEuroShortAM_PM:
        case index_1.FieldType.dateUs:
        case index_1.FieldType.dateUsShort:
        case index_1.FieldType.dateTimeUs:
        case index_1.FieldType.dateTimeShortUs:
        case index_1.FieldType.dateTimeUsAmPm:
        case index_1.FieldType.dateTimeUsAM_PM:
        case index_1.FieldType.dateTimeUsShort:
        case index_1.FieldType.dateTimeUsShortAmPm:
        case index_1.FieldType.dateTimeUsShortAM_PM:
        case index_1.FieldType.dateUtc:
            return true;
        default:
            return false;
    }
}
exports.isColumnDateType = isColumnDateType;
/**
 * From a Date FieldType, return it's equivalent moment.js format
 * refer to moment.js for the format standard used: https://momentjs.com/docs/#/parsing/string-format/
 * @param fieldType
 */
function mapMomentDateFormatWithFieldType(fieldType) {
    let map;
    switch (fieldType) {
        case index_1.FieldType.dateTime:
        case index_1.FieldType.dateTimeIso:
            map = 'YYYY-MM-DD HH:mm:ss';
            break;
        case index_1.FieldType.dateTimeIsoAmPm:
            map = 'YYYY-MM-DD hh:mm:ss a';
            break;
        case index_1.FieldType.dateTimeIsoAM_PM:
            map = 'YYYY-MM-DD hh:mm:ss A';
            break;
        case index_1.FieldType.dateTimeShortIso:
            map = 'YYYY-MM-DD HH:mm';
            break;
        // all Euro Formats (date/month/year)
        case index_1.FieldType.dateEuro:
            map = 'DD/MM/YYYY';
            break;
        case index_1.FieldType.dateEuroShort:
            map = 'D/M/YY';
            break;
        case index_1.FieldType.dateTimeEuro:
            map = 'DD/MM/YYYY HH:mm:ss';
            break;
        case index_1.FieldType.dateTimeShortEuro:
            map = 'DD/MM/YYYY HH:mm';
            break;
        case index_1.FieldType.dateTimeEuroAmPm:
            map = 'DD/MM/YYYY hh:mm:ss a';
            break;
        case index_1.FieldType.dateTimeEuroAM_PM:
            map = 'DD/MM/YYYY hh:mm:ss A';
            break;
        case index_1.FieldType.dateTimeEuroShort:
            map = 'D/M/YY H:m:s';
            break;
        case index_1.FieldType.dateTimeEuroShortAmPm:
            map = 'D/M/YY h:m:s a';
            break;
        case index_1.FieldType.dateTimeEuroShortAM_PM:
            map = 'D/M/YY h:m:s A';
            break;
        // all US Formats (month/date/year)
        case index_1.FieldType.dateUs:
            map = 'MM/DD/YYYY';
            break;
        case index_1.FieldType.dateUsShort:
            map = 'M/D/YY';
            break;
        case index_1.FieldType.dateTimeUs:
            map = 'MM/DD/YYYY HH:mm:ss';
            break;
        case index_1.FieldType.dateTimeUsAmPm:
            map = 'MM/DD/YYYY hh:mm:ss a';
            break;
        case index_1.FieldType.dateTimeUsAM_PM:
            map = 'MM/DD/YYYY hh:mm:ss A';
            break;
        case index_1.FieldType.dateTimeUsShort:
            map = 'M/D/YY H:m:s';
            break;
        case index_1.FieldType.dateTimeUsShortAmPm:
            map = 'M/D/YY h:m:s a';
            break;
        case index_1.FieldType.dateTimeUsShortAM_PM:
            map = 'M/D/YY h:m:s A';
            break;
        case index_1.FieldType.dateTimeShortUs:
            map = 'MM/DD/YYYY HH:mm';
            break;
        case index_1.FieldType.dateUtc:
            map = 'YYYY-MM-DDTHH:mm:ss.SSSZ';
            break;
        case index_1.FieldType.date:
        case index_1.FieldType.dateIso:
        default:
            map = 'YYYY-MM-DD';
            break;
    }
    return map;
}
exports.mapMomentDateFormatWithFieldType = mapMomentDateFormatWithFieldType;
/**
 * From a Date FieldType, return it's equivalent Flatpickr format
 * refer to Flatpickr for the format standard used: https://chmln.github.io/flatpickr/formatting/#date-formatting-tokens
 * also note that they seem very similar to PHP format (except for am/pm): http://php.net/manual/en/function.date.php
 * @param fieldType
 */
function mapFlatpickrDateFormatWithFieldType(fieldType) {
    /*
      d: Day of the month, 2 digits with leading zeros	01 to 31
      D: A textual representation of a day	Mon through Sun
      l: (lowercase 'L')	A full textual representation of the day of the week	Sunday through Saturday
      j: Day of the month without leading zeros	1 to 31
      J: Day of the month without leading zeros and ordinal suffix	1st, 2nd, to 31st
      w: Numeric representation of the day of the week	0 (for Sunday) through 6 (for Saturday)
      F: A full textual representation of a month	January through December
      m: Numeric representation of a month, with leading zero	01 through 12
      n: Numeric representation of a month, without leading zeros	1 through 12
      M: A short textual representation of a month	Jan through Dec
      U: The number of seconds since the Unix Epoch	1413704993
      y: A two digit representation of a year	99 or 03
      Y: A full numeric representation of a year, 4 digits	1999 or 2003
      H: Hours (24 hours)	00 to 23
      h: Hours	1 to 12
      i: Minutes	00 to 59
      S: Seconds, 2 digits	00 to 59
      s: Seconds	0, 1 to 59
      K: AM/PM	AM or PM
    */
    let map;
    switch (fieldType) {
        case index_1.FieldType.dateTime:
        case index_1.FieldType.dateTimeIso:
            map = 'Y-m-d H:i:S';
            break;
        case index_1.FieldType.dateTimeShortIso:
            map = 'Y-m-d H:i';
            break;
        case index_1.FieldType.dateTimeIsoAmPm:
        case index_1.FieldType.dateTimeIsoAM_PM:
            map = 'Y-m-d h:i:S K'; // there is no lowercase in Flatpickr :(
            break;
        // all Euro Formats (date/month/year)
        case index_1.FieldType.dateEuro:
            map = 'd/m/Y';
            break;
        case index_1.FieldType.dateEuroShort:
            map = 'd/m/y';
            break;
        case index_1.FieldType.dateTimeEuro:
            map = 'd/m/Y H:i:S';
            break;
        case index_1.FieldType.dateTimeShortEuro:
            map = 'd/m/y H:i';
            break;
        case index_1.FieldType.dateTimeEuroAmPm:
            map = 'd/m/Y h:i:S K'; // there is no lowercase in Flatpickr :(
            break;
        case index_1.FieldType.dateTimeEuroAM_PM:
            map = 'd/m/Y h:i:s K';
            break;
        case index_1.FieldType.dateTimeEuroShort:
            map = 'd/m/y H:i:s';
            break;
        case index_1.FieldType.dateTimeEuroShortAmPm:
            map = 'd/m/y h:i:s K'; // there is no lowercase in Flatpickr :(
            break;
        // all US Formats (month/date/year)
        case index_1.FieldType.dateUs:
            map = 'm/d/Y';
            break;
        case index_1.FieldType.dateUsShort:
            map = 'm/d/y';
            break;
        case index_1.FieldType.dateTimeUs:
            map = 'm/d/Y H:i:S';
            break;
        case index_1.FieldType.dateTimeShortUs:
            map = 'm/d/y H:i';
            break;
        case index_1.FieldType.dateTimeUsAmPm:
            map = 'm/d/Y h:i:S K'; // there is no lowercase in Flatpickr :(
            break;
        case index_1.FieldType.dateTimeUsAM_PM:
            map = 'm/d/Y h:i:s K';
            break;
        case index_1.FieldType.dateTimeUsShort:
            map = 'm/d/y H:i:s';
            break;
        case index_1.FieldType.dateTimeUsShortAmPm:
            map = 'm/d/y h:i:s K'; // there is no lowercase in Flatpickr :(
            break;
        case index_1.FieldType.dateUtc:
            map = 'Z';
            break;
        case index_1.FieldType.date:
        case index_1.FieldType.dateIso:
        default:
            map = 'Y-m-d';
            break;
    }
    return map;
}
exports.mapFlatpickrDateFormatWithFieldType = mapFlatpickrDateFormatWithFieldType;
/**
 * Mapper for query operators (ex.: <= is "le", > is "gt")
 * @param string operator
 * @returns string map
 */
function mapOperatorType(operator) {
    let map;
    switch (operator) {
        case '<':
        case 'LT':
            map = index_1.OperatorType.lessThan;
            break;
        case '<=':
        case 'LE':
            map = index_1.OperatorType.lessThanOrEqual;
            break;
        case '>':
        case 'GT':
            map = index_1.OperatorType.greaterThan;
            break;
        case '>=':
        case 'GE':
            map = index_1.OperatorType.greaterThanOrEqual;
            break;
        case '<>':
        case '!=':
        case 'NE':
            map = index_1.OperatorType.notEqual;
            break;
        case '*':
        case 'a*':
        case 'StartsWith':
            map = index_1.OperatorType.startsWith;
            break;
        case '*z':
        case 'EndsWith':
            map = index_1.OperatorType.endsWith;
            break;
        case '=':
        case '==':
        case 'EQ':
            map = index_1.OperatorType.equal;
            break;
        case 'IN':
            map = index_1.OperatorType.in;
            break;
        case 'NIN':
        case 'NOT_IN':
            map = index_1.OperatorType.notIn;
            break;
        case 'Not_Contains':
        case 'NOT_CONTAINS':
            map = index_1.OperatorType.notContains;
            break;
        case 'Contains':
        case 'CONTAINS':
        default:
            map = index_1.OperatorType.contains;
            break;
    }
    return map;
}
exports.mapOperatorType = mapOperatorType;
/**
 * Find equivalent short designation of an Operator Type or Operator String.
 * When using a Compound Filter, we use the short designation and so we need the mapped value.
 * For example OperatorType.startsWith short designation is "a*", while OperatorType.greaterThanOrEqual is ">="
 */
function mapOperatorToShorthandDesignation(operator) {
    let shortOperator = '';
    switch (operator) {
        case index_1.OperatorType.greaterThan:
        case '>':
            shortOperator = '>';
            break;
        case index_1.OperatorType.greaterThanOrEqual:
        case '>=':
            shortOperator = '>=';
            break;
        case index_1.OperatorType.lessThan:
        case '<':
            shortOperator = '<';
            break;
        case index_1.OperatorType.lessThanOrEqual:
        case '<=':
            shortOperator = '<=';
            break;
        case index_1.OperatorType.notEqual:
        case '<>':
            shortOperator = '<>';
            break;
        case index_1.OperatorType.equal:
        case '=':
        case '==':
        case 'EQ':
            shortOperator = '=';
            break;
        case index_1.OperatorType.startsWith:
        case 'a*':
        case '*':
            shortOperator = 'a*';
            break;
        case index_1.OperatorType.endsWith:
        case '*z':
            shortOperator = '*z';
            break;
        default:
            // any other operator will be considered as already a short expression, so we can return same input operator
            shortOperator = operator;
            break;
    }
    return shortOperator;
}
exports.mapOperatorToShorthandDesignation = mapOperatorToShorthandDesignation;
/**
 * Mapper for query operator by a Filter Type
 * For example a multiple-select typically uses 'IN' operator
 * @param operator
 * @returns string map
 */
function mapOperatorByFieldType(fieldType) {
    let map;
    if (isColumnDateType(fieldType)) {
        map = index_1.OperatorType.equal;
    }
    else {
        switch (fieldType) {
            case index_1.FieldType.unknown:
            case index_1.FieldType.string:
            case index_1.FieldType.text:
            case index_1.FieldType.password:
            case index_1.FieldType.readonly:
                map = index_1.OperatorType.contains;
                break;
            case index_1.FieldType.float:
            case index_1.FieldType.number:
            default:
                map = index_1.OperatorType.equal;
                break;
        }
    }
    return map;
}
exports.mapOperatorByFieldType = mapOperatorByFieldType;
/**
 * Takes an object and allow to provide a property key to omit from the original object
 * @param {Object} obj - input object
 * @param {String} omitKey - object property key to omit
 * @returns {String} original object without the property that user wants to omit
 */
function objectWithoutKey(obj, omitKey) {
    return Object.keys(obj).reduce((result, objKey) => {
        if (objKey !== omitKey) {
            result[objKey] = obj[objKey];
        }
        return result;
    }, {});
}
exports.objectWithoutKey = objectWithoutKey;
/**
 * Parse a date passed as a string (Date only, without time) and return a Date object (if valid)
 * @param inputDateString
 * @returns string date formatted
 */
function parseUtcDate(inputDateString, useUtc) {
    let date = '';
    if (typeof inputDateString === 'string' && /^[0-9\-\/]*$/.test(inputDateString)) {
        // get the UTC datetime with moment.js but we need to decode the value so that it's valid text
        const dateString = decodeURIComponent(inputDateString);
        const dateMoment = moment(new Date(dateString));
        if (dateMoment.isValid() && dateMoment.year().toString().length === 4) {
            date = (useUtc) ? dateMoment.utc().format() : dateMoment.format();
        }
    }
    return date;
}
exports.parseUtcDate = parseUtcDate;
/**
 * Format a number or a string into a string that is separated every thousand,
 * the default separator is a comma but user can optionally pass a different one
 * @param inputValue
 * @param separator default to comma ","
 * @returns string
 */
function thousandSeparatorFormatted(inputValue, separator = ',') {
    if (inputValue !== null && inputValue !== undefined) {
        const stringValue = `${inputValue}`;
        const decimalSplit = stringValue.split('.');
        if (decimalSplit.length === 2) {
            return `${decimalSplit[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator)}.${decimalSplit[1]}`;
        }
        return stringValue.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    }
    return inputValue;
}
exports.thousandSeparatorFormatted = thousandSeparatorFormatted;
/**
 * Uses the logic function to find an item in an array or returns the default
 * value provided (empty object by default)
 * @param any[] array the array to filter
 * @param function logic the logic to find the item
 * @param any [defaultVal={}] the default value to return
 * @return object the found object or default value
 */
function findOrDefault(array, logic, defaultVal = {}) {
    if (Array.isArray(array)) {
        return array.find(logic) || defaultVal;
    }
    return array;
}
exports.findOrDefault = findOrDefault;
/**
 * Unsubscribe all Subscriptions
 * It will return an empty array if it all went well
 * @param subscriptions
 */
function unsubscribeAll(subscriptions) {
    if (Array.isArray(subscriptions)) {
        while (subscriptions.length > 0) {
            const subscription = subscriptions.pop();
            if (subscription === null || subscription === void 0 ? void 0 : subscription.unsubscribe) {
                subscription.unsubscribe();
            }
        }
    }
    return subscriptions;
}
exports.unsubscribeAll = unsubscribeAll;
//# sourceMappingURL=utilities.js.map