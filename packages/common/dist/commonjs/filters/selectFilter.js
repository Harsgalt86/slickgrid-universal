"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelectFilter = void 0;
const multiple_select_vanilla_1 = require("multiple-select-vanilla");
const utils_1 = require("@slickgrid-universal/utils");
const constants_1 = require("../constants");
const index_1 = require("../enums/index");
const observers_1 = require("../services/observers");
const utilities_1 = require("../services/utilities");
const index_2 = require("../services/index");
const filterUtilities_1 = require("./filterUtilities");
class SelectFilter {
    /**
     * Initialize the Filter
     */
    constructor(translaterService, collectionService, rxjs, isMultipleSelect = true) {
        this.translaterService = translaterService;
        this.collectionService = collectionService;
        this.rxjs = rxjs;
        this._isMultipleSelect = true;
        this._collectionLength = 0;
        this._shouldTriggerQuery = true;
        this.isFilled = false;
        this.enableTranslateLabel = false;
        this.subscriptions = [];
        this._isMultipleSelect = isMultipleSelect;
    }
    /** Getter for the Collection Options */
    get collectionOptions() {
        var _a, _b, _c;
        return (_c = (_b = (_a = this.columnDef) === null || _a === void 0 ? void 0 : _a.filter) === null || _b === void 0 ? void 0 : _b.collectionOptions) !== null && _c !== void 0 ? _c : {};
    }
    /** Getter for the Filter Operator */
    get columnFilter() {
        var _a, _b;
        return (_b = (_a = this.columnDef) === null || _a === void 0 ? void 0 : _a.filter) !== null && _b !== void 0 ? _b : {};
    }
    /** Getter for the Custom Structure if exist */
    get customStructure() {
        var _a, _b;
        return (_b = (_a = this.columnDef) === null || _a === void 0 ? void 0 : _a.filter) === null || _b === void 0 ? void 0 : _b.customStructure;
    }
    /** Getter for the Grid Options pulled through the Grid Object */
    get gridOptions() {
        var _a, _b;
        return (_b = (_a = this.grid) === null || _a === void 0 ? void 0 : _a.getOptions()) !== null && _b !== void 0 ? _b : {};
    }
    /** Getter to know what would be the default operator when none is specified */
    get defaultOperator() {
        return this.isMultipleSelect ? index_1.OperatorType.in : index_1.OperatorType.equal;
    }
    /** Getter to know if the current filter is a multiple-select (false means it's a single select) */
    get isMultipleSelect() {
        return this._isMultipleSelect;
    }
    get msInstance() {
        return this._msInstance;
    }
    get selectOptions() {
        return this.defaultOptions;
    }
    /** Getter for the Filter Operator */
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
    /** Initialize the filter template */
    init(args) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u;
        if (!args) {
            throw new Error('[Slickgrid-Universal] A filter must always have an "init()" with valid arguments.');
        }
        this.grid = args.grid;
        this.callback = args.callback;
        this.columnDef = args.columnDef;
        this.searchTerms = (args.hasOwnProperty('searchTerms') ? args.searchTerms : []) || [];
        this.filterContainerElm = args.filterContainerElm;
        if (!this.grid || !this.columnDef || !this.columnFilter || (!this.columnFilter.collection && !this.columnFilter.collectionAsync)) {
            throw new Error(`[Slickgrid-Universal] You need to pass a "collection" (or "collectionAsync") for the MultipleSelect/SingleSelect Filter to work correctly. Also each option should include a value/label pair (or value/labelKey when using Locale). For example:: { filter: model: Filters.multipleSelect, collection: [{ value: true, label: 'True' }, { value: false, label: 'False'}] }`);
        }
        this.enableTranslateLabel = (_b = (_a = this.columnFilter) === null || _a === void 0 ? void 0 : _a.enableTranslateLabel) !== null && _b !== void 0 ? _b : false;
        this.labelName = (_d = (_c = this.customStructure) === null || _c === void 0 ? void 0 : _c.label) !== null && _d !== void 0 ? _d : 'label';
        this.labelPrefixName = (_f = (_e = this.customStructure) === null || _e === void 0 ? void 0 : _e.labelPrefix) !== null && _f !== void 0 ? _f : 'labelPrefix';
        this.labelSuffixName = (_h = (_g = this.customStructure) === null || _g === void 0 ? void 0 : _g.labelSuffix) !== null && _h !== void 0 ? _h : 'labelSuffix';
        this.optionLabel = (_k = (_j = this.customStructure) === null || _j === void 0 ? void 0 : _j.optionLabel) !== null && _k !== void 0 ? _k : 'value';
        this.valueName = (_m = (_l = this.customStructure) === null || _l === void 0 ? void 0 : _l.value) !== null && _m !== void 0 ? _m : 'value';
        if (this.enableTranslateLabel && (!this.translaterService || typeof this.translaterService.translate !== 'function')) {
            throw new Error(`[select-filter] The Translate Service is required for the Select Filter to work correctly when "enableTranslateLabel" is set.`);
        }
        // get locales provided by user in main file or else use default English locales via the Constants
        this._locales = (_p = (_o = this.gridOptions) === null || _o === void 0 ? void 0 : _o.locales) !== null && _p !== void 0 ? _p : constants_1.Constants.locales;
        // create the multiple select element
        this.initMultipleSelectTemplate();
        // add placeholder when found
        let placeholder = ((_q = this.gridOptions) === null || _q === void 0 ? void 0 : _q.defaultFilterPlaceholder) || '';
        if ((_r = this.columnFilter) === null || _r === void 0 ? void 0 : _r.placeholder) {
            placeholder = this.columnFilter.placeholder;
        }
        this.defaultOptions.placeholder = placeholder || '';
        // when we're using a multiple-select filter and we have an empty select option,
        // we probably want this value to be a valid filter option that will ONLY return value that are empty (not everything like its default behavior)
        // user can still override it by defining it
        if (this._isMultipleSelect && ((_s = this.columnDef) === null || _s === void 0 ? void 0 : _s.filter)) {
            this.columnDef.filter.emptySearchTermReturnAllValues = (_u = (_t = this.columnDef.filter) === null || _t === void 0 ? void 0 : _t.emptySearchTermReturnAllValues) !== null && _u !== void 0 ? _u : false;
        }
        // always render the Select (dropdown) DOM element,
        // if that is the case, the Select will simply be without any options but we still have to render it (else SlickGrid would throw an error)
        const newCollection = this.columnFilter.collection || [];
        this.renderDomElement(newCollection);
        return new Promise(async (resolve, reject) => {
            try {
                const collectionAsync = this.columnFilter.collectionAsync;
                let collectionOutput;
                if (collectionAsync && !this.columnFilter.collection) {
                    // only read the collectionAsync once (on the 1st load),
                    // we do this because Http Fetch will throw an error saying body was already read and its streaming is locked
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
    /** Clear the filter values */
    clear(shouldTriggerQuery = true) {
        var _a, _b, _c;
        if (this._msInstance && this._collectionLength > 0) {
            // reload the filter element by it's id, to make sure it's still a valid element (because of some issue in the GraphQL example)
            this._msInstance.setSelects([]);
            (_a = this.filterElm) === null || _a === void 0 ? void 0 : _a.classList.remove('filled');
            (_c = (_b = this._msInstance) === null || _b === void 0 ? void 0 : _b.getParentElement()) === null || _c === void 0 ? void 0 : _c.classList.remove('filled');
            this.searchTerms = [];
            this._shouldTriggerQuery = shouldTriggerQuery;
            this.callback(undefined, { columnDef: this.columnDef, clearFilterTriggered: true, shouldTriggerQuery: this._shouldTriggerQuery });
            this._shouldTriggerQuery = true; // reset flag for next use
        }
    }
    /** destroy the filter */
    destroy() {
        var _a, _b;
        if (typeof ((_a = this._msInstance) === null || _a === void 0 ? void 0 : _a.destroy) === 'function') {
            this._msInstance.destroy();
        }
        (_b = this.filterElm) === null || _b === void 0 ? void 0 : _b.remove();
        // unsubscribe all the possible Observables if RxJS was used
        (0, utilities_1.unsubscribeAll)(this.subscriptions);
    }
    /**
     * Get selected values retrieved from the multiple-selected element
     * @params selected items
     */
    getValues() {
        var _a, _b;
        return (_b = (_a = this._msInstance) === null || _a === void 0 ? void 0 : _a.getSelects()) !== null && _b !== void 0 ? _b : [];
    }
    /** Set value(s) on the DOM element */
    setValues(values, operator) {
        if (values !== undefined && this._msInstance) {
            values = Array.isArray(values)
                ? values.every(x => (0, utils_1.isPrimitiveValue)(x)) ? values.map(String) : values
                : [values];
            this._msInstance.setSelects(values);
        }
        this.updateFilterStyle(this.getValues().length > 0);
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
        var _a;
        let outputCollection = inputCollection;
        // user might want to filter certain items of the collection
        if (this.columnFilter && this.columnFilter.collectionFilterBy) {
            const filterBy = this.columnFilter.collectionFilterBy;
            const filterCollectionBy = ((_a = this.columnFilter.collectionOptions) === null || _a === void 0 ? void 0 : _a.filterResultAfterEachPass) || null;
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
    renderDomElement(inputCollection) {
        var _a, _b, _c, _d;
        if (!Array.isArray(inputCollection) && ((_a = this.collectionOptions) === null || _a === void 0 ? void 0 : _a.collectionInsideObjectProperty)) {
            const collectionInsideObjectProperty = this.collectionOptions.collectionInsideObjectProperty;
            inputCollection = (0, utilities_1.getDescendantProperty)(inputCollection, collectionInsideObjectProperty || '');
        }
        if (!Array.isArray(inputCollection)) {
            throw new Error('The "collection" passed to the Select Filter is not a valid array.');
        }
        // make a copy of the collection so that we don't impact SelectEditor, this could happen when calling "addBlankEntry" or "addCustomFirstEntry"
        let collection = [];
        if (inputCollection.length > 0) {
            collection = [...inputCollection];
        }
        // user can optionally add a blank entry at the beginning of the collection
        // make sure however that it wasn't added more than once
        if (((_b = this.collectionOptions) === null || _b === void 0 ? void 0 : _b.addBlankEntry) && Array.isArray(collection) && collection.length > 0 && collection[0][this.valueName] !== '') {
            collection.unshift(this.createBlankEntry());
        }
        // user can optionally add his own custom entry at the beginning of the collection
        if (((_c = this.collectionOptions) === null || _c === void 0 ? void 0 : _c.addCustomFirstEntry) && Array.isArray(collection) && collection.length > 0 && collection[0][this.valueName] !== this.collectionOptions.addCustomFirstEntry[this.valueName]) {
            collection.unshift(this.collectionOptions.addCustomFirstEntry);
        }
        // user can optionally add his own custom entry at the end of the collection
        if (((_d = this.collectionOptions) === null || _d === void 0 ? void 0 : _d.addCustomLastEntry) && Array.isArray(collection) && collection.length > 0) {
            const lastCollectionIndex = collection.length - 1;
            if (collection[lastCollectionIndex][this.valueName] !== this.collectionOptions.addCustomLastEntry[this.valueName]) {
                collection.push(this.collectionOptions.addCustomLastEntry);
            }
        }
        // assign the collection to a temp variable before filtering/sorting the collection
        let newCollection = collection;
        // user might want to filter and/or sort certain items of the collection
        newCollection = this.filterCollection(newCollection);
        newCollection = this.sortCollection(newCollection);
        // step 1, create HTML DOM element
        const selectBuildResult = (0, index_2.buildMultipleSelectDataCollection)('filter', newCollection, this.columnDef, this.grid, this.isMultipleSelect, this.translaterService, this.searchTerms || []);
        this.isFilled = selectBuildResult.hasFoundSearchTerm;
        // step 2, create the DOM Element of the filter & pre-load search terms
        // we will later also subscribe to the onClose event to filter the data whenever that event is triggered
        this.createFilterElement(selectBuildResult.selectElement, selectBuildResult.dataCollection);
        this._collectionLength = newCollection.length;
    }
    /** Create a blank entry that can be added to the collection. It will also reuse the same collection structure provided by the user */
    createBlankEntry() {
        const blankEntry = {
            [this.labelName]: '',
            [this.valueName]: ''
        };
        if (this.labelPrefixName) {
            blankEntry[this.labelPrefixName] = '';
        }
        if (this.labelSuffixName) {
            blankEntry[this.labelSuffixName] = '';
        }
        return blankEntry;
    }
    /**
     * From the Select DOM Element created earlier, create a Multiple/Single Select Filter using the multiple-select-vanilla.js lib
     * @param {Object} selectElement
     */
    createFilterElement(selectElement, dataCollection) {
        var _a, _b;
        const columnId = (_b = (_a = this.columnDef) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : '';
        // provide the name attribute to the DOM element which will be needed to auto-adjust drop position (dropup / dropdown)
        this.elementName = `filter-${columnId}`;
        this.defaultOptions.name = this.elementName;
        (0, index_2.emptyElement)(this.filterContainerElm);
        // create the DOM element & add an ID and filter class
        this.filterElm = selectElement;
        this.filterElm.dataset.columnId = `${columnId}`;
        // if there's a search term, we will add the "filled" class for styling purposes
        this.updateFilterStyle(this.isFilled);
        // append the new DOM element to the header row
        this.filterContainerElm.appendChild(selectElement);
        // merge options & attach multiSelect
        const filterOptions = (this.columnFilter) ? this.columnFilter.filterOptions : {};
        this.filterElmOptions = { ...this.defaultOptions, ...filterOptions, data: dataCollection };
        this._msInstance = (0, multiple_select_vanilla_1.multipleSelect)(selectElement, this.filterElmOptions);
    }
    initMultipleSelectTemplate() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
        const isTranslateEnabled = (_b = (_a = this.gridOptions) === null || _a === void 0 ? void 0 : _a.enableTranslate) !== null && _b !== void 0 ? _b : false;
        const columnId = (_d = (_c = this.columnDef) === null || _c === void 0 ? void 0 : _c.id) !== null && _d !== void 0 ? _d : '';
        // default options used by this Filter, user can overwrite any of these by passing "otions"
        const options = {
            autoAdjustDropHeight: true,
            autoAdjustDropPosition: true,
            autoAdjustDropWidthByTextSize: true,
            name: `${columnId}`,
            container: 'body',
            filter: false,
            maxHeight: 275,
            single: true,
            renderOptionLabelAsHtml: (_f = (_e = this.columnFilter) === null || _e === void 0 ? void 0 : _e.enableRenderHtml) !== null && _f !== void 0 ? _f : false,
            sanitizer: (dirtyHtml) => (0, index_2.sanitizeTextByAvailableSanitizer)(this.gridOptions, dirtyHtml),
            // we will subscribe to the onClose event for triggering our callback
            // also add/remove "filled" class for styling purposes
            onClose: () => this.onTriggerEvent()
        };
        if (this._isMultipleSelect) {
            options.single = false;
            options.showOkButton = true;
            options.displayTitle = true; // show tooltip of all selected items while hovering the filter
            const translationPrefix = (0, utilities_1.getTranslationPrefix)(this.gridOptions);
            options.countSelectedText = (isTranslateEnabled && ((_g = this.translaterService) === null || _g === void 0 ? void 0 : _g.translate)) ? this.translaterService.translate(`${translationPrefix}X_OF_Y_SELECTED`) : (_h = this._locales) === null || _h === void 0 ? void 0 : _h.TEXT_X_OF_Y_SELECTED;
            options.allSelectedText = (isTranslateEnabled && ((_j = this.translaterService) === null || _j === void 0 ? void 0 : _j.translate)) ? this.translaterService.translate(`${translationPrefix}ALL_SELECTED`) : (_k = this._locales) === null || _k === void 0 ? void 0 : _k.TEXT_ALL_SELECTED;
            options.noMatchesFoundText = (isTranslateEnabled && ((_l = this.translaterService) === null || _l === void 0 ? void 0 : _l.translate)) ? this.translaterService.translate(`${translationPrefix}NO_MATCHES_FOUND`) : (_m = this._locales) === null || _m === void 0 ? void 0 : _m.TEXT_NO_MATCHES_FOUND;
            options.okButtonText = (isTranslateEnabled && ((_o = this.translaterService) === null || _o === void 0 ? void 0 : _o.translate)) ? this.translaterService.translate(`${translationPrefix}OK`) : (_p = this._locales) === null || _p === void 0 ? void 0 : _p.TEXT_OK;
            options.selectAllText = (isTranslateEnabled && ((_q = this.translaterService) === null || _q === void 0 ? void 0 : _q.translate)) ? this.translaterService.translate(`${translationPrefix}SELECT_ALL`) : (_r = this._locales) === null || _r === void 0 ? void 0 : _r.TEXT_SELECT_ALL;
        }
        this.defaultOptions = options;
    }
    onTriggerEvent() {
        if (this._msInstance) {
            const selectedItems = this.getValues();
            this.updateFilterStyle(Array.isArray(selectedItems) && selectedItems.length > 1 || (selectedItems.length === 1 && selectedItems[0] !== ''));
            this.searchTerms = selectedItems;
            this.callback(undefined, { columnDef: this.columnDef, operator: this.operator, searchTerms: selectedItems, shouldTriggerQuery: this._shouldTriggerQuery });
            // reset flag for next use
            this._shouldTriggerQuery = true;
        }
    }
    /** Set value(s) on the DOM element */
    updateFilterStyle(isFilled) {
        var _a, _b, _c, _d, _e, _f;
        if (isFilled) {
            this.isFilled = true;
            (_a = this.filterElm) === null || _a === void 0 ? void 0 : _a.classList.add('filled');
            (_c = (_b = this._msInstance) === null || _b === void 0 ? void 0 : _b.getParentElement()) === null || _c === void 0 ? void 0 : _c.classList.add('filled');
        }
        else {
            this.isFilled = false;
            (_d = this.filterElm) === null || _d === void 0 ? void 0 : _d.classList.remove('filled');
            (_f = (_e = this._msInstance) === null || _e === void 0 ? void 0 : _e.getParentElement()) === null || _f === void 0 ? void 0 : _f.classList.remove('filled');
        }
    }
}
exports.SelectFilter = SelectFilter;
//# sourceMappingURL=selectFilter.js.map