import { toSentenceCase } from '@slickgrid-universal/utils';
import { FieldType, OperatorType } from '../enums/index';
import { BindingEventService } from '../services/bindingEvent.service';
import { buildSelectOperator, compoundOperatorNumeric, compoundOperatorString } from './filterUtilities';
import { createDomElement, emptyElement, mapOperatorToShorthandDesignation, } from '../services';
export class InputFilter {
    constructor(translaterService) {
        this.translaterService = translaterService;
        this._debounceTypingDelay = 0;
        this._shouldTriggerQuery = true;
        this._inputType = 'text';
        this.inputFilterType = 'single';
        this.searchTerms = [];
        this._bindEventService = new BindingEventService();
    }
    /** Getter for the Column Filter */
    get columnFilter() {
        var _a, _b;
        return (_b = (_a = this.columnDef) === null || _a === void 0 ? void 0 : _a.filter) !== null && _b !== void 0 ? _b : {};
    }
    /** Getter to know what would be the default operator when none is specified */
    get defaultOperator() {
        return OperatorType.empty;
    }
    /** Getter of input type (text, number, password) */
    get inputType() {
        return this._inputType;
    }
    /** Setter of input type (text, number, password) */
    set inputType(type) {
        this._inputType = type;
    }
    /** Getter for the Filter Operator */
    get operator() {
        var _a, _b;
        return (_b = (_a = this.columnFilter) === null || _a === void 0 ? void 0 : _a.operator) !== null && _b !== void 0 ? _b : this.defaultOperator;
    }
    /** Setter for the Filter Operator */
    set operator(operator) {
        if (this.columnFilter) {
            this.columnFilter.operator = operator;
        }
    }
    /** Getter for the Grid Options pulled through the Grid Object */
    get gridOptions() {
        var _a, _b;
        return (_b = (_a = this.grid) === null || _a === void 0 ? void 0 : _a.getOptions()) !== null && _b !== void 0 ? _b : {};
    }
    /**
     * Initialize the Filter
     */
    init(args) {
        var _a, _b, _c, _d, _e, _f;
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
        this._cellContainerElm = args.filterContainerElm;
        // analyze if we have any keyboard debounce delay (do we wait for user to finish typing before querying)
        // it is used by default for a backend service but is optional when using local dataset
        const backendApi = (_b = this.gridOptions) === null || _b === void 0 ? void 0 : _b.backendServiceApi;
        this._debounceTypingDelay = (_f = (backendApi ? ((_c = backendApi === null || backendApi === void 0 ? void 0 : backendApi.filterTypingDebounce) !== null && _c !== void 0 ? _c : (_d = this.gridOptions) === null || _d === void 0 ? void 0 : _d.defaultBackendServiceFilterTypingDebounce) : (_e = this.gridOptions) === null || _e === void 0 ? void 0 : _e.filterTypingDebounce)) !== null && _f !== void 0 ? _f : 0;
        // filter input can only have 1 search term, so we will use the 1st array index if it exist
        const searchTerm = (Array.isArray(this.searchTerms) && this.searchTerms.length >= 0) ? this.searchTerms[0] : '';
        // step 1, create the DOM Element of the filter & initialize it if searchTerm is filled
        this.createDomFilterElement(searchTerm);
        // step 2, subscribe to the input event and run the callback when that happens
        // also add/remove "filled" class for styling purposes
        // we'll use all necessary events to cover the following (keyup, change, mousewheel & spinner)
        this._bindEventService.bind(this._filterInputElm, ['keyup', 'blur', 'change'], this.onTriggerEvent.bind(this));
        this._bindEventService.bind(this._filterInputElm, 'wheel', this.onTriggerEvent.bind(this), { passive: true });
        if (this.inputFilterType === 'compound' && this._selectOperatorElm) {
            this._bindEventService.bind(this._selectOperatorElm, 'change', this.onTriggerEvent.bind(this));
        }
    }
    /**
     * Clear the filter value
     */
    clear(shouldTriggerQuery = true) {
        if (this._filterInputElm) {
            this._shouldTriggerQuery = shouldTriggerQuery;
            this.searchTerms = [];
            this._filterInputElm.value = '';
            this._currentValue = undefined;
            if (this.inputFilterType === 'compound' && this._selectOperatorElm) {
                this._selectOperatorElm.selectedIndex = 0;
                this._filterContainerElm.classList.remove('filled');
            }
            this._filterInputElm.classList.remove('filled');
            this.onTriggerEvent(undefined, true);
        }
    }
    /**
     * destroy the filter
     */
    destroy() {
        var _a, _b, _c, _d;
        this._bindEventService.unbindAll();
        (_b = (_a = this._selectOperatorElm) === null || _a === void 0 ? void 0 : _a.remove) === null || _b === void 0 ? void 0 : _b.call(_a);
        (_d = (_c = this._filterInputElm) === null || _c === void 0 ? void 0 : _c.remove) === null || _d === void 0 ? void 0 : _d.call(_c);
    }
    getValues() {
        return this._filterInputElm.value;
    }
    /** Set value(s) on the DOM element */
    setValues(values, operator) {
        const searchValues = Array.isArray(values) ? values : [values];
        let newInputValue = '';
        for (const value of searchValues) {
            if (this.inputFilterType === 'single') {
                newInputValue = operator ? this.addOptionalOperatorIntoSearchString(value, operator) : value;
            }
            else {
                newInputValue = `${value}`;
            }
            this._filterInputElm.value = `${newInputValue !== null && newInputValue !== void 0 ? newInputValue : ''}`;
            this._currentValue = this._filterInputElm.value;
        }
        if (this.getValues() !== '') {
            this._filterContainerElm.classList.add('filled');
            this._filterInputElm.classList.add('filled');
        }
        else {
            this._filterContainerElm.classList.remove('filled');
            this._filterInputElm.classList.remove('filled');
        }
        // set the operator when defined
        this.operator = operator || this.defaultOperator;
        if (operator && this._selectOperatorElm) {
            const operatorShorthand = mapOperatorToShorthandDesignation(this.operator);
            this._selectOperatorElm.value = operatorShorthand;
        }
    }
    //
    // protected functions
    // ------------------
    /**
     * When loading the search string from the outside into the input text field, we should also add the prefix/suffix of the operator.
     * We do this so that if it was loaded by a Grid Presets then we should also add the operator into the search string
     * Let's take these 3 examples:
     * 1. (operator: '>=', searchTerms:[55]) should display as ">=55"
     * 2. (operator: 'StartsWith', searchTerms:['John']) should display as "John*"
     * 3. (operator: 'EndsWith', searchTerms:['John']) should display as "*John"
     * @param operator - operator string
     */
    addOptionalOperatorIntoSearchString(inputValue, operator) {
        let searchTermPrefix = '';
        let searchTermSuffix = '';
        let outputValue = inputValue === undefined || inputValue === null ? '' : `${inputValue}`;
        if (operator && outputValue) {
            switch (operator) {
                case '<>':
                case '!=':
                case '=':
                case '==':
                case '>':
                case '>=':
                case '<':
                case '<=':
                    searchTermPrefix = operator;
                    break;
                case 'EndsWith':
                case '*z':
                    searchTermPrefix = '*';
                    break;
                case 'StartsWith':
                case 'a*':
                    searchTermSuffix = '*';
                    break;
            }
            outputValue = `${searchTermPrefix}${outputValue}${searchTermSuffix}`;
        }
        return outputValue;
    }
    /** Get the available operator option values to populate the operator select dropdown list */
    getCompoundOperatorOptionValues() {
        var _a;
        const type = (this.columnDef.type && this.columnDef.type) ? this.columnDef.type : FieldType.string;
        let optionValues = [];
        if ((_a = this.columnFilter) === null || _a === void 0 ? void 0 : _a.compoundOperatorList) {
            return this.columnFilter.compoundOperatorList;
        }
        else {
            switch (type) {
                case FieldType.string:
                case FieldType.text:
                case FieldType.readonly:
                case FieldType.password:
                    optionValues = compoundOperatorString(this.gridOptions, this.translaterService);
                    break;
                default:
                    optionValues = compoundOperatorNumeric(this.gridOptions, this.translaterService);
                    break;
            }
        }
        return optionValues;
    }
    /**
     * From the html template string, create a DOM element
     * @param {Object} searchTerm - filter search term
     * @returns {Object} DOM element filter
     */
    createDomFilterElement(searchTerm) {
        var _a, _b, _c, _d, _e, _f, _g;
        const columnId = (_b = (_a = this.columnDef) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : '';
        emptyElement(this._cellContainerElm);
        // create the DOM element & add an ID and filter class
        let placeholder = (_d = (_c = this.gridOptions) === null || _c === void 0 ? void 0 : _c.defaultFilterPlaceholder) !== null && _d !== void 0 ? _d : '';
        if ((_e = this.columnFilter) === null || _e === void 0 ? void 0 : _e.placeholder) {
            placeholder = this.columnFilter.placeholder;
        }
        const searchVal = `${searchTerm !== null && searchTerm !== void 0 ? searchTerm : ''}`;
        this._filterInputElm = createDomElement('input', {
            type: this._inputType || 'text',
            autocomplete: 'off', ariaAutoComplete: 'none', placeholder,
            ariaLabel: (_g = (_f = this.columnFilter) === null || _f === void 0 ? void 0 : _f.ariaLabel) !== null && _g !== void 0 ? _g : `${toSentenceCase(columnId + '')} Search Filter`,
            className: `form-control filter-${columnId}`,
            value: searchVal,
            dataset: { columnid: `${columnId}` }
        });
        // if there's a search term, we will add the "filled" class for styling purposes
        if (searchTerm) {
            this._filterInputElm.classList.add('filled');
        }
        if (searchTerm !== undefined) {
            this._currentValue = searchVal;
        }
        // create the DOM Select dropdown for the Operator
        if (this.inputFilterType === 'single') {
            this._filterContainerElm = this._filterInputElm;
            // append the new DOM element to the header row & an empty span
            this._filterInputElm.classList.add('search-filter');
            this._cellContainerElm.appendChild(this._filterInputElm);
            this._cellContainerElm.appendChild(document.createElement('span'));
        }
        else {
            // compound filter
            this._filterInputElm.classList.add('compound-input');
            this._selectOperatorElm = buildSelectOperator(this.getCompoundOperatorOptionValues(), this.gridOptions);
            this._filterContainerElm = createDomElement('div', { className: `form-group search-filter filter-${columnId}` });
            const containerInputGroupElm = createDomElement('div', { className: 'input-group' }, this._filterContainerElm);
            const operatorInputGroupAddonElm = createDomElement('div', { className: 'input-group-addon input-group-prepend operator' }, containerInputGroupElm);
            // append operator & input DOM element
            operatorInputGroupAddonElm.appendChild(this._selectOperatorElm);
            containerInputGroupElm.appendChild(this._filterInputElm);
            containerInputGroupElm.appendChild(createDomElement('span'));
            if (this.operator) {
                this._selectOperatorElm.value = mapOperatorToShorthandDesignation(this.operator);
            }
            // append the new DOM element to the header row
            if (this._filterContainerElm) {
                this._cellContainerElm.appendChild(this._filterContainerElm);
            }
        }
    }
    /**
     * Event handler to cover the following (keyup, change, mousewheel & spinner)
     * We will trigger the Filter Service callback from this handler
     */
    onTriggerEvent(event, isClearFilterEvent = false) {
        var _a, _b, _c, _d, _e;
        if (isClearFilterEvent) {
            this.callback(event, { columnDef: this.columnDef, clearFilterTriggered: isClearFilterEvent, shouldTriggerQuery: this._shouldTriggerQuery });
            this._filterContainerElm.classList.remove('filled');
        }
        else {
            const eventType = (_a = event === null || event === void 0 ? void 0 : event.type) !== null && _a !== void 0 ? _a : '';
            const selectedOperator = ((_c = (_b = this._selectOperatorElm) === null || _b === void 0 ? void 0 : _b.value) !== null && _c !== void 0 ? _c : this.operator);
            let value = this._filterInputElm.value;
            const enableWhiteSpaceTrim = this.gridOptions.enableFilterTrimWhiteSpace || this.columnFilter.enableTrimWhiteSpace;
            if (typeof value === 'string' && enableWhiteSpaceTrim) {
                value = value.trim();
            }
            if (((_d = event === null || event === void 0 ? void 0 : event.target) === null || _d === void 0 ? void 0 : _d.tagName.toLowerCase()) !== 'select') {
                this._currentValue = value;
            }
            value === '' ? this._filterContainerElm.classList.remove('filled') : this._filterContainerElm.classList.add('filled');
            const callbackArgs = { columnDef: this.columnDef, operator: selectedOperator, searchTerms: (value ? [value] : null), shouldTriggerQuery: this._shouldTriggerQuery };
            const typingDelay = (eventType === 'keyup' && (event === null || event === void 0 ? void 0 : event.key) !== 'Enter') ? this._debounceTypingDelay : 0;
            const skipCompoundOperatorFilterWithNullInput = (_e = this.columnFilter.skipCompoundOperatorFilterWithNullInput) !== null && _e !== void 0 ? _e : this.gridOptions.skipCompoundOperatorFilterWithNullInput;
            if (this.inputFilterType === 'single' || !skipCompoundOperatorFilterWithNullInput || this._currentValue !== undefined) {
                if (typingDelay > 0) {
                    clearTimeout(this._timer);
                    this._timer = setTimeout(() => this.callback(event, callbackArgs), typingDelay);
                }
                else {
                    this.callback(event, callbackArgs);
                }
            }
        }
        // reset both flags for next use
        this._shouldTriggerQuery = true;
    }
}
//# sourceMappingURL=inputFilter.js.map