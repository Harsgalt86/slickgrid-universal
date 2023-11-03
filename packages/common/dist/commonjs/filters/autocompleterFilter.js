"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutocompleterFilter = void 0;
const autocompleter_ = require("autocompleter");
const autocomplete = (autocompleter_ && autocompleter_['default'] || autocompleter_); // patch for rollup
const utils_1 = require("@slickgrid-universal/utils");
const index_1 = require("../enums/index");
const commonEditorFilter_1 = require("../commonEditorFilter");
const services_1 = require("../services");
const bindingEvent_service_1 = require("../services/bindingEvent.service");
const observers_1 = require("../services/observers");
const domUtilities_1 = require("../services/domUtilities");
const utilities_1 = require("../services/utilities");
const filterUtilities_1 = require("./filterUtilities");
const constants_1 = require("../constants");
class AutocompleterFilter {
    /**
     * Initialize the Filter
     */
    constructor(translaterService, collectionService, rxjs) {
        this.translaterService = translaterService;
        this.collectionService = collectionService;
        this.rxjs = rxjs;
        this._clearFilterTriggered = false;
        this._shouldTriggerQuery = true;
        this.searchTerms = [];
        this.isFilled = false;
        this.isItemSelected = false;
        /** The property name for values in the collection */
        this.valueName = 'label';
        this.enableTranslateLabel = false;
        this.subscriptions = [];
        this._bindEventService = new bindingEvent_service_1.BindingEventService();
    }
    /** Getter for the Autocomplete Option */
    get autocompleterOptions() {
        return this._autocompleterOptions || {};
    }
    /** Getter for the Collection Options */
    get collectionOptions() {
        var _a, _b, _c;
        return (_c = (_b = (_a = this.columnDef) === null || _a === void 0 ? void 0 : _a.filter) === null || _b === void 0 ? void 0 : _b.collectionOptions) !== null && _c !== void 0 ? _c : {};
    }
    /** Getter for the Collection Used by the Filter */
    get collection() {
        return this._collection;
    }
    /** Getter for the Filter Operator */
    get columnFilter() {
        var _a;
        return ((_a = this.columnDef) === null || _a === void 0 ? void 0 : _a.filter) || {};
    }
    /** Getter for the Editor DOM Element */
    get filterDomElement() {
        return this._filterElm;
    }
    get filterOptions() {
        var _a;
        return ((_a = this.columnFilter) === null || _a === void 0 ? void 0 : _a.filterOptions) || {};
    }
    /** Getter for the Custom Structure if exist */
    get customStructure() {
        var _a, _b, _c, _d, _e, _f;
        let customStructure = (_a = this.columnFilter) === null || _a === void 0 ? void 0 : _a.customStructure;
        const columnType = (_c = (_b = this.columnFilter) === null || _b === void 0 ? void 0 : _b.type) !== null && _c !== void 0 ? _c : (_d = this.columnDef) === null || _d === void 0 ? void 0 : _d.type;
        if (!customStructure && (columnType === index_1.FieldType.object && ((_e = this.columnDef) === null || _e === void 0 ? void 0 : _e.dataKey) && ((_f = this.columnDef) === null || _f === void 0 ? void 0 : _f.labelKey))) {
            customStructure = {
                label: this.columnDef.labelKey,
                value: this.columnDef.dataKey,
            };
        }
        return customStructure;
    }
    /** Getter to know what would be the default operator when none is specified */
    get defaultOperator() {
        return index_1.OperatorType.equal;
    }
    /** Getter for the Grid Options pulled through the Grid Object */
    get gridOptions() {
        return (this.grid && this.grid.getOptions) ? this.grid.getOptions() : {};
    }
    /** Kraaden AutoComplete instance */
    get instance() {
        return this._instance;
    }
    /** Getter of the Operator to use when doing the filter comparing */
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
     * Initialize the filter template
     */
    init(args) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        if (!args) {
            throw new Error('[Slickgrid-Universal] A filter must always have an "init()" with valid arguments.');
        }
        this.grid = args.grid;
        this.callback = args.callback;
        this.columnDef = args.columnDef;
        this.searchTerms = (args.hasOwnProperty('searchTerms') ? args.searchTerms : []) || [];
        this.filterContainerElm = args.filterContainerElm;
        if (!this.grid || !this.columnDef || !this.columnFilter || (!this.columnFilter.collection && !this.columnFilter.collectionAsync && !this.columnFilter.filterOptions)) {
            throw new Error(`[Slickgrid-Universal] You need to pass a "collection" (or "collectionAsync") for the AutoComplete Filter to work correctly.` +
                ` Also each option should include a value/label pair (or value/labelKey when using Locale).` +
                ` For example:: { filter: model: Filters.autocompleter, collection: [{ value: true, label: 'True' }, { value: false, label: 'False'}] }`);
        }
        this.enableTranslateLabel = (_b = (_a = this.columnFilter) === null || _a === void 0 ? void 0 : _a.enableTranslateLabel) !== null && _b !== void 0 ? _b : false;
        this.labelName = (_d = (_c = this.customStructure) === null || _c === void 0 ? void 0 : _c.label) !== null && _d !== void 0 ? _d : 'label';
        this.valueName = (_f = (_e = this.customStructure) === null || _e === void 0 ? void 0 : _e.value) !== null && _f !== void 0 ? _f : 'value';
        this.labelPrefixName = (_h = (_g = this.customStructure) === null || _g === void 0 ? void 0 : _g.labelPrefix) !== null && _h !== void 0 ? _h : 'labelPrefix';
        this.labelSuffixName = (_k = (_j = this.customStructure) === null || _j === void 0 ? void 0 : _j.labelSuffix) !== null && _k !== void 0 ? _k : 'labelSuffix';
        // get locales provided by user in main file or else use default English locales via the Constants
        this._locales = (_m = (_l = this.gridOptions) === null || _l === void 0 ? void 0 : _l.locales) !== null && _m !== void 0 ? _m : constants_1.Constants.locales;
        // always render the DOM element
        const newCollection = this.columnFilter.collection;
        this._collection = newCollection;
        this.renderDomElement(newCollection);
        return new Promise(async (resolve, reject) => {
            try {
                const collectionAsync = this.columnFilter.collectionAsync;
                let collectionOutput;
                if (collectionAsync && !this.columnFilter.collection) {
                    // only read the collectionAsync once (on the 1st load),
                    // we do this because Http Fetch will throw an error saying body was already read and is streaming is locked
                    collectionOutput = (0, filterUtilities_1.renderCollectionOptionsAsync)(collectionAsync, this.columnDef, this.renderDomElement.bind(this), this.rxjs, this.subscriptions);
                    resolve(collectionOutput);
                }
                else {
                    collectionOutput = newCollection;
                    resolve(newCollection);
                }
                // subscribe to both CollectionObserver and PropertyObserver
                // any collection changes will trigger a re-render of the DOM element filter
                if (collectionAsync || this.columnFilter.enableCollectionWatch) {
                    await (collectionOutput !== null && collectionOutput !== void 0 ? collectionOutput : collectionAsync);
                    this.watchCollectionChanges();
                }
            }
            catch (e) {
                reject(e);
            }
        });
    }
    /**
     * Clear the filter value
     */
    clear(shouldTriggerQuery = true) {
        if (this._filterElm) {
            this._clearFilterTriggered = true;
            this._shouldTriggerQuery = shouldTriggerQuery;
            this.searchTerms = [];
            this._filterElm.value = '';
            this._filterElm.dispatchEvent(new CustomEvent('input'));
            this._filterElm.classList.remove('filled');
        }
    }
    /**
     * destroy the filter
     */
    destroy() {
        var _a, _b, _c;
        if (typeof ((_a = this._instance) === null || _a === void 0 ? void 0 : _a.destroy) === 'function') {
            this._instance.destroy();
        }
        if (this._filterElm) {
            // this._filterElm.autocomplete('destroy');
            // this._filterElm.off('input').remove();
        }
        (_c = (_b = this._filterElm) === null || _b === void 0 ? void 0 : _b.remove) === null || _c === void 0 ? void 0 : _c.call(_b);
        this._collection = undefined;
        this._bindEventService.unbindAll();
        // unsubscribe all the possible Observables if RxJS was used
        (0, utilities_1.unsubscribeAll)(this.subscriptions);
    }
    getValues() {
        var _a;
        return (_a = this._filterElm) === null || _a === void 0 ? void 0 : _a.value;
    }
    /** Set value(s) on the DOM element  */
    setValues(values, operator) {
        var _a;
        if (values && this._filterElm) {
            this._filterElm.value = values;
        }
        // add/remove "filled" class name
        const classCmd = this.getValues() !== '' ? 'add' : 'remove';
        (_a = this._filterElm) === null || _a === void 0 ? void 0 : _a.classList[classCmd]('filled');
        // set the operator when defined
        this.operator = operator || this.defaultOperator;
    }
    //
    // protected functions
    // ------------------
    /**
     * user might want to filter certain items of the collection
     * @param inputCollection
     * @return outputCollection filtered and/or sorted collection
     */
    filterCollection(inputCollection) {
        let outputCollection = inputCollection;
        // user might want to filter certain items of the collection
        if (this.columnFilter && this.columnFilter.collectionFilterBy) {
            const filterBy = this.columnFilter.collectionFilterBy;
            const filterCollectionBy = this.columnFilter.collectionOptions && this.columnFilter.collectionOptions.filterResultAfterEachPass || null;
            outputCollection = this.collectionService.filterCollection(outputCollection, filterBy, filterCollectionBy);
        }
        return outputCollection;
    }
    /**
     * user might want to sort the collection in a certain way
     * @param inputCollection
     * @return outputCollection filtered and/or sorted collection
     */
    sortCollection(inputCollection) {
        let outputCollection = inputCollection;
        // user might want to sort the collection
        if (this.columnFilter && this.columnFilter.collectionSortBy) {
            const sortBy = this.columnFilter.collectionSortBy;
            outputCollection = this.collectionService.sortCollection(this.columnDef, outputCollection, sortBy, this.enableTranslateLabel);
        }
        return outputCollection;
    }
    /**
     * Subscribe to both CollectionObserver & PropertyObserver with BindingEngine.
     * They each have their own purpose, the "propertyObserver" will trigger once the collection is replaced entirely
     * while the "collectionObverser" will trigger on collection changes (`push`, `unshift`, `splice`, ...)
     */
    watchCollectionChanges() {
        var _a;
        if ((_a = this.columnFilter) === null || _a === void 0 ? void 0 : _a.collection) {
            // subscribe to the "collection" changes (array `push`, `unshift`, `splice`, ...)
            (0, observers_1.collectionObserver)(this.columnFilter.collection, (updatedArray) => {
                this.renderDomElement(this.columnFilter.collection || updatedArray || []);
            });
            // observe for any "collection" changes (array replace)
            // then simply recreate/re-render the Select (dropdown) DOM Element
            (0, observers_1.propertyObserver)(this.columnFilter, 'collection', (newValue) => {
                this.renderDomElement(newValue || []);
                // when new assignment arrives, we need to also reassign observer to the new reference
                if (this.columnFilter.collection) {
                    (0, observers_1.collectionObserver)(this.columnFilter.collection, (updatedArray) => {
                        this.renderDomElement(this.columnFilter.collection || updatedArray || []);
                    });
                }
            });
        }
    }
    renderDomElement(collection) {
        var _a;
        if (!Array.isArray(collection) && ((_a = this.collectionOptions) === null || _a === void 0 ? void 0 : _a.collectionInsideObjectProperty)) {
            const collectionInsideObjectProperty = this.collectionOptions.collectionInsideObjectProperty;
            collection = (0, utilities_1.getDescendantProperty)(collection, collectionInsideObjectProperty || '');
        }
        // if (!Array.isArray(collection)) {
        //   throw new Error('The "collection" passed to the Autocomplete Filter is not a valid array.');
        // }
        // assign the collection to a temp variable before filtering/sorting the collection
        let newCollection = collection;
        // user might want to filter and/or sort certain items of the collection
        if (newCollection) {
            newCollection = this.filterCollection(newCollection);
            newCollection = this.sortCollection(newCollection);
        }
        // filter input can only have 1 search term, so we will use the 1st array index if it exist
        const searchTerm = (Array.isArray(this.searchTerms) && this.searchTerms.length >= 0) ? this.searchTerms[0] : '';
        // step 1, create the DOM Element of the filter & pre-load search term
        // also subscribe to the onSelect event
        this._collection = newCollection;
        this._filterElm = this.createFilterElement(newCollection, searchTerm);
        // step 3, subscribe to the input change event and run the callback when that happens
        // also add/remove "filled" class for styling purposes
        this._bindEventService.bind(this._filterElm, 'input', this.handleOnInputChange.bind(this));
        this._bindEventService.bind(this._filterElm, 'blur', () => {
            if (!this.isItemSelected) {
                this.clear();
            }
        });
    }
    /**
     * Create the autocomplete filter DOM element
     * @param collection
     * @param searchTerm
     * @returns
     */
    createFilterElement(collection, searchTerm) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
        this._collection = collection;
        const columnId = (_b = (_a = this.columnDef) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : '';
        (0, services_1.emptyElement)(this.filterContainerElm);
        // create the DOM element & add an ID and filter class
        let placeholder = (_d = (_c = this.gridOptions) === null || _c === void 0 ? void 0 : _c.defaultFilterPlaceholder) !== null && _d !== void 0 ? _d : '';
        if ((_e = this.columnFilter) === null || _e === void 0 ? void 0 : _e.placeholder) {
            placeholder = this.columnFilter.placeholder;
        }
        this._filterElm = (0, services_1.createDomElement)('input', {
            type: 'text',
            ariaLabel: (_g = (_f = this.columnFilter) === null || _f === void 0 ? void 0 : _f.ariaLabel) !== null && _g !== void 0 ? _g : `${(0, utils_1.toSentenceCase)(columnId + '')} Search Filter`,
            autocomplete: 'off', ariaAutoComplete: 'none',
            placeholder,
            className: `form-control search-filter filter-${columnId} slick-autocomplete-container`,
            value: (searchTerm !== null && searchTerm !== void 0 ? searchTerm : ''),
            dataset: { columnid: `${columnId}` }
        });
        // create the DOM element & add an ID and filter class
        const searchTermInput = searchTerm;
        // the kradeen autocomplete lib only works with label/value pair, make sure that our array is in accordance
        if (Array.isArray(collection)) {
            if (collection.every(x => (0, utils_1.isPrimitiveValue)(x))) {
                // when detecting an array of primitives, we have to remap it to an array of value/pair objects
                collection = collection.map(c => ({ label: c, value: c }));
            }
            else {
                // user might provide its own custom structures, if so remap them as the new label/value pair
                collection = collection.map((item) => {
                    var _a, _b;
                    return ({
                        label: item === null || item === void 0 ? void 0 : item[this.labelName],
                        value: item === null || item === void 0 ? void 0 : item[this.valueName],
                        labelPrefix: (_a = item === null || item === void 0 ? void 0 : item[this.labelPrefixName]) !== null && _a !== void 0 ? _a : '',
                        labelSuffix: (_b = item === null || item === void 0 ? void 0 : item[this.labelSuffixName]) !== null && _b !== void 0 ? _b : ''
                    });
                });
            }
        }
        // user might pass his own autocomplete options
        this._autocompleterOptions = {
            input: this._filterElm,
            debounceWaitMs: 200,
            className: `slick-autocomplete ${(_j = (_h = this.filterOptions) === null || _h === void 0 ? void 0 : _h.className) !== null && _j !== void 0 ? _j : ''}`.trim(),
            emptyMsg: this.gridOptions.enableTranslate && ((_k = this.translaterService) === null || _k === void 0 ? void 0 : _k.translate) ? this.translaterService.translate('NO_ELEMENTS_FOUND') : (_m = (_l = this._locales) === null || _l === void 0 ? void 0 : _l.TEXT_NO_ELEMENTS_FOUND) !== null && _m !== void 0 ? _m : 'No elements found',
            customize: (_input, _inputRect, container) => {
                container.style.width = ''; // unset width that was set internally by the Autopleter lib
            },
            onSelect: (item) => {
                this.isItemSelected = true;
                this.handleSelect(item);
            },
            ...this.filterOptions,
        };
        // "render" callback overriding
        if ((_o = this._autocompleterOptions.renderItem) === null || _o === void 0 ? void 0 : _o.layout) {
            // when "renderItem" is defined, we need to add our custom style CSS classes & custom item renderer
            this._autocompleterOptions.className += ` autocomplete-custom-${(0, utils_1.toKebabCase)(this._autocompleterOptions.renderItem.layout)}`;
            this._autocompleterOptions.render = this.renderCustomItem.bind(this);
        }
        else if (Array.isArray(collection)) {
            // we'll use our own renderer so that it works with label prefix/suffix and also with html rendering when enabled
            this._autocompleterOptions.render = (_q = (_p = this._autocompleterOptions.render) === null || _p === void 0 ? void 0 : _p.bind(this)) !== null && _q !== void 0 ? _q : this.renderCollectionItem.bind(this);
        }
        else if (!this._autocompleterOptions.render) {
            // when no render callback is defined, we still need to define our own renderer for regular item
            // because we accept string array but the Kraaden autocomplete doesn't by default and we can change that
            this._autocompleterOptions.render = this.renderRegularItem.bind(this);
        }
        // when user passes it's own autocomplete "fetch" method
        // we still need to provide our own "onSelect" callback implementation
        if ((_r = this.filterOptions) === null || _r === void 0 ? void 0 : _r.fetch) {
            // add loading class by overriding user's fetch method
            (0, commonEditorFilter_1.addAutocompleteLoadingByOverridingFetch)(this._filterElm, this._autocompleterOptions);
            // create the Kraaden AutoComplete
            this._instance = autocomplete(this._autocompleterOptions);
        }
        else {
            this._instance = autocomplete({
                ...this._autocompleterOptions,
                fetch: (searchText, updateCallback) => {
                    if (collection) {
                        // you can also use AJAX requests instead of preloaded data
                        // also at this point our collection was already modified, by the previous map, to have the "label" property (unless it's a string)
                        updateCallback(collection.filter(c => {
                            const label = (typeof c === 'string' ? c : c === null || c === void 0 ? void 0 : c.label) || '';
                            return label.toLowerCase().includes(searchText.toLowerCase());
                        }));
                    }
                }
            });
        }
        this._filterElm.value = searchTermInput !== null && searchTermInput !== void 0 ? searchTermInput : '';
        // append the new DOM element to the header row
        const filterDivContainerElm = (0, services_1.createDomElement)('div', { className: 'autocomplete-filter-container' });
        filterDivContainerElm.appendChild(this._filterElm);
        // add an empty <span> in order to add loading spinner styling
        filterDivContainerElm.appendChild((0, services_1.createDomElement)('span'));
        // if there's a search term, we will add the "filled" class for styling purposes
        if (searchTerm) {
            this._filterElm.classList.add('filled');
        }
        // append the new DOM element to the header row & an empty span
        this.filterContainerElm.appendChild(filterDivContainerElm);
        this.filterContainerElm.appendChild(document.createElement('span'));
        return this._filterElm;
    }
    //
    // protected functions
    // ------------------
    // this function should be PRIVATE but for unit tests purposes we'll make it public until a better solution is found
    // a better solution would be to get the autocomplete DOM element to work with selection but I couldn't find how to do that in Jest
    handleSelect(item) {
        var _a, _b, _c, _d;
        if (item !== undefined) {
            const event = undefined; // TODO do we need the event?
            // when the user defines a "renderItem" (or "_renderItem") template, then we assume the user defines his own custom structure of label/value pair
            // otherwise we know that the autocomplete lib always require a label/value pair, we can pull them directly
            const hasCustomRenderItemCallback = (_c = (_b = (_a = this.columnFilter) === null || _a === void 0 ? void 0 : _a.filterOptions) === null || _b === void 0 ? void 0 : _b.renderItem) !== null && _c !== void 0 ? _c : false;
            const itemLabel = typeof item === 'string' ? item : (hasCustomRenderItemCallback ? item[this.labelName] : item.label);
            let itemValue = typeof item === 'string' ? item : (hasCustomRenderItemCallback ? item[this.valueName] : item.value);
            // trim whitespaces when option is enabled globally or on the filter itself
            itemValue = this.trimWhitespaceWhenEnabled(itemValue);
            // add/remove "filled" class name
            const classCmd = itemValue === '' ? 'remove' : 'add';
            (_d = this._filterElm) === null || _d === void 0 ? void 0 : _d.classList[classCmd]('filled');
            this.setValues(itemLabel);
            this.callback(event, { columnDef: this.columnDef, operator: this.operator, searchTerms: [itemValue], shouldTriggerQuery: this._shouldTriggerQuery });
            // reset both flags for next use
            this._clearFilterTriggered = false;
            this._shouldTriggerQuery = true;
        }
        return false;
    }
    handleOnInputChange(e) {
        var _a, _b, _c, _d, _e;
        let value = (_b = (_a = e === null || e === void 0 ? void 0 : e.target) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : '';
        const shouldTriggerOnEveryKeyStroke = (_c = this.filterOptions.triggerOnEveryKeyStroke) !== null && _c !== void 0 ? _c : false;
        // trim whitespaces when option is enabled globally or on the filter itself
        value = this.trimWhitespaceWhenEnabled(value);
        if (this._clearFilterTriggered || value === '' || shouldTriggerOnEveryKeyStroke) {
            const callbackArgs = { columnDef: this.columnDef, shouldTriggerQuery: this._shouldTriggerQuery };
            if (this._clearFilterTriggered) {
                callbackArgs.clearFilterTriggered = this._clearFilterTriggered;
            }
            else {
                callbackArgs.operator = this.operator;
                callbackArgs.searchTerms = [value];
            }
            if (value !== '') {
                this.isItemSelected = true;
                (_d = this._filterElm) === null || _d === void 0 ? void 0 : _d.classList.add('filled');
            }
            else {
                this.isItemSelected = false;
                (_e = this._filterElm) === null || _e === void 0 ? void 0 : _e.classList.remove('filled');
            }
            this.callback(e, callbackArgs);
        }
        // reset both flags for next use
        this._clearFilterTriggered = false;
        this._shouldTriggerQuery = true;
    }
    renderRegularItem(item) {
        var _a;
        const itemLabel = (typeof item === 'string' ? item : (_a = item === null || item === void 0 ? void 0 : item.label) !== null && _a !== void 0 ? _a : '');
        return (0, services_1.createDomElement)('div', {
            textContent: itemLabel || ''
        });
    }
    renderCustomItem(item) {
        var _a, _b, _c;
        const templateString = (_c = (_b = (_a = this._autocompleterOptions) === null || _a === void 0 ? void 0 : _a.renderItem) === null || _b === void 0 ? void 0 : _b.templateCallback(item)) !== null && _c !== void 0 ? _c : '';
        // sanitize any unauthorized html tags like script and others
        // for the remaining allowed tags we'll permit all attributes
        const sanitizedTemplateText = (0, domUtilities_1.sanitizeTextByAvailableSanitizer)(this.gridOptions, templateString) || '';
        const tmpDiv = document.createElement('div');
        tmpDiv.innerHTML = sanitizedTemplateText;
        return tmpDiv;
    }
    renderCollectionItem(item) {
        var _a, _b;
        const isRenderHtmlEnabled = (_b = (_a = this.columnFilter) === null || _a === void 0 ? void 0 : _a.enableRenderHtml) !== null && _b !== void 0 ? _b : false;
        const prefixText = item.labelPrefix || '';
        const labelText = item.label || '';
        const suffixText = item.labelSuffix || '';
        const finalText = prefixText + labelText + suffixText;
        // sanitize any unauthorized html tags like script and others
        // for the remaining allowed tags we'll permit all attributes
        const sanitizedText = (0, domUtilities_1.sanitizeTextByAvailableSanitizer)(this.gridOptions, finalText) || '';
        const div = document.createElement('div');
        div[isRenderHtmlEnabled ? 'innerHTML' : 'textContent'] = sanitizedText;
        return div;
    }
    /**
     * Trim whitespaces when option is enabled globally or on the filter itself
     * @param value - value found which could be a string or an object
     * @returns - trimmed value when it is a string and the feature is enabled
     */
    trimWhitespaceWhenEnabled(value) {
        let outputValue = value;
        const enableWhiteSpaceTrim = this.gridOptions.enableFilterTrimWhiteSpace || this.columnFilter.enableTrimWhiteSpace;
        if (typeof value === 'string' && enableWhiteSpaceTrim) {
            outputValue = value.trim();
        }
        return outputValue;
    }
}
exports.AutocompleterFilter = AutocompleterFilter;
//# sourceMappingURL=autocompleterFilter.js.map