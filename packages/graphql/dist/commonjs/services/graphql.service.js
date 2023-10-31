"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphqlService = void 0;
const common_1 = require("@slickgrid-universal/common");
const graphqlQueryBuilder_1 = require("./graphqlQueryBuilder");
const DEFAULT_ITEMS_PER_PAGE = 25;
const DEFAULT_PAGE_SIZE = 20;
class GraphqlService {
    constructor() {
        this._currentFilters = [];
        this._currentPagination = null;
        this._currentSorters = [];
        this._datasetIdPropName = 'id';
        this.defaultPaginationOptions = {
            first: DEFAULT_ITEMS_PER_PAGE,
            offset: 0
        };
    }
    /** Getter for the Column Definitions */
    get columnDefinitions() {
        return this._columnDefinitions;
    }
    /** Getter for the Grid Options pulled through the Grid Object */
    get _gridOptions() {
        var _a;
        return ((_a = this._grid) === null || _a === void 0 ? void 0 : _a.getOptions) ? this._grid.getOptions() : {};
    }
    /** Initialization of the service, which acts as a constructor */
    init(serviceOptions, pagination, grid, sharedService) {
        var _a, _b;
        this._grid = grid;
        this.options = serviceOptions || { datasetName: '' };
        this.pagination = pagination;
        this._datasetIdPropName = this._gridOptions.datasetIdPropertyName || 'id';
        if (grid && grid.getColumns) {
            this._columnDefinitions = (_b = (_a = sharedService === null || sharedService === void 0 ? void 0 : sharedService.allColumns) !== null && _a !== void 0 ? _a : grid.getColumns()) !== null && _b !== void 0 ? _b : [];
        }
    }
    /**
     * Build the GraphQL query, since the service include/exclude cursor, the output query will be different.
     * @param serviceOptions GraphqlServiceOption
     */
    buildQuery() {
        var _a, _b, _c, _d, _e, _f, _g;
        if (!this.options || !this.options.datasetName || !Array.isArray(this._columnDefinitions)) {
            throw new Error('GraphQL Service requires the "datasetName" property to properly build the GraphQL query');
        }
        // get the column definitions and exclude some if they were tagged as excluded
        let columnDefinitions = this._columnDefinitions || [];
        columnDefinitions = columnDefinitions.filter((column) => !column.excludeFromQuery);
        const queryQb = new graphqlQueryBuilder_1.default('query');
        const datasetQb = new graphqlQueryBuilder_1.default(this.options.datasetName);
        const nodesQb = new graphqlQueryBuilder_1.default('nodes');
        // get all the columnds Ids for the filters to work
        const columnIds = [];
        if (columnDefinitions && Array.isArray(columnDefinitions)) {
            for (const column of columnDefinitions) {
                columnIds.push(column.field);
                // if extra "fields" are passed, also push them to columnIds
                if (column.fields) {
                    columnIds.push(...column.fields);
                }
            }
        }
        // Slickgrid also requires the "id" field to be part of DataView
        // add it to the GraphQL query if it wasn't already part of the list
        if (columnIds.indexOf(this._datasetIdPropName) === -1) {
            columnIds.unshift(this._datasetIdPropName);
        }
        const columnsQuery = this.buildFilterQuery(columnIds);
        let graphqlNodeFields = [];
        if (this._gridOptions.enablePagination !== false) {
            if (this.options.isWithCursor) {
                // ...pageInfo { hasNextPage, endCursor }, edges { cursor, node { _columns_ } }, totalCount: 100
                const edgesQb = new graphqlQueryBuilder_1.default('edges');
                const pageInfoQb = new graphqlQueryBuilder_1.default('pageInfo');
                pageInfoQb.find('hasNextPage', 'hasPreviousPage', 'endCursor', 'startCursor');
                nodesQb.find(columnsQuery);
                edgesQb.find(['cursor']);
                graphqlNodeFields = ['totalCount', nodesQb, pageInfoQb, edgesQb];
            }
            else {
                // ...nodes { _columns_ }, totalCount: 100
                nodesQb.find(columnsQuery);
                graphqlNodeFields = ['totalCount', nodesQb];
            }
            // all properties to be returned by the query
            datasetQb.find(graphqlNodeFields);
        }
        else {
            // include all columns to be returned
            datasetQb.find(columnsQuery);
        }
        // add dataset filters, could be Pagination and SortingFilters and/or FieldFilters
        let datasetFilters = {};
        // only add pagination if it's enabled in the grid options
        if (this._gridOptions.enablePagination !== false) {
            datasetFilters = {};
            if (this.options.isWithCursor && this.options.paginationOptions) {
                datasetFilters = { ...this.options.paginationOptions };
            }
            else {
                const paginationOptions = (_a = this.options) === null || _a === void 0 ? void 0 : _a.paginationOptions;
                datasetFilters.first = (_f = (_d = (_c = (_b = this.options) === null || _b === void 0 ? void 0 : _b.paginationOptions) === null || _c === void 0 ? void 0 : _c.first) !== null && _d !== void 0 ? _d : (_e = this.pagination) === null || _e === void 0 ? void 0 : _e.pageSize) !== null && _f !== void 0 ? _f : this.defaultPaginationOptions.first;
                datasetFilters.offset = (paginationOptions === null || paginationOptions === void 0 ? void 0 : paginationOptions.hasOwnProperty('offset')) ? +paginationOptions['offset'] : 0;
            }
        }
        if (this.options.sortingOptions && Array.isArray(this.options.sortingOptions) && this.options.sortingOptions.length > 0) {
            // orderBy: [{ field:x, direction: 'ASC' }]
            datasetFilters.orderBy = this.options.sortingOptions;
        }
        if (this.options.filteringOptions && Array.isArray(this.options.filteringOptions) && this.options.filteringOptions.length > 0) {
            // filterBy: [{ field: date, operator: '>', value: '2000-10-10' }]
            datasetFilters.filterBy = this.options.filteringOptions;
        }
        if (this.options.addLocaleIntoQuery) {
            // first: 20, ... locale: "en-CA"
            datasetFilters.locale = ((_g = this._gridOptions.translater) === null || _g === void 0 ? void 0 : _g.getCurrentLanguage()) || this._gridOptions.locale || 'en';
        }
        if (this.options.extraQueryArguments) {
            // first: 20, ... userId: 123
            for (const queryArgument of this.options.extraQueryArguments) {
                datasetFilters[queryArgument.field] = queryArgument.value;
            }
        }
        // with pagination:: query { users(first: 20, offset: 0, orderBy: [], filterBy: []) { totalCount: 100, nodes: { _columns_ }}}
        // without pagination:: query { users(orderBy: [], filterBy: []) { _columns_ }}
        datasetQb.filter(datasetFilters);
        queryQb.find(datasetQb);
        const enumSearchProperties = ['direction:', 'field:', 'operator:'];
        return this.trimDoubleQuotesOnEnumField(queryQb.toString(), enumSearchProperties, this.options.keepArgumentFieldDoubleQuotes || false);
    }
    /**
     * From an input array of strings, we want to build a GraphQL query string.
     * The process has to take the dot notation and parse it into a valid GraphQL query
     * Following this SO answer https://stackoverflow.com/a/47705476/1212166
     *
     * INPUT
     *  ['firstName', 'lastName', 'billing.address.street', 'billing.address.zip']
     * OUTPUT
     * firstName, lastName, billing{address{street, zip}}
     * @param inputArray
     */
    buildFilterQuery(inputArray) {
        const set = (o = {}, a) => {
            var _a;
            const k = a.shift();
            o[k] = a.length ? set((_a = o[k]) !== null && _a !== void 0 ? _a : {}, a) : null;
            return o;
        };
        const output = inputArray.reduce((o, a) => set(o, a.split('.')), {});
        return JSON.stringify(output)
            .replace(/\"|\:|null/g, '')
            .replace(/^\{/, '')
            .replace(/\}$/, '');
    }
    clearFilters() {
        this._currentFilters = [];
        this.updateOptions({ filteringOptions: [] });
    }
    clearSorters() {
        this._currentSorters = [];
        this.updateOptions({ sortingOptions: [] });
    }
    /**
     * Get an initialization of Pagination options
     * @return Pagination Options
     */
    getInitPaginationOptions() {
        var _a;
        const paginationFirst = this.pagination ? this.pagination.pageSize : DEFAULT_ITEMS_PER_PAGE;
        return ((_a = this.options) === null || _a === void 0 ? void 0 : _a.isWithCursor) ? { first: paginationFirst } : { first: paginationFirst, offset: 0 };
    }
    /** Get the GraphQL dataset name */
    getDatasetName() {
        var _a;
        return ((_a = this.options) === null || _a === void 0 ? void 0 : _a.datasetName) || '';
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
    /*
     * Reset the pagination options
     */
    resetPaginationOptions() {
        let paginationOptions;
        if (this.options && this.options.isWithCursor) {
            paginationOptions = this.getInitPaginationOptions();
        }
        else {
            // first, last, offset
            paginationOptions = ((this.options && this.options.paginationOptions) || this.getInitPaginationOptions());
            paginationOptions.offset = 0;
        }
        // save current pagination as Page 1 and page size as "first" set size
        this._currentPagination = {
            pageNumber: 1,
            pageSize: paginationOptions.first || DEFAULT_PAGE_SIZE
        };
        // unless user specifically set "enablePagination" to False, we'll update pagination options in every other cases
        if (this._gridOptions && (this._gridOptions.enablePagination || !this._gridOptions.hasOwnProperty('enablePagination'))) {
            this.updateOptions({ paginationOptions });
        }
    }
    updateOptions(serviceOptions) {
        this.options = { ...this.options, ...serviceOptions };
    }
    /*
     * FILTERING
     */
    processOnFilterChanged(_event, args) {
        const gridOptions = this._gridOptions;
        const backendApi = gridOptions.backendServiceApi;
        if (backendApi === undefined) {
            throw new Error('Something went wrong in the GraphqlService, "backendServiceApi" is not initialized');
        }
        // keep current filters & always save it as an array (columnFilters can be an object when it is dealt by SlickGrid Filter)
        this._currentFilters = this.castFilterToColumnFilters(args.columnFilters);
        if (!args || !args.grid) {
            throw new Error('Something went wrong when trying create the GraphQL Backend Service, it seems that "args" is not populated correctly');
        }
        // loop through all columns to inspect filters & set the query
        this.updateFilters(args.columnFilters, false);
        this.resetPaginationOptions();
        return this.buildQuery();
    }
    /*
     * PAGINATION
     * With cursor, the query can have 4 arguments (first, after, last, before), for example:
     *   users (first:20, after:"YXJyYXljb25uZWN0aW9uOjM=") {
     *     totalCount
     *     pageInfo {
     *       hasNextPage
     *       hasPreviousPage
     *       endCursor
     *       startCursor
     *     }
     *     edges {
     *       cursor
     *       node {
     *         name
     *         gender
     *       }
     *     }
     *   }
     * Without cursor, the query can have 3 arguments (first, last, offset), for example:
     *   users (first:20, offset: 10) {
     *     totalCount
     *     nodes {
     *       name
     *       gender
     *     }
     *   }
     */
    processOnPaginationChanged(_event, args) {
        const pageSize = +(args.pageSize || ((this.pagination) ? this.pagination.pageSize : DEFAULT_PAGE_SIZE));
        // if first/last defined on args, then it is a cursor based pagination change
        'first' in args || 'last' in args
            ? this.updatePagination(args.newPage, pageSize, args)
            : this.updatePagination(args.newPage, pageSize);
        // build the GraphQL query which we will use in the WebAPI callback
        return this.buildQuery();
    }
    /*
     * SORTING
     * we will use sorting as per a Facebook suggestion on a Github issue (with some small changes)
     * https://github.com/graphql/graphql-relay-js/issues/20#issuecomment-220494222
     *
     *  users (first: 20, offset: 10, orderBy: [{field: lastName, direction: ASC}, {field: firstName, direction: DESC}]) {
     *    totalCount
     *    nodes {
     *      name
     *      gender
     *    }
     *  }
     */
    processOnSortChanged(_event, args) {
        const sortColumns = (args.multiColumnSort) ? args.sortCols : new Array({ columnId: args.sortCol.id, sortCol: args.sortCol, sortAsc: args.sortAsc });
        // loop through all columns to inspect sorters & set the query
        this.updateSorters(sortColumns);
        // build the GraphQL query which we will use in the WebAPI callback
        return this.buildQuery();
    }
    /**
     * loop through all columns to inspect filters & update backend service filteringOptions
     * @param columnFilters
     */
    updateFilters(columnFilters, isUpdatedByPresetOrDynamically) {
        var _a, _b, _c, _d;
        const searchByArray = [];
        let searchValue;
        // on filter preset load, we need to keep current filters
        if (isUpdatedByPresetOrDynamically) {
            this._currentFilters = this.castFilterToColumnFilters(columnFilters);
        }
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
                    throw new Error('[GraphQL Service]: Something went wrong in trying to get the column definition of the specified filter (or preset filters). Did you make a typo on the filter columnId?');
                }
                const fieldName = ((_a = columnDef.filter) === null || _a === void 0 ? void 0 : _a.queryField) || columnDef.queryFieldFilter || columnDef.queryField || columnDef.field || columnDef.name || '';
                const fieldType = columnDef.type || common_1.FieldType.string;
                let searchTerms = (_b = columnFilter === null || columnFilter === void 0 ? void 0 : columnFilter.searchTerms) !== null && _b !== void 0 ? _b : [];
                let fieldSearchValue = (Array.isArray(searchTerms) && searchTerms.length === 1) ? searchTerms[0] : '';
                if (typeof fieldSearchValue === 'undefined') {
                    fieldSearchValue = '';
                }
                if (!fieldName) {
                    throw new Error(`GraphQL filter could not find the field name to query the search, your column definition must include a valid "field" or "name" (optionally you can also use the "queryfield").`);
                }
                fieldSearchValue = (fieldSearchValue === undefined || fieldSearchValue === null) ? '' : `${fieldSearchValue}`; // make sure it's a string
                // run regex to find possible filter operators unless the user disabled the feature
                const autoParseInputFilterOperator = (_c = columnDef.autoParseInputFilterOperator) !== null && _c !== void 0 ? _c : this._gridOptions.autoParseInputFilterOperator;
                const matches = autoParseInputFilterOperator !== false
                    ? fieldSearchValue.match(/^([<>!=\*]{0,2})(.*[^<>!=\*])([\*]?)$/) // group 1: Operator, 2: searchValue, 3: last char is '*' (meaning starts with, ex.: abc*)
                    : [fieldSearchValue, '', fieldSearchValue, '']; // when parsing is disabled, we'll only keep the search value in the index 2 to make it easy for code reuse
                let operator = columnFilter.operator || (matches === null || matches === void 0 ? void 0 : matches[1]) || '';
                searchValue = (matches === null || matches === void 0 ? void 0 : matches[2]) || '';
                const lastValueChar = (matches === null || matches === void 0 ? void 0 : matches[3]) || (operator === '*z' ? '*' : '');
                // no need to query if search value is empty
                if (fieldName && searchValue === '' && searchTerms.length === 0) {
                    continue;
                }
                if (Array.isArray(searchTerms) && searchTerms.length === 1 && typeof searchTerms[0] === 'string' && searchTerms[0].indexOf('..') >= 0) {
                    if (operator !== common_1.OperatorType.rangeInclusive && operator !== common_1.OperatorType.rangeExclusive) {
                        operator = (_d = this._gridOptions.defaultFilterRangeOperator) !== null && _d !== void 0 ? _d : common_1.OperatorType.rangeInclusive;
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
                if (typeof searchValue === 'string') {
                    if (operator === '*' || operator === 'a*' || operator === '*z' || lastValueChar === '*') {
                        operator = ((operator === '*' || operator === '*z') ? 'EndsWith' : 'StartsWith');
                    }
                }
                // if we didn't find an Operator but we have a Column Operator inside the Filter (DOM Element), we should use its default Operator
                // multipleSelect is "IN", while singleSelect is "EQ", else don't map any operator
                if (!operator && columnDef.filter && columnDef.filter.operator) {
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
                // Normalize all search values
                searchValue = this.normalizeSearchValue(fieldType, searchValue);
                if (Array.isArray(searchTerms)) {
                    searchTerms.forEach((_part, index) => {
                        searchTerms[index] = this.normalizeSearchValue(fieldType, searchTerms[index]);
                    });
                }
                // when having more than 1 search term (we need to create a CSV string for GraphQL "IN" or "NOT IN" filter search)
                if (searchTerms && searchTerms.length > 1 && (operator === 'IN' || operator === 'NIN' || operator === 'NOT_IN')) {
                    searchValue = searchTerms.join(',');
                }
                else if (searchTerms && searchTerms.length === 2 && (operator === common_1.OperatorType.rangeExclusive || operator === common_1.OperatorType.rangeInclusive)) {
                    searchByArray.push({ field: fieldName, operator: (operator === common_1.OperatorType.rangeInclusive ? 'GE' : 'GT'), value: searchTerms[0] });
                    searchByArray.push({ field: fieldName, operator: (operator === common_1.OperatorType.rangeInclusive ? 'LE' : 'LT'), value: searchTerms[1] });
                    continue;
                }
                // if we still don't have an operator find the proper Operator to use by it's field type
                if (!operator) {
                    operator = (0, common_1.mapOperatorByFieldType)(fieldType);
                }
                // build the search array
                searchByArray.push({ field: fieldName, operator: (0, common_1.mapOperatorType)(operator), value: searchValue });
            }
        }
        // update the service options with filters for the buildQuery() to work later
        this.updateOptions({ filteringOptions: searchByArray });
    }
    /**
     * Update the pagination component with it's new page number and size.
     * @param newPage
     * @param pageSize
     * @param cursorArgs Should be supplied when using cursor based pagination
     */
    updatePagination(newPage, pageSize, cursorArgs) {
        var _a;
        this._currentPagination = {
            pageNumber: newPage,
            pageSize
        };
        let paginationOptions = {};
        if ((_a = this.options) === null || _a === void 0 ? void 0 : _a.isWithCursor) {
            // use cursor based pagination
            // when using cursor pagination, expect to be given a PaginationCursorChangedArgs as arguments,
            // but still handle the case where it's not (can happen when initial configuration not pre-configured (automatically corrects itself next setCursorPageInfo() call))
            if (cursorArgs && cursorArgs instanceof Object) {
                // remove pageSize and newPage from cursorArgs, otherwise they get put on the query input string
                // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-shadow
                const { pageSize, newPage, ...cursorPaginationOptions } = cursorArgs;
                paginationOptions = cursorPaginationOptions;
            }
            else {
                paginationOptions = { first: pageSize };
            }
        }
        else {
            // use offset based pagination
            paginationOptions = {
                first: pageSize,
                offset: (newPage > 1) ? ((newPage - 1) * pageSize) : 0 // recalculate offset but make sure the result is always over 0
            };
        }
        this.updateOptions({ paginationOptions });
    }
    /**
     * loop through all columns to inspect sorters & update backend service sortingOptions
     * @param columnFilters
     */
    updateSorters(sortColumns, presetSorters) {
        let currentSorters = [];
        const graphqlSorters = [];
        if (!sortColumns && presetSorters) {
            // make the presets the current sorters, also make sure that all direction are in uppercase for GraphQL
            currentSorters = presetSorters;
            currentSorters.forEach((sorter) => sorter.direction = sorter.direction.toUpperCase());
            // display the correct sorting icons on the UI, for that it requires (columnId, sortAsc) properties
            const tmpSorterArray = currentSorters.map((sorter) => {
                var _a;
                const columnDef = (_a = this._columnDefinitions) === null || _a === void 0 ? void 0 : _a.find((column) => column.id === sorter.columnId);
                graphqlSorters.push({
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
                this._grid.setSortColumns(tmpSorterArray.filter(sorter => sorter) || []);
            }
        }
        else if (sortColumns && !presetSorters) {
            // build the orderBy array, it could be multisort, example
            // orderBy:[{field: lastName, direction: ASC}, {field: firstName, direction: DESC}]
            if (Array.isArray(sortColumns) && sortColumns.length > 0) {
                for (const column of sortColumns) {
                    if (column && column.sortCol) {
                        currentSorters.push({
                            columnId: column.sortCol.id + '',
                            direction: column.sortAsc ? common_1.SortDirection.ASC : common_1.SortDirection.DESC
                        });
                        const fieldName = (column.sortCol.queryFieldSorter || column.sortCol.queryField || column.sortCol.field || '') + '';
                        if (fieldName) {
                            graphqlSorters.push({
                                field: fieldName,
                                direction: column.sortAsc ? common_1.SortDirection.ASC : common_1.SortDirection.DESC
                            });
                        }
                    }
                }
            }
        }
        // keep current Sorters and update the service options with the new sorting
        this._currentSorters = currentSorters;
        this.updateOptions({ sortingOptions: graphqlSorters });
    }
    /**
     * A function which takes an input string and removes double quotes only
     * on certain fields are identified as GraphQL enums (except fields with dot notation)
     * For example let say we identified ("direction:", "sort") as word which are GraphQL enum fields
     * then the result will be:
     * FROM
     * query { users (orderBy:[{field:"firstName", direction:"ASC"} }]) }
     * TO
     * query { users (orderBy:[{field: firstName, direction: ASC}})}
     *
     * EXCEPTIONS (fields with dot notation "." which are inside a "field:")
     * these fields will keep double quotes while everything else will be stripped of double quotes
     * query { users (orderBy:[{field:"billing.street.name", direction: "ASC"} }
     * TO
     * query { users (orderBy:[{field:"billing.street.name", direction: ASC}}
     * @param inputStr input string
     * @param enumSearchWords array of enum words to filter
     * @returns outputStr output string
     */
    trimDoubleQuotesOnEnumField(inputStr, enumSearchWords, keepArgumentFieldDoubleQuotes) {
        const patternWordInQuotes = `\s?((field:\s*)?".*?")`;
        let patternRegex = enumSearchWords.join(patternWordInQuotes + '|');
        patternRegex += patternWordInQuotes; // the last one should also have the pattern but without the pipe "|"
        // example with (field: & direction:):  /field:s?(".*?")|direction:s?(".*?")/
        const reg = new RegExp(patternRegex, 'g');
        return inputStr.replace(reg, group1 => {
            // remove double quotes except when the string starts with a "field:"
            let removeDoubleQuotes = true;
            if (group1.startsWith('field:') && keepArgumentFieldDoubleQuotes) {
                removeDoubleQuotes = false;
            }
            const rep = removeDoubleQuotes ? group1.replace(/"/g, '') : group1;
            return rep;
        });
    }
    //
    // protected functions
    // -------------------
    /**
     * Cast provided filters (could be in multiple formats) into an array of CurrentFilter
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
    /** Normalizes the search value according to field type. */
    normalizeSearchValue(fieldType, searchValue) {
        switch (fieldType) {
            case common_1.FieldType.date:
            case common_1.FieldType.string:
            case common_1.FieldType.text:
            case common_1.FieldType.readonly:
                if (typeof searchValue === 'string') {
                    // escape single quotes by doubling them
                    searchValue = searchValue.replace(/'/g, `''`);
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
exports.GraphqlService = GraphqlService;
//# sourceMappingURL=graphql.service.js.map