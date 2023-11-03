import { toSentenceCase } from '@slickgrid-universal/utils';
import { OperatorType } from '../enums/index';
import { createDomElement, emptyElement, } from '../services/domUtilities';
import { BindingEventService } from '../services/bindingEvent.service';
export class NativeSelectFilter {
    constructor(translater) {
        this.translater = translater;
        this._clearFilterTriggered = false;
        this._shouldTriggerQuery = true;
        this._currentValues = [];
        this.searchTerms = [];
        this._bindEventService = new BindingEventService();
    }
    /** Getter for the Column Filter itself */
    get columnFilter() {
        var _a, _b;
        return (_b = (_a = this.columnDef) === null || _a === void 0 ? void 0 : _a.filter) !== null && _b !== void 0 ? _b : {};
    }
    /** Getter to know what would be the default operator when none is specified */
    get defaultOperator() {
        return OperatorType.equal;
    }
    /** Getter for the Grid Options pulled through the Grid Object */
    get gridOptions() {
        return (this.grid && this.grid.getOptions) ? this.grid.getOptions() : {};
    }
    /** Getter for the current Operator */
    get operator() {
        var _a, _b;
        return (_b = (_a = this.columnFilter) === null || _a === void 0 ? void 0 : _a.operator) !== null && _b !== void 0 ? _b : this.defaultOperator;
    }
    /** Setter for the filter operator */
    set operator(operator) {
        if (this.columnFilter) {
            this.columnFilter.operator = operator;
        }
    }
    /**
     * Initialize the Filter
     */
    init(args) {
        if (!args) {
            throw new Error('[Slickgrid-Universal] A filter must always have an "init()" with valid arguments.');
        }
        this.grid = args.grid;
        this.callback = args.callback;
        this.columnDef = args.columnDef;
        this.searchTerms = (args.hasOwnProperty('searchTerms') ? args.searchTerms : []) || [];
        this.filterContainerElm = args.filterContainerElm;
        if (!this.grid || !this.columnDef || !this.columnFilter || !this.columnFilter.collection) {
            throw new Error(`[Slickgrid-Universal] You need to pass a "collection" for the Native Select Filter to work correctly.`);
        }
        if (this.columnFilter.enableTranslateLabel && !this.gridOptions.enableTranslate && (!this.translater || typeof this.translater.translate !== 'function')) {
            throw new Error(`The I18N Service is required for the Native Select Filter to work correctly when "enableTranslateLabel" is set.`);
        }
        // filter input can only have 1 search term, so we will use the 1st array index if it exist
        let searchTerm = (Array.isArray(this.searchTerms) && this.searchTerms.length >= 0) ? this.searchTerms[0] : '';
        if (typeof searchTerm === 'boolean' || typeof searchTerm === 'number') {
            searchTerm = `${searchTerm !== null && searchTerm !== void 0 ? searchTerm : ''}`;
        }
        // step 1, create the DOM Element of the filter & initialize it if searchTerm is filled
        this.filterElm = this.createFilterElement(searchTerm);
        // step 2, subscribe to the change event and run the callback when that happens
        // also add/remove "filled" class for styling purposes
        this._bindEventService.bind(this.filterElm, 'change', this.handleOnChange.bind(this));
    }
    /**
     * Clear the filter values
     */
    clear(shouldTriggerQuery = true) {
        if (this.filterElm) {
            this._clearFilterTriggered = true;
            this._shouldTriggerQuery = shouldTriggerQuery;
            this.searchTerms = [];
            this._currentValues = [];
            this.filterElm.value = '';
            this.filterElm.classList.remove('filled');
            this.filterElm.dispatchEvent(new Event('change'));
        }
    }
    /**
     * destroy the filter
     */
    destroy() {
        var _a, _b;
        this._bindEventService.unbindAll();
        (_b = (_a = this.filterElm) === null || _a === void 0 ? void 0 : _a.remove) === null || _b === void 0 ? void 0 : _b.call(_a);
    }
    /**
     * Get selected values retrieved from the select element
     * @params selected items
     */
    getValues() {
        return this._currentValues || [];
    }
    /** Set value(s) on the DOM element */
    setValues(values, operator) {
        var _a;
        if (Array.isArray(values)) {
            this.filterElm.value = `${(_a = values[0]) !== null && _a !== void 0 ? _a : ''}`;
            this._currentValues = values;
        }
        else if (values) {
            this.filterElm.value = `${values !== null && values !== void 0 ? values : ''}`;
            this._currentValues = [values];
        }
        this.getValues().length > 0 ? this.filterElm.classList.add('filled') : this.filterElm.classList.remove('filled');
        // set the operator when defined
        this.operator = operator || this.defaultOperator;
    }
    //
    // protected functions
    // ------------------
    /**
     * Create and return a select dropdown HTML element created from a collection
     * @param {Array<Object>} values - list of option values/labels
     * @returns {Object} selectElm - Select Dropdown HTML Element
     */
    buildFilterSelectFromCollection(collection) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        const columnId = (_b = (_a = this.columnDef) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : '';
        const selectElm = createDomElement('select', {
            className: `form-control search-filter filter-${columnId}`,
            ariaLabel: (_d = (_c = this.columnFilter) === null || _c === void 0 ? void 0 : _c.ariaLabel) !== null && _d !== void 0 ? _d : `${toSentenceCase(columnId + '')} Search Filter`
        });
        const labelName = (_f = (_e = this.columnFilter.customStructure) === null || _e === void 0 ? void 0 : _e.label) !== null && _f !== void 0 ? _f : 'label';
        const valueName = (_h = (_g = this.columnFilter.customStructure) === null || _g === void 0 ? void 0 : _g.value) !== null && _h !== void 0 ? _h : 'value';
        const isEnabledTranslate = (_k = (_j = this.columnFilter) === null || _j === void 0 ? void 0 : _j.enableTranslateLabel) !== null && _k !== void 0 ? _k : false;
        // collection could be an Array of Strings OR Objects
        if (collection.every(x => typeof x === 'string')) {
            for (const option of collection) {
                selectElm.appendChild(createDomElement('option', { value: option, label: option, textContent: option }));
            }
        }
        else {
            for (const option of collection) {
                if (!option || (option[labelName] === undefined && option.labelKey === undefined)) {
                    throw new Error(`A collection with value/label (or value/labelKey when using Locale) is required to populate the Native Select Filter list, for example:: { filter: model: Filters.select, collection: [ { value: '1', label: 'One' } ]')`);
                }
                const labelKey = option.labelKey || option[labelName];
                const textLabel = ((option.labelKey || isEnabledTranslate) && typeof this.translater !== undefined && ((_m = (_l = this.translater).getCurrentLanguage) === null || _m === void 0 ? void 0 : _m.call(_l))) ? this.translater.translate(labelKey || ' ') : labelKey;
                selectElm.appendChild(createDomElement('option', { value: option[valueName], textContent: textLabel }));
            }
        }
        return selectElm;
    }
    /**
     * From the html template string, create a DOM element
     * @param filterTemplate
     */
    createFilterElement(searchTerm) {
        var _a, _b, _c, _d;
        const columnId = (_b = (_a = this.columnDef) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : '';
        emptyElement(this.filterContainerElm);
        // create the DOM element & add an ID and filter class
        const searchTermInput = (searchTerm || '');
        const collection = (_d = (_c = this.columnFilter) === null || _c === void 0 ? void 0 : _c.collection) !== null && _d !== void 0 ? _d : [];
        if (!Array.isArray(collection)) {
            throw new Error('The "collection" passed to the Native Select Filter is not a valid array.');
        }
        const selectElm = this.buildFilterSelectFromCollection(collection);
        selectElm.value = searchTermInput;
        selectElm.dataset.columnid = `${columnId || ''}`;
        if (searchTermInput) {
            this._currentValues = [searchTermInput];
        }
        this.filterContainerElm.appendChild(selectElm);
        return selectElm;
    }
    handleOnChange(e) {
        const value = e && e.target && e.target.value || '';
        this._currentValues = [value];
        if (this._clearFilterTriggered) {
            this.callback(e, { columnDef: this.columnDef, clearFilterTriggered: this._clearFilterTriggered, shouldTriggerQuery: this._shouldTriggerQuery });
            this.filterElm.classList.remove('filled');
        }
        else {
            value === '' ? this.filterElm.classList.remove('filled') : this.filterElm.classList.add('filled');
            this.callback(e, { columnDef: this.columnDef, operator: this.operator, searchTerms: [value], shouldTriggerQuery: this._shouldTriggerQuery });
        }
        // reset both flags for next use
        this._clearFilterTriggered = false;
        this._shouldTriggerQuery = true;
    }
}
//# sourceMappingURL=nativeSelectFilter.js.map