"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateFilter = void 0;
const flatpickr_ = require("flatpickr");
const moment_ = require("moment-mini");
const flatpickr = ((_a = flatpickr_ === null || flatpickr_ === void 0 ? void 0 : flatpickr_['default']) !== null && _a !== void 0 ? _a : flatpickr_); // patch for rollup
const moment = (_b = moment_ === null || moment_ === void 0 ? void 0 : moment_['default']) !== null && _b !== void 0 ? _b : moment_; // patch to fix rollup "moment has no default export" issue, document here https://github.com/rollup/rollup/issues/670
const index_1 = require("../enums/index");
const filterUtilities_1 = require("./filterUtilities");
const domUtilities_1 = require("../services/domUtilities");
const utilities_1 = require("../services/utilities");
const bindingEvent_service_1 = require("../services/bindingEvent.service");
class DateFilter {
    constructor(translaterService) {
        this.translaterService = translaterService;
        this._clearFilterTriggered = false;
        this._shouldTriggerQuery = true;
        this.inputFilterType = 'range';
        this.searchTerms = [];
        this._bindEventService = new bindingEvent_service_1.BindingEventService();
    }
    /** Getter for the Grid Options pulled through the Grid Object */
    get gridOptions() {
        return (this.grid && this.grid.getOptions) ? this.grid.getOptions() : {};
    }
    /** Getter for the Column Filter */
    get columnFilter() {
        return this.columnDef && this.columnDef.filter || {};
    }
    /** Getter for the Current Date(s) selected */
    get currentDateOrDates() {
        return this._currentDateOrDates;
    }
    /** Getter to know what would be the default operator when none is specified */
    get defaultOperator() {
        return this.inputFilterType === 'compound'
            ? index_1.OperatorType.empty
            : (this.gridOptions.defaultFilterRangeOperator || index_1.OperatorType.rangeInclusive);
    }
    /** Getter for the Flatpickr Options */
    get flatpickrOptions() {
        return this._flatpickrOptions || {};
    }
    /** Getter for the Filter Operator */
    get operator() {
        var _a, _b;
        if (this.inputFilterType === 'compound') {
            return this._operator || this.columnFilter.operator || this.defaultOperator;
        }
        return (_b = (_a = this.columnFilter) === null || _a === void 0 ? void 0 : _a.operator) !== null && _b !== void 0 ? _b : this.defaultOperator;
    }
    /** Setter for the filter operator */
    set operator(operator) {
        if (this.inputFilterType === 'compound') {
            this._operator = operator;
        }
        else if (this.columnFilter) {
            this.columnFilter.operator = operator;
        }
    }
    /**
     * Initialize the Filter
     */
    init(args) {
        var _a;
        if (!args) {
            throw new Error('[Slickgrid-Universal] A filter must always have an "init()" with valid arguments.');
        }
        this.grid = args.grid;
        this.callback = args.callback;
        this.columnDef = args.columnDef;
        if (this.inputFilterType === 'compound') {
            this.operator = args.operator || '';
        }
        this.searchTerms = (_a = args === null || args === void 0 ? void 0 : args.searchTerms) !== null && _a !== void 0 ? _a : [];
        this.filterContainerElm = args.filterContainerElm;
        // date input can only have 1 search term, so we will use the 1st array index if it exist
        const searchValues = this.inputFilterType === 'compound'
            ? (Array.isArray(this.searchTerms) && this.searchTerms.length >= 0) ? this.searchTerms[0] : ''
            : this.searchTerms;
        // step 1, create the DOM Element of the filter which contain the compound Operator+Input
        this._filterElm = this.createDomFilterElement(searchValues);
        // step 3, subscribe to the keyup event and run the callback when that happens
        // also add/remove "filled" class for styling purposes
        this._bindEventService.bind(this._filterDivInputElm, 'keyup', this.onTriggerEvent.bind(this));
        if (this._selectOperatorElm) {
            this._bindEventService.bind(this._selectOperatorElm, 'change', this.onTriggerEvent.bind(this));
        }
    }
    /**
     * Clear the filter value
     */
    clear(shouldTriggerQuery = true) {
        if (this.flatInstance) {
            this._clearFilterTriggered = true;
            this._shouldTriggerQuery = shouldTriggerQuery;
            this.searchTerms = [];
            if (this._selectOperatorElm) {
                this._selectOperatorElm.selectedIndex = 0;
            }
            if (this.flatInstance.input) {
                this.flatInstance.clear();
            }
        }
        this._filterElm.classList.remove('filled');
        this._filterDivInputElm.classList.remove('filled');
    }
    /**
     * destroy the filter
     */
    destroy() {
        var _a, _b, _c, _d, _e;
        this._bindEventService.unbindAll();
        if (typeof ((_a = this.flatInstance) === null || _a === void 0 ? void 0 : _a.destroy) === 'function') {
            this.flatInstance.destroy();
            if (this.flatInstance.element) {
                (0, domUtilities_1.destroyObjectDomElementProps)(this.flatInstance);
            }
        }
        (0, domUtilities_1.emptyElement)(this.filterContainerElm);
        (0, domUtilities_1.emptyElement)(this._filterDivInputElm);
        (_b = this._filterDivInputElm) === null || _b === void 0 ? void 0 : _b.remove();
        (_c = this.filterContainerElm) === null || _c === void 0 ? void 0 : _c.remove();
        (_d = this._selectOperatorElm) === null || _d === void 0 ? void 0 : _d.remove();
        (_e = this._filterElm) === null || _e === void 0 ? void 0 : _e.remove();
    }
    hide() {
        var _a;
        if (typeof ((_a = this.flatInstance) === null || _a === void 0 ? void 0 : _a.close) === 'function') {
            this.flatInstance.close();
        }
    }
    show() {
        var _a;
        if (typeof ((_a = this.flatInstance) === null || _a === void 0 ? void 0 : _a.open) === 'function') {
            this.flatInstance.open();
        }
    }
    getValues() {
        return this._currentDateOrDates;
    }
    /**
     * Set value(s) on the DOM element
     * @params searchTerms
     */
    setValues(values, operator) {
        let pickerValues;
        if (this.inputFilterType === 'compound') {
            pickerValues = Array.isArray(values) ? values[0] : values;
        }
        else {
            // get the picker values, if it's a string with the "..", we'll do the split else we'll use the array of search terms
            if (typeof values === 'string' || (Array.isArray(values) && typeof values[0] === 'string') && values[0].indexOf('..') > 0) {
                pickerValues = (typeof values === 'string') ? [values] : values[0].split('..');
            }
            else if (Array.isArray(values)) {
                pickerValues = values;
            }
        }
        if (this.flatInstance) {
            this._currentDateOrDates = (values && pickerValues) ? pickerValues : undefined;
            this.flatInstance.setDate(this._currentDateOrDates || '');
        }
        const currentValueOrValues = this.getValues() || [];
        if (this.getValues() || (Array.isArray(currentValueOrValues) && currentValueOrValues.length > 0 && values)) {
            this._filterElm.classList.add('filled');
            this._filterDivInputElm.classList.add('filled');
        }
        else {
            this._filterElm.classList.remove('filled');
            this._filterDivInputElm.classList.remove('filled');
        }
        // set the operator when defined
        this.operator = operator || this.defaultOperator;
        if (operator && this._selectOperatorElm) {
            const operatorShorthand = (0, utilities_1.mapOperatorToShorthandDesignation)(this.operator);
            this._selectOperatorElm.value = operatorShorthand;
        }
    }
    //
    // protected functions
    // ------------------
    buildDatePickerInput(searchTerms) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        const columnId = (_b = (_a = this.columnDef) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : '';
        const inputFormat = (0, utilities_1.mapFlatpickrDateFormatWithFieldType)(this.columnFilter.type || this.columnDef.type || index_1.FieldType.dateIso);
        const outputFormat = (0, utilities_1.mapFlatpickrDateFormatWithFieldType)(this.columnDef.outputType || this.columnFilter.type || this.columnDef.type || index_1.FieldType.dateUtc);
        const userFilterOptions = (_d = (_c = this.columnFilter) === null || _c === void 0 ? void 0 : _c.filterOptions) !== null && _d !== void 0 ? _d : {};
        // get current locale, if user defined a custom locale just use or get it the Translate Service if it exist else just use English
        let currentLocale = ((_e = userFilterOptions === null || userFilterOptions === void 0 ? void 0 : userFilterOptions.locale) !== null && _e !== void 0 ? _e : (_g = (_f = this.translaterService) === null || _f === void 0 ? void 0 : _f.getCurrentLanguage) === null || _g === void 0 ? void 0 : _g.call(_f)) || this.gridOptions.locale || 'en';
        if ((currentLocale === null || currentLocale === void 0 ? void 0 : currentLocale.length) > 2) {
            currentLocale = currentLocale.substring(0, 2);
        }
        let pickerValues;
        if (this.inputFilterType === 'compound') {
            if (searchTerms) {
                pickerValues = searchTerms;
                this._currentDateOrDates = searchTerms;
            }
        }
        else {
            // get the picker values, if it's a string with the "..", we'll do the split else we'll use the array of search terms
            if (typeof searchTerms === 'string' || (Array.isArray(searchTerms) && typeof searchTerms[0] === 'string') && searchTerms[0].indexOf('..') > 0) {
                pickerValues = (typeof searchTerms === 'string') ? [searchTerms] : searchTerms[0].split('..');
            }
            else if (Array.isArray(searchTerms)) {
                pickerValues = searchTerms;
            }
            // if we are preloading searchTerms, we'll keep them for reference
            if (Array.isArray(pickerValues)) {
                this._currentDateOrDates = pickerValues;
                const outFormat = (0, utilities_1.mapMomentDateFormatWithFieldType)(this.columnFilter.type || this.columnDef.type || index_1.FieldType.dateIso);
                this._currentDateStrings = pickerValues.map(date => moment(date).format(outFormat));
            }
        }
        const pickerOptions = {
            defaultDate: (pickerValues || ''),
            altInput: true,
            altFormat: outputFormat,
            dateFormat: inputFormat,
            mode: this.inputFilterType === 'range' ? 'range' : 'single',
            wrap: true,
            closeOnSelect: true,
            locale: currentLocale,
            onChange: (selectedDates, dateStr) => {
                if (this.inputFilterType === 'compound') {
                    this._currentValue = dateStr;
                    this._currentDateOrDates = Array.isArray(selectedDates) && selectedDates[0] || undefined;
                }
                else {
                    if (Array.isArray(selectedDates)) {
                        this._currentDateOrDates = selectedDates;
                        const outFormat = (0, utilities_1.mapMomentDateFormatWithFieldType)(this.columnDef.outputType || this.columnFilter.type || this.columnDef.type || index_1.FieldType.dateIso);
                        this._currentDateStrings = selectedDates.map(date => moment(date).format(outFormat));
                        this._currentValue = this._currentDateStrings.join('..');
                    }
                }
                // when using the time picker, we can simulate a keyup event to avoid multiple backend request
                // since backend request are only executed after user start typing, changing the time should be treated the same way
                const newEvent = pickerOptions.enableTime ? new Event('keyup') : undefined;
                this.onTriggerEvent(newEvent);
            },
            errorHandler: (error) => {
                if (error.toString().includes('invalid locale')) {
                    console.warn(`[Slickgrid-Universal] Flatpickr missing locale imports (${currentLocale}), will revert to English as the default locale.
          See Flatpickr Localization for more info, for example if we want to use French, then we can import it with:  import 'flatpickr/dist/l10n/fr';`);
                }
            }
        };
        // add the time picker when format is UTC (Z) or has the 'h' (meaning hours)
        if (outputFormat && (outputFormat === 'Z' || outputFormat.toLowerCase().includes('h'))) {
            pickerOptions.enableTime = true;
        }
        // merge options with optional user's custom options
        this._flatpickrOptions = { ...pickerOptions, ...userFilterOptions };
        let placeholder = (_j = (_h = this.gridOptions) === null || _h === void 0 ? void 0 : _h.defaultFilterPlaceholder) !== null && _j !== void 0 ? _j : '';
        if ((_k = this.columnFilter) === null || _k === void 0 ? void 0 : _k.placeholder) {
            placeholder = this.columnFilter.placeholder;
        }
        const filterDivInputElm = (0, domUtilities_1.createDomElement)('div', { className: 'flatpickr' });
        if (this.inputFilterType === 'range') {
            filterDivInputElm.classList.add('search-filter', `filter-${columnId}`);
        }
        filterDivInputElm.appendChild((0, domUtilities_1.createDomElement)('input', {
            type: 'text', className: 'form-control',
            placeholder,
            dataset: { input: '', columnid: `${columnId}` }
        }));
        this.flatInstance = flatpickr(filterDivInputElm, this._flatpickrOptions);
        return filterDivInputElm;
    }
    /** Get the available operator option values to populate the operator select dropdown list */
    getOperatorOptionValues() {
        var _a;
        if ((_a = this.columnFilter) === null || _a === void 0 ? void 0 : _a.compoundOperatorList) {
            return this.columnFilter.compoundOperatorList;
        }
        else {
            return (0, filterUtilities_1.compoundOperatorNumeric)(this.gridOptions, this.translaterService);
        }
    }
    /**
     * Create the DOM element
     * @params searchTerms
     */
    createDomFilterElement(searchTerms) {
        var _a, _b;
        const columnId = (_b = (_a = this.columnDef) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : '';
        (0, domUtilities_1.emptyElement)(this.filterContainerElm);
        // create the DOM element filter container
        this._filterDivInputElm = this.buildDatePickerInput(searchTerms);
        if (this.inputFilterType === 'range') {
            // if there's a search term, we will add the "filled" class for styling purposes
            if (Array.isArray(searchTerms) && searchTerms.length > 0 && searchTerms[0] !== '') {
                this._filterDivInputElm.classList.add('filled');
                this._currentDateOrDates = searchTerms;
                this._currentValue = searchTerms[0];
            }
            // append the new DOM element to the header row
            if (this._filterDivInputElm) {
                this.filterContainerElm.appendChild(this._filterDivInputElm);
            }
            return this._filterDivInputElm;
        }
        else {
            this._selectOperatorElm = (0, filterUtilities_1.buildSelectOperator)(this.getOperatorOptionValues(), this.gridOptions);
            const filterContainerElm = (0, domUtilities_1.createDomElement)('div', { className: `form-group search-filter filter-${columnId}` });
            const containerInputGroupElm = (0, domUtilities_1.createDomElement)('div', { className: 'input-group flatpickr' }, filterContainerElm);
            const operatorInputGroupAddonElm = (0, domUtilities_1.createDomElement)('div', { className: 'input-group-addon input-group-prepend operator' }, containerInputGroupElm);
            operatorInputGroupAddonElm.appendChild(this._selectOperatorElm);
            containerInputGroupElm.appendChild(this._filterDivInputElm);
            if (this.operator) {
                const operatorShorthand = (0, utilities_1.mapOperatorToShorthandDesignation)(this.operator);
                this._selectOperatorElm.value = operatorShorthand;
            }
            // if there's a search term, we will add the "filled" class for styling purposes
            if (searchTerms !== '') {
                this._filterDivInputElm.classList.add('filled');
                this._currentDateOrDates = searchTerms;
                this._currentValue = searchTerms;
            }
            // append the new DOM element to the header row
            if (filterContainerElm) {
                this.filterContainerElm.appendChild(filterContainerElm);
            }
            return filterContainerElm;
        }
    }
    onTriggerEvent(e) {
        var _a, _b;
        if (this._clearFilterTriggered) {
            this.callback(e, { columnDef: this.columnDef, clearFilterTriggered: this._clearFilterTriggered, shouldTriggerQuery: this._shouldTriggerQuery });
            this._filterElm.classList.remove('filled');
        }
        else {
            if (this.inputFilterType === 'range') {
                (this._currentDateStrings) ? this._filterElm.classList.add('filled') : this._filterElm.classList.remove('filled');
                this.callback(e, { columnDef: this.columnDef, searchTerms: (this._currentDateStrings ? this._currentDateStrings : [this._currentValue]), operator: this.operator || '', shouldTriggerQuery: this._shouldTriggerQuery });
            }
            else if (this.inputFilterType === 'compound' && this._selectOperatorElm) {
                const selectedOperator = this._selectOperatorElm.value;
                (this._currentValue) ? this._filterElm.classList.add('filled') : this._filterElm.classList.remove('filled');
                // when changing compound operator, we don't want to trigger the filter callback unless the date input is also provided
                const skipCompoundOperatorFilterWithNullInput = (_b = (_a = this.columnFilter.skipCompoundOperatorFilterWithNullInput) !== null && _a !== void 0 ? _a : this.gridOptions.skipCompoundOperatorFilterWithNullInput) !== null && _b !== void 0 ? _b : this.gridOptions.skipCompoundOperatorFilterWithNullInput === undefined;
                if (!skipCompoundOperatorFilterWithNullInput || this._currentDateOrDates !== undefined) {
                    this.callback(e, { columnDef: this.columnDef, searchTerms: (this._currentValue ? [this._currentValue] : null), operator: selectedOperator || '', shouldTriggerQuery: this._shouldTriggerQuery });
                }
            }
        }
        // reset both flags for next use
        this._clearFilterTriggered = false;
        this._shouldTriggerQuery = true;
    }
}
exports.DateFilter = DateFilter;
//# sourceMappingURL=dateFilter.js.map