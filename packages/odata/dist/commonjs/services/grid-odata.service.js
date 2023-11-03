"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GridOdataService = void 0;
const common_1 = require("@slickgrid-universal/common");
const utils_1 = require("@slickgrid-universal/utils");
const odataQueryBuilder_service_1 = require("./odataQueryBuilder.service");
const DEFAULT_ITEMS_PER_PAGE = 25;
const DEFAULT_PAGE_SIZE = 20;
class GridOdataService {
    /** Getter for the Column Definitions */
    get columnDefinitions() {
        return this._columnDefinitions;
    }
    /** Getter for the Odata Service */
    get odataService() {
        return this._odataService;
    }
    /** Getter for the Grid Options pulled through the Grid Object */
    get _gridOptions() {
        var _a;
        return ((_a = this._grid) === null || _a === void 0 ? void 0 : _a.getOptions) ? this._grid.getOptions() : {};
    }
    constructor() {
        this._currentFilters = [];
        this._currentPagination = null;
        this._currentSorters = [];
        this._columnDefinitions = [];
        this.defaultOptions = {
            top: DEFAULT_ITEMS_PER_PAGE,
            orderBy: '',
            caseType: common_1.CaseType.pascalCase
        };
        this._odataService = new odataQueryBuilder_service_1.OdataQueryBuilderService();
    }
    init(serviceOptions, pagination, grid, sharedService) {
        var _a, _b;
        this._grid = grid;
        const mergedOptions = { ...this.defaultOptions, ...serviceOptions };
        // unless user specifically set "enablePagination" to False, we'll add "top" property for the pagination in every other cases
        if (this._gridOptions && !this._gridOptions.enablePagination) {
            // save current pagination as Page 1 and page size as "top"
            this._odataService.options = { ...mergedOptions, top: undefined };
            this._currentPagination = null;
        }
        else {
            const topOption = (pagination && pagination.pageSize) ? pagination.pageSize : this.defaultOptions.top;
            this._odataService.options = { ...mergedOptions, top: topOption };
            this._currentPagination = {
                pageNumber: 1,
                pageSize: this._odataService.options.top || this.defaultOptions.top || DEFAULT_PAGE_SIZE
            };
        }
        this.options = this._odataService.options;
        this.pagination = pagination;
        if (grid === null || grid === void 0 ? void 0 : grid.getColumns) {
            const tmpColumnDefinitions = (_b = (_a = sharedService === null || sharedService === void 0 ? void 0 : sharedService.allColumns) !== null && _a !== void 0 ? _a : grid.getColumns()) !== null && _b !== void 0 ? _b : [];
            this._columnDefinitions = tmpColumnDefinitions.filter((column) => !column.excludeFromQuery);
        }
        this._odataService.columnDefinitions = this._columnDefinitions;
        this._odataService.datasetIdPropName = this._gridOptions.datasetIdPropertyName || 'id';
    }
    buildQuery() {
        return this._odataService.buildQuery();
    }
    postProcess(processResult) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
        const odataVersion = (_c = (_b = (_a = this._odataService) === null || _a === void 0 ? void 0 : _a.options) === null || _b === void 0 ? void 0 : _b.version) !== null && _c !== void 0 ? _c : 2;
        if (this.pagination && ((_e = (_d = this._odataService) === null || _d === void 0 ? void 0 : _d.options) === null || _e === void 0 ? void 0 : _e.enableCount)) {
            const countExtractor = ((_h = (_g = (_f = this._odataService) === null || _f === void 0 ? void 0 : _f.options) === null || _g === void 0 ? void 0 : _g.countExtractor) !== null && _h !== void 0 ? _h : odataVersion >= 4) ? (r) => r === null || r === void 0 ? void 0 : r['@odata.count'] :
                odataVersion === 3 ? (r) => r === null || r === void 0 ? void 0 : r['__count'] :
                    (r) => { var _a; return (_a = r === null || r === void 0 ? void 0 : r.d) === null || _a === void 0 ? void 0 : _a['__count']; };
            const count = countExtractor(processResult);
            if (typeof count === 'number') {
                this.pagination.totalItems = count;
            }
        }
        if ((_k = (_j = this._odataService) === null || _j === void 0 ? void 0 : _j.options) === null || _k === void 0 ? void 0 : _k.enableExpand) {
            const datasetExtractor = ((_o = (_m = (_l = this._odataService) === null || _l === void 0 ? void 0 : _l.options) === null || _m === void 0 ? void 0 : _m.datasetExtractor) !== null && _o !== void 0 ? _o : odataVersion >= 4) ? (r) => r === null || r === void 0 ? void 0 : r.value :
                odataVersion === 3 ? (r) => r === null || r === void 0 ? void 0 : r.results :
                    (r) => { var _a; return (_a = r === null || r === void 0 ? void 0 : r.d) === null || _a === void 0 ? void 0 : _a.results; };
            const dataset = datasetExtractor(processResult);
            if (Array.isArray(dataset)) {
                // Flatten navigation fields (fields containing /) in the dataset (regardless of enableExpand).
                // E.g. given columndefinition 'product/name' and dataset [{id: 1,product:{'name':'flowers'}}], then flattens to [{id:1,'product/name':'flowers'}]
                const navigationFields = new Set(this._columnDefinitions.flatMap(x => { var _a; return (_a = x.fields) !== null && _a !== void 0 ? _a : [x.field]; }).filter(x => x.includes('/')));
                if (navigationFields.size > 0) {
                    const navigations = new Set();
                    for (const item of dataset) {
                        for (const field of navigationFields) {
                            const names = field.split('/');
                            const navigation = names[0];
                            navigations.add(navigation);
                            let val = item[navigation];
                            for (let i = 1; i < names.length; i++) {
                                const mappedName = names[i];
                                if (val && typeof val === 'object' && mappedName in val) {
                                    val = val[mappedName];
                                }
                            }
                            item[field] = val;
                        }
                        // Remove navigation objects from the dataset to free memory and make sure we never work with them.
                        for (const navigation of navigations) {
                            if (typeof item[navigation] === 'object') {
                                delete item[navigation];
                            }
                        }
                    }
                }
            }
        }
    }
    clearFilters() {
        this._currentFilters = [];
        this.updateFilters([]);
    }
    clearSorters() {
        this._currentSorters = [];
        this.updateSorters([]);
    }
    updateOptions(serviceOptions) {
        this.options = { ...this.options, ...serviceOptions };
        this._odataService.options = this.options;
    }
    removeColumnFilter(fieldName) {
        this._odataService.removeColumnFilter(fieldName);
    }
    /** Get the Filters that are currently used by the grid */
    getCurrentFilters() {
        return this._currentFilters;
    }
    /** Get the Pagination that is currently used by the grid */
    getCurrentPagination() {
        return this._currentPagination;
    }
    /** Get the Sorters that are currently used by the grid */
    getCurrentSorters() {
        return this._currentSorters;
    }
    /**
     * Mapper for mathematical operators (ex.: <= is "le", > is "gt")
     * @param string operator
     * @returns string map
     */
    mapOdataOperator(operator) {
        let map = '';
        switch (operator) {
            case '<':
                map = 'lt';
                break;
            case '<=':
                map = 'le';
                break;
            case '>':
                map = 'gt';
                break;
            case '>=':
                map = 'ge';
                break;
            case '<>':
            case '!=':
                map = 'ne';
                break;
            case '=':
            case '==':
            default:
                map = 'eq';
                break;
        }
        return map;
    }
    /*
     * Reset the pagination options
     */
    resetPaginationOptions() {
        this._odataService.updateOptions({
            skip: 0
        });
    }
    saveColumnFilter(fieldName, value, terms) {
        this._odataService.saveColumnFilter(fieldName, value, terms);
    }
    /*
     * FILTERING
     */
    processOnFilterChanged(_event, args) {
        const gridOptions = this._gridOptions;
        const backendApi = gridOptions.backendServiceApi;
        if (backendApi === undefined) {
            throw new Error('Something went wrong in the GridOdataService, "backendServiceApi" is not initialized');
        }
        // keep current filters & always save it as an array (columnFilters can be an object when it is dealt by SlickGrid Filter)
        this._currentFilters = this.castFilterToColumnFilters(args.columnFilters);
        if (!args || !args.grid) {
            throw new Error('Something went wrong when trying create the GridOdataService, it seems that "args" is not populated correctly');
        }
        // loop through all columns to inspect filters & set the query
        this.updateFilters(args.columnFilters);
        this.resetPaginationOptions();
        return this._odataService.buildQuery();
    }
    /*
     * PAGINATION
     */
    processOnPaginationChanged(_event, args) {
        const pageSize = +(args.pageSize || ((this.pagination) ? this.pagination.pageSize : DEFAULT_PAGE_SIZE));
        this.updatePagination(args.newPage, pageSize);
        // build the OData query which we will use in the WebAPI callback
        return this._odataService.buildQuery();
    }
    /*
     * SORTING
     */
    processOnSortChanged(_event, args) {
        const sortColumns = (args.multiColumnSort) ? args.sortCols : new Array({ columnId: args.sortCol.id, sortCol: args.sortCol, sortAsc: args.sortAsc });
        // loop through all columns to inspect sorters & set the query
        this.updateSorters(sortColumns);
        // build the OData query which we will use in the WebAPI callback
        return this._odataService.buildQuery();
    }
    /**
     * loop through all columns to inspect filters & update backend service filters
     * @param columnFilters
     */
    updateFilters(columnFilters, isUpdatedByPresetOrDynamically) {
        var _a, _b, _c, _d, _e, _f;
        let searchBy = '';
        const searchByArray = [];
        const odataVersion = (_c = (_b = (_a = this._odataService) === null || _a === void 0 ? void 0 : _a.options) === null || _b === void 0 ? void 0 : _b.version) !== null && _c !== void 0 ? _c : 2;
        // on filter preset load, we need to keep current filters
        if (isUpdatedByPresetOrDynamically) {
            this._currentFilters = this.castFilterToColumnFilters(columnFilters);
        }
        // loop through all columns to inspect filters
        for (const columnId in columnFilters) {
            if (columnFilters.hasOwnProperty(columnId)) {
                const columnFilter = columnFilters[columnId];
                // if user defined some "presets", then we need to find the filters from the column definitions instead
                let columnDef;
                if (isUpdatedByPresetOrDynamically && Array.isArray(this._columnDefinitions)) {
                    columnDef = this._columnDefinitions.find((column) => column.id === columnFilter.columnId);
                }
                else {
                    columnDef = columnFilter.columnDef;
                }
                if (!columnDef) {
                    throw new Error('[GridOData Service]: Something went wrong in trying to get the column definition of the specified filter (or preset filters). Did you make a typo on the filter columnId?');
                }
                let fieldName = ((_d = columnDef.filter) === null || _d === void 0 ? void 0 : _d.queryField) || columnDef.queryFieldFilter || columnDef.queryField || columnDef.field || columnDef.name || '';
                const fieldType = columnDef.type || common_1.FieldType.string;
                let searchTerms = (columnFilter && columnFilter.searchTerms ? [...columnFilter.searchTerms] : null) || [];
                let fieldSearchValue = (Array.isArray(searchTerms) && searchTerms.length === 1) ? searchTerms[0] : '';
                if (typeof fieldSearchValue === 'undefined') {
                    fieldSearchValue = '';
                }
                if (!fieldName) {
                    throw new Error(`GridOData filter could not find the field name to query the search, your column definition must include a valid "field" or "name" (optionally you can also use the "queryfield").`);
                }
                fieldSearchValue = (fieldSearchValue === undefined || fieldSearchValue === null) ? '' : `${fieldSearchValue}`; // make sure it's a string
                // run regex to find possible filter operators unless the user disabled the feature
                const autoParseInputFilterOperator = (_e = columnDef.autoParseInputFilterOperator) !== null && _e !== void 0 ? _e : this._gridOptions.autoParseInputFilterOperator;
                const matches = autoParseInputFilterOperator !== false
                    ? fieldSearchValue.match(/^([<>!=\*]{0,2})(.*[^<>!=\*])([\*]?)$/) // group 1: Operator, 2: searchValue, 3: last char is '*' (meaning starts with, ex.: abc*)
                    : [fieldSearchValue, '', fieldSearchValue, '']; // when parsing is disabled, we'll only keep the search value in the index 2 to make it easy for code reuse
                let operator = columnFilter.operator || (matches === null || matches === void 0 ? void 0 : matches[1]);
                let searchValue = (matches === null || matches === void 0 ? void 0 : matches[2]) || '';
                const lastValueChar = (matches === null || matches === void 0 ? void 0 : matches[3]) || (operator === '*z' || operator === common_1.OperatorType.endsWith) ? '*' : '';
                const bypassOdataQuery = columnFilter.bypassBackendQuery || false;
                // no need to query if search value is empty
                if (fieldName && searchValue === '' && searchTerms.length <= 1) {
                    this.removeColumnFilter(fieldName);
                    continue;
                }
                if (Array.isArray(searchTerms) && searchTerms.length === 1 && typeof searchTerms[0] === 'string' && searchTerms[0].indexOf('..') >= 0) {
                    if (operator !== common_1.OperatorType.rangeInclusive && operator !== common_1.OperatorType.rangeExclusive) {
                        operator = (_f = this._gridOptions.defaultFilterRangeOperator) !== null && _f !== void 0 ? _f : common_1.OperatorType.rangeInclusive;
                    }
                    searchTerms = searchTerms[0].split('..', 2);
                    if (searchTerms[0] === '') {
                        operator = operator === common_1.OperatorType.rangeInclusive ? '<=' : operator === common_1.OperatorType.rangeExclusive ? '<' : operator;
                        searchTerms = searchTerms.slice(1);
                        searchValue = searchTerms[0];
                    }
                    else if (searchTerms[1] === '') {
                        operator = operator === common_1.OperatorType.rangeInclusive ? '>=' : operator === common_1.OperatorType.rangeExclusive ? '>' : operator;
                        searchTerms = searchTerms.slice(0, 1);
                        searchValue = searchTerms[0];
                    }
                }
                // if we didn't find an Operator but we have a Column Operator inside the Filter (DOM Element), we should use its default Operator
                // multipleSelect is "IN", while singleSelect is "EQ", else don't map any operator
                if (!operator && columnDef.filter) {
                    operator = columnDef.filter.operator;
                }
                // No operator and 2 search terms should lead to default range operator.
                if (!operator && Array.isArray(searchTerms) && searchTerms.length === 2 && searchTerms[0] && searchTerms[1]) {
                    operator = this._gridOptions.defaultFilterRangeOperator;
                }
                // Range with 1 searchterm should lead to equals for a date field.
                if ((operator === common_1.OperatorType.rangeInclusive || common_1.OperatorType.rangeExclusive) && Array.isArray(searchTerms) && searchTerms.length === 1 && fieldType === common_1.FieldType.date) {
                    operator = common_1.OperatorType.equal;
                }
                // if we still don't have an operator find the proper Operator to use by it's field type
                if (!operator) {
                    operator = (0, common_1.mapOperatorByFieldType)(fieldType);
                }
                // extra query arguments
                if (bypassOdataQuery) {
                    // push to our temp array and also trim white spaces
                    if (fieldName) {
                        this.saveColumnFilter(fieldName, fieldSearchValue, searchTerms);
                    }
                }
                else {
                    // Normalize all search values
                    searchValue = this.normalizeSearchValue(fieldType, searchValue, odataVersion);
                    if (Array.isArray(searchTerms)) {
                        searchTerms.forEach((_part, index) => {
                            searchTerms[index] = this.normalizeSearchValue(fieldType, searchTerms[index], odataVersion);
                        });
                    }
                    searchBy = '';
                    // titleCase the fieldName so that it matches the WebApi names
                    if (this._odataService.options.caseType === common_1.CaseType.pascalCase) {
                        fieldName = (0, utils_1.titleCase)(fieldName || '');
                    }
                    if (searchTerms && searchTerms.length > 1 && (operator === 'IN' || operator === 'NIN' || operator === 'NOTIN' || operator === 'NOT IN' || operator === 'NOT_IN')) {
                        // when having more than 1 search term (then check if we have a "IN" or "NOT IN" filter search)
                        const tmpSearchTerms = [];
                        if (operator === 'IN') {
                            // example:: (Stage eq "Expired" or Stage eq "Renewal")
                            for (let j = 0, lnj = searchTerms.length; j < lnj; j++) {
                                tmpSearchTerms.push(`${fieldName} eq ${searchTerms[j]}`);
                            }
                            searchBy = tmpSearchTerms.join(' or ');
                        }
                        else {
                            // example:: (Stage ne "Expired" and Stage ne "Renewal")
                            for (let k = 0, lnk = searchTerms.length; k < lnk; k++) {
                                tmpSearchTerms.push(`${fieldName} ne ${searchTerms[k]}`);
                            }
                            searchBy = tmpSearchTerms.join(' and ');
                        }
                        if (!(typeof searchBy === 'string' && searchBy[0] === '(' && searchBy.slice(-1) === ')')) {
                            searchBy = `(${searchBy})`;
                        }
                    }
                    else if (operator === '*' || operator === 'a*' || operator === '*z' || lastValueChar === '*' || operator === common_1.OperatorType.startsWith || operator === common_1.OperatorType.endsWith) {
                        // first/last character is a '*' will be a startsWith or endsWith
                        searchBy = (operator === '*' || operator === '*z' || operator === common_1.OperatorType.endsWith) ? `endswith(${fieldName}, ${searchValue})` : `startswith(${fieldName}, ${searchValue})`;
                    }
                    else if (operator === common_1.OperatorType.rangeExclusive || operator === common_1.OperatorType.rangeInclusive) {
                        // example:: (Name >= 'Bob' and Name <= 'Jane')
                        searchBy = this.filterBySearchTermRange(fieldName, operator, searchTerms);
                    }
                    else if ((operator === '' || operator === common_1.OperatorType.contains || operator === common_1.OperatorType.notContains) &&
                        (fieldType === common_1.FieldType.string || fieldType === common_1.FieldType.text || fieldType === common_1.FieldType.readonly)) {
                        searchBy = odataVersion >= 4 ? `contains(${fieldName}, ${searchValue})` : `substringof(${searchValue}, ${fieldName})`;
                        if (operator === common_1.OperatorType.notContains) {
                            searchBy = `not ${searchBy}`;
                        }
                    }
                    else {
                        // any other field type (or undefined type)
                        searchBy = `${fieldName} ${this.mapOdataOperator(operator)} ${searchValue}`;
                    }
                    // push to our temp array and also trim white spaces
                    if (searchBy !== '') {
                        searchByArray.push(searchBy.trim());
                        this.saveColumnFilter(fieldName || '', fieldSearchValue, searchValue);
                    }
                }
            }
        }
        // update the service options with filters for the buildQuery() to work later
        this._odataService.updateOptions({
            filter: (searchByArray.length > 0) ? searchByArray.join(' and ') : '',
            skip: undefined
        });
    }
    /**
     * Update the pagination component with it's new page number and size
     * @param newPage
     * @param pageSize
     */
    updatePagination(newPage, pageSize) {
        this._currentPagination = {
            pageNumber: newPage,
            pageSize,
        };
        // unless user specifically set "enablePagination" to False, we'll update pagination options in every other cases
        if (this._gridOptions && (this._gridOptions.enablePagination || !this._gridOptions.hasOwnProperty('enablePagination'))) {
            this._odataService.updateOptions({
                top: pageSize,
                skip: (newPage - 1) * pageSize
            });
        }
    }
    /**
     * loop through all columns to inspect sorters & update backend service orderBy
     * @param columnFilters
     */
    updateSorters(sortColumns, presetSorters) {
        let currentSorters = [];
        const odataSorters = [];
        if (!sortColumns && presetSorters) {
            // make the presets the current sorters, also make sure that all direction are in lowercase for OData
            currentSorters = presetSorters;
            currentSorters.forEach((sorter) => sorter.direction = sorter.direction.toLowerCase());
            // display the correct sorting icons on the UI, for that it requires (columnId, sortAsc) properties
            const tmpSorterArray = currentSorters.map((sorter) => {
                const columnDef = this._columnDefinitions.find((column) => column.id === sorter.columnId);
                odataSorters.push({
                    field: columnDef ? ((columnDef.queryFieldSorter || columnDef.queryField || columnDef.field) + '') : (sorter.columnId + ''),
                    direction: sorter.direction
                });
                // return only the column(s) found in the Column Definitions ELSE null
                if (columnDef) {
                    return {
                        columnId: sorter.columnId,
                        sortAsc: sorter.direction.toUpperCase() === common_1.SortDirection.ASC
                    };
                }
                return null;
            });
            // set the sort icons, but also make sure to filter out null values (that happens when columnDef is not found)
            if (Array.isArray(tmpSorterArray) && this._grid) {
                this._grid.setSortColumns(tmpSorterArray);
            }
        }
        else if (sortColumns && !presetSorters) {
            // build the SortBy string, it could be multisort, example: customerNo asc, purchaserName desc
            if ((sortColumns === null || sortColumns === void 0 ? void 0 : sortColumns.length) === 0) {
                // TODO fix this line
                // currentSorters = new Array(this.defaultOptions.orderBy); // when empty, use the default sort
            }
            else {
                if (sortColumns) {
                    for (const columnDef of sortColumns) {
                        if (columnDef.sortCol) {
                            let fieldName = (columnDef.sortCol.queryFieldSorter || columnDef.sortCol.queryField || columnDef.sortCol.field) + '';
                            let columnFieldName = (columnDef.sortCol.field || columnDef.sortCol.id) + '';
                            let queryField = (columnDef.sortCol.queryFieldSorter || columnDef.sortCol.queryField || columnDef.sortCol.field || '') + '';
                            if (this._odataService.options.caseType === common_1.CaseType.pascalCase) {
                                fieldName = (0, utils_1.titleCase)(fieldName);
                                columnFieldName = (0, utils_1.titleCase)(columnFieldName);
                                queryField = (0, utils_1.titleCase)(queryField);
                            }
                            if (columnFieldName !== '') {
                                currentSorters.push({
                                    columnId: columnFieldName,
                                    direction: columnDef.sortAsc ? 'asc' : 'desc'
                                });
                            }
                            if (queryField !== '') {
                                odataSorters.push({
                                    field: queryField,
                                    direction: columnDef.sortAsc ? common_1.SortDirection.ASC : common_1.SortDirection.DESC
                                });
                            }
                        }
                    }
                }
            }
        }
        // transform the sortby array into a CSV string for OData
        currentSorters = currentSorters || [];
        const csvString = odataSorters.map((sorter) => {
            let str = '';
            if (sorter && sorter.field) {
                const sortField = (this._odataService.options.caseType === common_1.CaseType.pascalCase) ? (0, utils_1.titleCase)(sorter.field) : sorter.field;
                str = `${sortField} ${sorter && sorter.direction && sorter.direction.toLowerCase() || ''}`;
            }
            return str;
        }).join(',');
        this._odataService.updateOptions({
            orderBy: csvString
        });
        // keep current Sorters and update the service options with the new sorting
        this._currentSorters = currentSorters;
        // build the OData query which we will use in the WebAPI callback
        return this._odataService.buildQuery();
    }
    //
    // protected functions
    // -------------------
    /**
     * Cast provided filters (could be in multiple format) into an array of ColumnFilter
     * @param columnFilters
     */
    castFilterToColumnFilters(columnFilters) {
        // keep current filters & always save it as an array (columnFilters can be an object when it is dealt by SlickGrid Filter)
        const filtersArray = (typeof columnFilters === 'object') ? Object.keys(columnFilters).map(key => columnFilters[key]) : columnFilters;
        if (!Array.isArray(filtersArray)) {
            return [];
        }
        return filtersArray.map((filter) => {
            const tmpFilter = { columnId: filter.columnId || '' };
            if (filter.operator) {
                tmpFilter.operator = filter.operator;
            }
            if (filter.targetSelector) {
                tmpFilter.targetSelector = filter.targetSelector;
            }
            if (Array.isArray(filter.searchTerms)) {
                tmpFilter.searchTerms = filter.searchTerms;
            }
            return tmpFilter;
        });
    }
    /**
     * Filter by a range of searchTerms (2 searchTerms OR 1 string separated by 2 dots "value1..value2")
     */
    filterBySearchTermRange(fieldName, operator, searchTerms) {
        let query = '';
        if (Array.isArray(searchTerms) && searchTerms.length === 2) {
            if (operator === common_1.OperatorType.rangeInclusive) {
                // example:: (Duration >= 5 and Duration <= 10)
                query = `(${fieldName} ge ${searchTerms[0]}`;
                if (searchTerms[1] !== '') {
                    query += ` and ${fieldName} le ${searchTerms[1]}`;
                }
                query += ')';
            }
            else if (operator === common_1.OperatorType.rangeExclusive) {
                // example:: (Duration > 5 and Duration < 10)
                query = `(${fieldName} gt ${searchTerms[0]}`;
                if (searchTerms[1] !== '') {
                    query += ` and ${fieldName} lt ${searchTerms[1]}`;
                }
                query += ')';
            }
        }
        return query;
    }
    /**
     * Normalizes the search value according to field type and oData version.
     */
    normalizeSearchValue(fieldType, searchValue, version) {
        switch (fieldType) {
            case common_1.FieldType.date:
                searchValue = (0, common_1.parseUtcDate)(searchValue, true);
                searchValue = version >= 4 ? searchValue : `DateTime'${searchValue}'`;
                break;
            case common_1.FieldType.string:
            case common_1.FieldType.text:
            case common_1.FieldType.readonly:
                if (typeof searchValue === 'string') {
                    // escape single quotes by doubling them
                    searchValue = searchValue.replace(/'/g, `''`);
                    // encode URI of the final search value
                    searchValue = encodeURIComponent(searchValue);
                    // strings need to be quoted.
                    searchValue = `'${searchValue}'`;
                }
                break;
            case common_1.FieldType.integer:
            case common_1.FieldType.number:
            case common_1.FieldType.float:
                if (typeof searchValue === 'string') {
                    // Parse a valid decimal from the string.
                    // Replace double dots with single dots
                    searchValue = searchValue.replace(/\.\./g, '.');
                    // Remove a trailing dot
                    searchValue = searchValue.replace(/\.+$/g, '');
                    // Prefix a leading dot with 0
                    searchValue = searchValue.replace(/^\.+/g, '0.');
                    // Prefix leading dash dot with -0.
                    searchValue = searchValue.replace(/^\-+\.+/g, '-0.');
                    // Remove any non valid decimal characters from the search string
                    searchValue = searchValue.replace(/(?!^\-)[^\d\.]/g, '');
                    // if nothing left, search for 0
                    if (searchValue === '' || searchValue === '-') {
                        searchValue = '0';
                    }
                }
                break;
        }
        return searchValue;
    }
}
exports.GridOdataService = GridOdataService;
//# sourceMappingURL=grid-odata.service.js.map