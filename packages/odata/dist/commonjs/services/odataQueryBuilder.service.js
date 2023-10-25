"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OdataQueryBuilderService = void 0;
const common_1 = require("@slickgrid-universal/common");
const utils_1 = require("@slickgrid-universal/utils");
class OdataQueryBuilderService {
    set columnDefinitions(columnDefinitions) {
        this._columnDefinitions = columnDefinitions;
    }
    set datasetIdPropName(datasetIdPropName) {
        this._datasetIdPropName = datasetIdPropName;
    }
    constructor() {
        this._filterCount = 0;
        this._columnDefinitions = [];
        this._datasetIdPropName = 'id';
        this._odataOptions = {
            filterQueue: [],
            orderBy: ''
        };
        this._defaultSortBy = '';
        this._columnFilters = {};
    }
    /*
      * Build the OData query string from all the options provided
      * @return string OData query
      */
    buildQuery() {
        if (!this._odataOptions) {
            throw new Error('Odata Service requires certain options like "top" for it to work');
        }
        this._odataOptions.filterQueue = [];
        const queryTmpArray = [];
        // When enableCount is set, add it to the OData query
        if (this._odataOptions && this._odataOptions.enableCount === true) {
            const countQuery = (this._odataOptions.version && this._odataOptions.version >= 4) ? '$count=true' : '$inlinecount=allpages';
            queryTmpArray.push(countQuery);
        }
        if (this._odataOptions.top) {
            queryTmpArray.push(`$top=${this._odataOptions.top}`);
        }
        if (this._odataOptions.skip) {
            queryTmpArray.push(`$skip=${this._odataOptions.skip}`);
        }
        if (this._odataOptions.orderBy) {
            let argument = '';
            if (Array.isArray(this._odataOptions.orderBy)) {
                argument = this._odataOptions.orderBy.join(','); // csv, that will form a query, for example: $orderby=RoleName asc, Id desc
            }
            else {
                argument = this._odataOptions.orderBy;
            }
            queryTmpArray.push(`$orderby=${argument}`);
        }
        if (this._odataOptions.filterBy || this._odataOptions.filter) {
            const filterBy = this._odataOptions.filter || this._odataOptions.filterBy;
            if (filterBy) {
                this._filterCount = 1;
                this._odataOptions.filterQueue = [];
                let filterStr = filterBy;
                if (Array.isArray(filterBy)) {
                    this._filterCount = filterBy.length;
                    filterStr = filterBy.join(` ${this._odataOptions.filterBySeparator || 'and'} `);
                }
                if (typeof filterStr === 'string') {
                    if (!(filterStr[0] === '(' && filterStr.slice(-1) === ')')) {
                        this.addToFilterQueueWhenNotExists(`(${filterStr})`);
                    }
                    else {
                        this.addToFilterQueueWhenNotExists(filterStr);
                    }
                }
            }
        }
        if (this._odataOptions.filterQueue.length > 0) {
            const query = this._odataOptions.filterQueue.join(` ${this._odataOptions.filterBySeparator || 'and'} `);
            this._odataOptions.filter = query; // overwrite with
            queryTmpArray.push(`$filter=${query}`);
        }
        if (this._odataOptions.enableSelect || this._odataOptions.enableExpand) {
            const fields = this._columnDefinitions.flatMap(x => { var _a; return (_a = x.fields) !== null && _a !== void 0 ? _a : [x.field]; });
            fields.unshift(this._datasetIdPropName);
            const selectExpand = this.buildSelectExpand([...new Set(fields)]);
            if (this._odataOptions.enableSelect) {
                const select = selectExpand.selectParts.join(',');
                queryTmpArray.push(`$select=${select}`);
            }
            if (this._odataOptions.enableExpand) {
                const expand = selectExpand.expandParts.join(',');
                queryTmpArray.push(`$expand=${expand}`);
            }
        }
        // join all the odata functions by a '&'
        return queryTmpArray.join('&');
    }
    getFilterCount() {
        return this._filterCount;
    }
    get columnFilters() {
        return this._columnFilters;
    }
    get options() {
        return this._odataOptions;
    }
    set options(options) {
        this._odataOptions = options;
    }
    removeColumnFilter(fieldName) {
        if (this._columnFilters && this._columnFilters.hasOwnProperty(fieldName)) {
            delete this._columnFilters[fieldName];
        }
    }
    saveColumnFilter(fieldName, value, searchTerms) {
        this._columnFilters[fieldName] = {
            search: searchTerms,
            value
        };
    }
    /**
     * Change any OData options that will be used to build the query
     * @param object options
     */
    updateOptions(options) {
        for (const property of Object.keys(options)) {
            if (options.hasOwnProperty(property)) {
                this._odataOptions[property] = options[property]; // replace of the property
            }
            // we need to keep the defaultSortBy for references whenever the user removes his Sorting
            // then we would revert to the defaultSortBy and the only way is to keep a hard copy here
            if (property === 'orderBy' || property === 'sortBy') {
                let sortBy = options[property];
                // make sure first char of each orderBy field is capitalize
                if (this._odataOptions.caseType === common_1.CaseType.pascalCase) {
                    if (Array.isArray(sortBy)) {
                        sortBy.forEach((field, index, inputArray) => {
                            inputArray[index] = (0, utils_1.titleCase)(field);
                        });
                    }
                    else {
                        sortBy = (0, utils_1.titleCase)(options[property]);
                    }
                }
                this._odataOptions.orderBy = sortBy;
                this._defaultSortBy = sortBy;
            }
        }
    }
    //
    // protected functions
    // -------------------
    addToFilterQueueWhenNotExists(filterStr) {
        if (this._odataOptions.filterQueue && this._odataOptions.filterQueue.indexOf(filterStr) === -1) {
            this._odataOptions.filterQueue.push(filterStr);
        }
    }
    //
    // private functions
    // -------------------
    buildSelectExpand(selectFields) {
        const navigations = {};
        const selectItems = new Set();
        for (const field of selectFields) {
            const splits = field.split('/');
            if (splits.length === 1) {
                selectItems.add(field);
            }
            else {
                const navigation = splits[0];
                const properties = splits.splice(1).join('/');
                if (!navigations[navigation]) {
                    navigations[navigation] = [];
                }
                navigations[navigation].push(properties);
                if (this._odataOptions.enableExpand && !(this._odataOptions.version && this._odataOptions.version >= 4)) {
                    selectItems.add(navigation);
                }
            }
        }
        return {
            selectParts: [...selectItems],
            expandParts: this._odataOptions.enableExpand ? this.buildExpand(navigations) : []
        };
    }
    buildExpand(navigations) {
        const expandParts = [];
        for (const navigation of Object.keys(navigations)) {
            if (this._odataOptions.enableSelect && this._odataOptions.version && this._odataOptions.version >= 4) {
                const subSelectExpand = this.buildSelectExpand(navigations[navigation]);
                let subSelect = subSelectExpand.selectParts.join(',');
                if (subSelect.length > 0) {
                    subSelect = '$select=' + subSelect;
                }
                if (this._odataOptions.enableExpand && subSelectExpand.expandParts.length > 0) {
                    subSelect += (subSelect.length > 0 ? ';' : '') + '$expand=' + subSelectExpand.expandParts.join(',');
                }
                if (subSelect.length > 0) {
                    subSelect = '(' + subSelect + ')';
                }
                expandParts.push(navigation + subSelect);
            }
            else {
                expandParts.push(navigation);
            }
        }
        return expandParts;
    }
}
exports.OdataQueryBuilderService = OdataQueryBuilderService;
//# sourceMappingURL=odataQueryBuilder.service.js.map