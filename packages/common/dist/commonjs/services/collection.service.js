"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionService = void 0;
const utils_1 = require("@slickgrid-universal/utils");
const index_1 = require("./../enums/index");
const sortUtilities_1 = require("../sortComparers/sortUtilities");
class CollectionService {
    constructor(translaterService) {
        this.translaterService = translaterService;
    }
    /**
     * Filter 1 or more items from a collection
     * @param collection
     * @param filterByOptions
     */
    filterCollection(collection, filterByOptions, filterResultBy = index_1.FilterMultiplePassType.chain) {
        let filteredCollection = [];
        // when it's array, we will use the new filtered collection after every pass
        // basically if input collection has 10 items on 1st pass and 1 item is filtered out, then on 2nd pass the input collection will be 9 items
        if (Array.isArray(filterByOptions)) {
            filteredCollection = (filterResultBy === index_1.FilterMultiplePassType.merge) ? [] : [...collection];
            for (const filter of filterByOptions) {
                if (filterResultBy === index_1.FilterMultiplePassType.merge) {
                    const filteredPass = this.singleFilterCollection(collection, filter);
                    filteredCollection = (0, utils_1.uniqueArray)([...filteredCollection, ...filteredPass]);
                }
                else {
                    filteredCollection = this.singleFilterCollection(filteredCollection, filter);
                }
            }
        }
        else {
            filteredCollection = this.singleFilterCollection(collection, filterByOptions);
        }
        return filteredCollection;
    }
    /**
     * Filter an item from a collection
     * @param collection
     * @param filterBy
     */
    singleFilterCollection(collection, filterBy) {
        let filteredCollection = [];
        if (filterBy) {
            const objectProperty = filterBy.property;
            const operator = filterBy.operator || index_1.OperatorType.equal;
            // just check for undefined since the filter value could be null, 0, '', false etc
            const value = typeof filterBy.value === 'undefined' ? '' : filterBy.value;
            switch (operator) {
                case index_1.OperatorType.equal:
                    if (objectProperty) {
                        filteredCollection = collection.filter((item) => item[objectProperty] === value);
                    }
                    else {
                        filteredCollection = collection.filter((item) => item === value);
                    }
                    break;
                case index_1.OperatorType.contains:
                    if (objectProperty) {
                        filteredCollection = collection.filter((item) => { var _a; return ((_a = item[objectProperty]) === null || _a === void 0 ? void 0 : _a.toString().indexOf(value.toString())) !== -1; });
                    }
                    else {
                        filteredCollection = collection.filter((item) => (item !== null && item !== undefined) && item.toString().indexOf(value.toString()) !== -1);
                    }
                    break;
                case index_1.OperatorType.notContains:
                    if (objectProperty) {
                        filteredCollection = collection.filter((item) => { var _a; return ((_a = item[objectProperty]) === null || _a === void 0 ? void 0 : _a.toString().indexOf(value.toString())) === -1; });
                    }
                    else {
                        filteredCollection = collection.filter((item) => (item !== null && item !== undefined) && item.toString().indexOf(value.toString()) === -1);
                    }
                    break;
                case index_1.OperatorType.notEqual:
                default:
                    if (objectProperty) {
                        filteredCollection = collection.filter((item) => item[objectProperty] !== value);
                    }
                    else {
                        filteredCollection = collection.filter((item) => item !== value);
                    }
            }
        }
        return filteredCollection;
    }
    /**
     * Sort 1 or more items in a collection
     * @param column definition
     * @param collection
     * @param sortByOptions
     * @param enableTranslateLabel
     */
    sortCollection(columnDef, collection, sortByOptions, enableTranslateLabel) {
        var _a, _b, _c, _d;
        if (enableTranslateLabel && (!this.translaterService || !this.translaterService.translate)) {
            throw new Error('[Slickgrid-Universal] requires a Translate Service to be installed and configured when the grid option "enableTranslate" is enabled.');
        }
        let sortedCollection = [];
        if (sortByOptions) {
            if (Array.isArray(sortByOptions)) {
                // multi-sort
                sortedCollection = collection.sort((dataRow1, dataRow2) => {
                    var _a, _b, _c, _d;
                    for (let i = 0, l = sortByOptions.length; i < l; i++) {
                        const sortBy = sortByOptions[i];
                        if (sortBy === null || sortBy === void 0 ? void 0 : sortBy.property) {
                            // collection of objects with a property name provided
                            const sortDirection = sortBy.sortDesc ? index_1.SortDirectionNumber.desc : index_1.SortDirectionNumber.asc;
                            const objectProperty = sortBy.property;
                            const fieldType = (_b = (_a = sortBy === null || sortBy === void 0 ? void 0 : sortBy.fieldType) !== null && _a !== void 0 ? _a : columnDef === null || columnDef === void 0 ? void 0 : columnDef.type) !== null && _b !== void 0 ? _b : index_1.FieldType.string;
                            const value1 = (enableTranslateLabel) ? ((_c = this.translaterService) === null || _c === void 0 ? void 0 : _c.translate) && this.translaterService.translate((dataRow1[objectProperty] || ' ')) : dataRow1[objectProperty];
                            const value2 = (enableTranslateLabel) ? ((_d = this.translaterService) === null || _d === void 0 ? void 0 : _d.translate) && this.translaterService.translate((dataRow2[objectProperty] || ' ')) : dataRow2[objectProperty];
                            const sortResult = (0, sortUtilities_1.sortByFieldType)(fieldType, value1, value2, sortDirection, columnDef);
                            if (sortResult !== index_1.SortDirectionNumber.neutral) {
                                return sortResult;
                            }
                        }
                    }
                    return index_1.SortDirectionNumber.neutral;
                });
            }
            else if (sortByOptions === null || sortByOptions === void 0 ? void 0 : sortByOptions.property) {
                // single sort
                // collection of objects with a property name provided
                const objectProperty = sortByOptions.property;
                const sortDirection = sortByOptions.sortDesc ? index_1.SortDirectionNumber.desc : index_1.SortDirectionNumber.asc;
                const fieldType = (_b = (_a = sortByOptions === null || sortByOptions === void 0 ? void 0 : sortByOptions.fieldType) !== null && _a !== void 0 ? _a : columnDef === null || columnDef === void 0 ? void 0 : columnDef.type) !== null && _b !== void 0 ? _b : index_1.FieldType.string;
                sortedCollection = collection.sort((dataRow1, dataRow2) => {
                    var _a, _b;
                    const value1 = (enableTranslateLabel) ? ((_a = this.translaterService) === null || _a === void 0 ? void 0 : _a.translate) && this.translaterService.translate((dataRow1[objectProperty] || ' ')) : dataRow1[objectProperty];
                    const value2 = (enableTranslateLabel) ? ((_b = this.translaterService) === null || _b === void 0 ? void 0 : _b.translate) && this.translaterService.translate((dataRow2[objectProperty] || ' ')) : dataRow2[objectProperty];
                    const sortResult = (0, sortUtilities_1.sortByFieldType)(fieldType, value1, value2, sortDirection, columnDef);
                    if (sortResult !== index_1.SortDirectionNumber.neutral) {
                        return sortResult;
                    }
                    return index_1.SortDirectionNumber.neutral;
                });
            }
            else if (sortByOptions && !sortByOptions.property) {
                const sortDirection = sortByOptions.sortDesc ? index_1.SortDirectionNumber.desc : index_1.SortDirectionNumber.asc;
                const fieldType = (_d = (_c = sortByOptions === null || sortByOptions === void 0 ? void 0 : sortByOptions.fieldType) !== null && _c !== void 0 ? _c : columnDef === null || columnDef === void 0 ? void 0 : columnDef.type) !== null && _d !== void 0 ? _d : index_1.FieldType.string;
                sortedCollection = collection.sort((dataRow1, dataRow2) => {
                    var _a, _b;
                    const value1 = (enableTranslateLabel) ? ((_a = this.translaterService) === null || _a === void 0 ? void 0 : _a.translate) && this.translaterService.translate(dataRow1 || ' ') : dataRow1;
                    const value2 = (enableTranslateLabel) ? ((_b = this.translaterService) === null || _b === void 0 ? void 0 : _b.translate) && this.translaterService.translate(dataRow2 || ' ') : dataRow2;
                    const sortResult = (0, sortUtilities_1.sortByFieldType)(fieldType, value1, value2, sortDirection, columnDef);
                    if (sortResult !== index_1.SortDirectionNumber.neutral) {
                        return sortResult;
                    }
                    return index_1.SortDirectionNumber.neutral;
                });
            }
        }
        return sortedCollection;
    }
}
exports.CollectionService = CollectionService;
//# sourceMappingURL=collection.service.js.map