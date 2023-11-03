"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SliderFilter = void 0;
const utils_1 = require("@slickgrid-universal/utils");
const constants_1 = require("../constants");
const index_1 = require("../enums/index");
const bindingEvent_service_1 = require("../services/bindingEvent.service");
const domUtilities_1 = require("../services/domUtilities");
const utilities_1 = require("../services/utilities");
const filterUtilities_1 = require("./filterUtilities");
const DEFAULT_SLIDER_TRACK_FILLED_COLOR = '#86bff8';
const GAP_BETWEEN_SLIDER_HANDLES = 0;
const Z_INDEX_MIN_GAP = 20; // gap in Px before we change z-index so that lowest/highest handle doesn't block each other
/** A Slider Range Filter written in pure JS, this is only meant to be used as a range filter (with 2 handles lowest & highest values) */
class SliderFilter {
    constructor(translaterService) {
        this.translaterService = translaterService;
        this._clearFilterTriggered = false;
        this._shouldTriggerQuery = true;
        this._sliderTrackFilledColor = DEFAULT_SLIDER_TRACK_FILLED_COLOR;
        this.sliderType = 'double';
        this.searchTerms = [];
        this._bindEventService = new bindingEvent_service_1.BindingEventService();
    }
    /** Getter for the Column Filter */
    get columnFilter() {
        var _a, _b;
        return (_b = (_a = this.columnDef) === null || _a === void 0 ? void 0 : _a.filter) !== null && _b !== void 0 ? _b : {};
    }
    /** Getter for the Current Slider Value */
    get currentValue() {
        return this._currentValue;
    }
    /** Getter for the Current Slider Values */
    get currentValues() {
        return this._currentValues;
    }
    /** Getter to know what would be the default operator when none is specified */
    get defaultOperator() {
        if (this.sliderType === 'compound') {
            return index_1.OperatorType.empty;
        }
        else if (this.sliderType === 'single') {
            return index_1.OperatorType.greaterThanOrEqual;
        }
        return this.gridOptions.defaultFilterRangeOperator || index_1.OperatorType.rangeInclusive;
    }
    /** Getter for the Grid Options pulled through the Grid Object */
    get gridOptions() {
        var _a, _b;
        return (_b = (_a = this.grid) === null || _a === void 0 ? void 0 : _a.getOptions()) !== null && _b !== void 0 ? _b : {};
    }
    /** Getter for the current Slider Options */
    get sliderOptions() {
        return this._sliderOptions;
    }
    /** Getter for the Filter Operator */
    get operator() {
        var _a, _b;
        return this._operator || ((_b = (_a = this.columnFilter) === null || _a === void 0 ? void 0 : _a.operator) !== null && _b !== void 0 ? _b : this.defaultOperator);
    }
    /** Setter for the Filter Operator */
    set operator(operator) {
        this._operator = operator;
    }
    /** Initialize the Filter */
    init(args) {
        var _a;
        if (!args) {
            throw new Error('[Slickgrid-Universal] A filter must always have an "init()" with valid arguments.');
        }
        this.grid = args.grid;
        this.callback = args.callback;
        this.columnDef = args.columnDef;
        this.operator = args.operator || '';
        this.searchTerms = (_a = args === null || args === void 0 ? void 0 : args.searchTerms) !== null && _a !== void 0 ? _a : [];
        this._argFilterContainerElm = args.filterContainerElm;
        // get slider track filled color from CSS variable when exist
        this._sliderTrackFilledColor = window.getComputedStyle(document.documentElement).getPropertyValue('--slick-slider-filter-filled-track-color') || DEFAULT_SLIDER_TRACK_FILLED_COLOR;
        // step 1, create the DOM Element of the filter & initialize it if searchTerm is filled
        this._filterElm = this.createDomFilterElement(this.searchTerms);
    }
    /** Clear the filter value */
    clear(shouldTriggerQuery = true) {
        var _a, _b, _c, _d, _e, _f;
        if (this._filterElm) {
            this._clearFilterTriggered = true;
            this._shouldTriggerQuery = shouldTriggerQuery;
            this.searchTerms = [];
            const lowestValue = +((_a = (0, filterUtilities_1.getFilterOptionByName)(this.columnFilter, 'sliderStartValue')) !== null && _a !== void 0 ? _a : constants_1.Constants.SLIDER_DEFAULT_MIN_VALUE);
            const highestValue = +((_b = (0, filterUtilities_1.getFilterOptionByName)(this.columnFilter, 'sliderEndValue')) !== null && _b !== void 0 ? _b : constants_1.Constants.SLIDER_DEFAULT_MAX_VALUE);
            if (this.sliderType === 'double') {
                if (this._sliderLeftInputElm) {
                    this._sliderLeftInputElm.value = `${lowestValue}`;
                }
                if (this._sliderRightInputElm) {
                    this._sliderRightInputElm.value = `${highestValue}`;
                }
                this._currentValues = [lowestValue, highestValue];
                (_c = this._sliderLeftInputElm) === null || _c === void 0 ? void 0 : _c.dispatchEvent(new Event('change'));
                (_d = this._sliderRightInputElm) === null || _d === void 0 ? void 0 : _d.dispatchEvent(new Event('change'));
            }
            else {
                // for compound/single sliders, we'll only change to the lowest value
                if (this._sliderRightInputElm) {
                    this._sliderRightInputElm.value = `${lowestValue}`;
                }
                if (this._selectOperatorElm) {
                    this._selectOperatorElm.selectedIndex = 0; // reset to empty Operator when included
                }
                this._currentValue = lowestValue;
                (_e = this._sliderRightInputElm) === null || _e === void 0 ? void 0 : _e.dispatchEvent(new Event('change'));
            }
            const hideSliderNumbers = (_f = (0, filterUtilities_1.getFilterOptionByName)(this.columnFilter, 'hideSliderNumber')) !== null && _f !== void 0 ? _f : (0, filterUtilities_1.getFilterOptionByName)(this.columnFilter, 'hideSliderNumbers');
            if (!hideSliderNumbers) {
                if (this.sliderType === 'double') {
                    this.renderSliderValues(lowestValue, highestValue);
                }
                else {
                    this.renderSliderValues(undefined, lowestValue);
                }
            }
            this._divContainerFilterElm.classList.remove('filled');
            this._filterElm.classList.remove('filled');
            this.callback(undefined, { columnDef: this.columnDef, clearFilterTriggered: true, shouldTriggerQuery, searchTerms: [] });
        }
    }
    /** destroy the filter */
    destroy() {
        var _a, _b, _c;
        this._bindEventService.unbindAll();
        (_a = this._sliderTrackElm) === null || _a === void 0 ? void 0 : _a.remove();
        (_b = this._sliderLeftInputElm) === null || _b === void 0 ? void 0 : _b.remove();
        (_c = this._sliderRightInputElm) === null || _c === void 0 ? void 0 : _c.remove();
    }
    /**
     * Render both slider values (low/high) on screen
     * @param leftValue number
     * @param rightValue number
     */
    renderSliderValues(leftValue, rightValue) {
        var _a, _b;
        if (((_a = this._leftSliderNumberElm) === null || _a === void 0 ? void 0 : _a.textContent) && leftValue) {
            this._leftSliderNumberElm.textContent = leftValue.toString();
        }
        if (((_b = this._rightSliderNumberElm) === null || _b === void 0 ? void 0 : _b.textContent) && rightValue) {
            this._rightSliderNumberElm.textContent = rightValue.toString();
        }
    }
    /** get current slider value(s), it could be a single value or an array of 2 values depending on the slider filter type */
    getValues() {
        return this.sliderType === 'double' ? this._currentValues : this._currentValue;
    }
    /**
     * Set value(s) on the DOM element
     * @params searchTerms
     */
    setValues(values, operator) {
        var _a;
        if (values) {
            let sliderVals = [];
            const term1 = Array.isArray(values) ? values === null || values === void 0 ? void 0 : values[0] : values;
            if (Array.isArray(values) && values.length === 2) {
                sliderVals = values;
            }
            else {
                if (typeof term1 === 'string' && term1.indexOf('..') > 0) {
                    sliderVals = term1.split('..');
                    this._currentValue = +((_a = sliderVals === null || sliderVals === void 0 ? void 0 : sliderVals[0]) !== null && _a !== void 0 ? _a : 0);
                }
                else if ((0, utils_1.hasData)(term1) || term1 === '') {
                    this._currentValue = +term1;
                    sliderVals = [term1];
                }
            }
            if (this.sliderType !== 'double' && this._sliderRightInputElm) {
                this._sliderRightInputElm.value = typeof values === 'string' ? values : `${term1}`;
                this.renderSliderValues(undefined, this._sliderRightInputElm.value);
            }
            else if (Array.isArray(sliderVals) && sliderVals.length === 2) {
                if (!(0, filterUtilities_1.getFilterOptionByName)(this.columnFilter, 'hideSliderNumbers')) {
                    const [lowestValue, highestValue] = sliderVals;
                    if (this._sliderLeftInputElm) {
                        this._sliderLeftInputElm.value = String(lowestValue !== null && lowestValue !== void 0 ? lowestValue : constants_1.Constants.SLIDER_DEFAULT_MIN_VALUE);
                    }
                    if (this._sliderRightInputElm) {
                        this._sliderRightInputElm.value = String(highestValue !== null && highestValue !== void 0 ? highestValue : constants_1.Constants.SLIDER_DEFAULT_MAX_VALUE);
                    }
                    this.renderSliderValues(...sliderVals);
                }
            }
        }
        else {
            this._currentValue = undefined;
            this._currentValues = undefined;
        }
        const val = this.getValues();
        const vals = val === undefined ? [] : Array.isArray(val) ? val : [val];
        (vals.length > 0)
            ? this._filterElm.classList.add('filled')
            : this._filterElm.classList.remove('filled');
        // set the operator when defined
        if (operator !== undefined) {
            this.operator = operator;
        }
        if (this.operator && this._selectOperatorElm) {
            const operatorShorthand = (0, utilities_1.mapOperatorToShorthandDesignation)(this.operator);
            this._selectOperatorElm.value = operatorShorthand;
        }
    }
    /**
     * Create the Filter DOM element
     * Follows article with few modifications (without tooltip & neither slider track color)
     * https://codingartistweb.com/2021/06/double-range-slider-html-css-javascript/
     * @param searchTerm optional preset search terms
     */
    createDomFilterElement(searchTerms) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
        const columnId = (_b = (_a = this.columnDef) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : '';
        const minValue = +((_d = (_c = this.columnFilter) === null || _c === void 0 ? void 0 : _c.minValue) !== null && _d !== void 0 ? _d : constants_1.Constants.SLIDER_DEFAULT_MIN_VALUE);
        const maxValue = +((_f = (_e = this.columnFilter) === null || _e === void 0 ? void 0 : _e.maxValue) !== null && _f !== void 0 ? _f : constants_1.Constants.SLIDER_DEFAULT_MAX_VALUE);
        const step = +((_h = (_g = this.columnFilter) === null || _g === void 0 ? void 0 : _g.valueStep) !== null && _h !== void 0 ? _h : constants_1.Constants.SLIDER_DEFAULT_STEP);
        (0, domUtilities_1.emptyElement)(this._argFilterContainerElm);
        const defaultStartValue = +((_k = (_j = (Array.isArray(searchTerms) && (searchTerms === null || searchTerms === void 0 ? void 0 : searchTerms[0]))) !== null && _j !== void 0 ? _j : (0, filterUtilities_1.getFilterOptionByName)(this.columnFilter, 'sliderStartValue')) !== null && _k !== void 0 ? _k : minValue);
        const defaultEndValue = +((_m = (_l = (Array.isArray(searchTerms) && (searchTerms === null || searchTerms === void 0 ? void 0 : searchTerms[1]))) !== null && _l !== void 0 ? _l : (0, filterUtilities_1.getFilterOptionByName)(this.columnFilter, 'sliderEndValue')) !== null && _m !== void 0 ? _m : maxValue);
        this._sliderRangeContainElm = (0, domUtilities_1.createDomElement)('div', {
            className: `filter-input filter-${columnId} slider-input-container slider-values`,
            title: this.sliderType === 'double' ? `${defaultStartValue} - ${defaultEndValue}` : `${defaultStartValue}`
        });
        this._sliderTrackElm = (0, domUtilities_1.createDomElement)('div', { className: 'slider-track' });
        // create Operator dropdown DOM element
        if (this.sliderType === 'compound') {
            const spanPrependElm = (0, domUtilities_1.createDomElement)('span', { className: 'input-group-addon input-group-prepend operator' });
            this._selectOperatorElm = (0, filterUtilities_1.buildSelectOperator)(this.getOperatorOptionValues(), this.gridOptions);
            spanPrependElm.appendChild(this._selectOperatorElm);
        }
        // create 2nd (left) slider element to simulate a Slider Range with 2 handles
        // the left slider represents min value slider, while right slider is for max value
        if (this.sliderType === 'double') {
            this._sliderLeftInputElm = (0, domUtilities_1.createDomElement)('input', {
                type: 'range',
                className: `slider-filter-input`,
                ariaLabel: (_p = (_o = this.columnFilter) === null || _o === void 0 ? void 0 : _o.ariaLabel) !== null && _p !== void 0 ? _p : `${(0, utils_1.toSentenceCase)(columnId + '')} Search Filter`,
                defaultValue: `${defaultStartValue}`, value: `${defaultStartValue}`,
                min: `${minValue}`, max: `${maxValue}`, step: `${step}`,
            });
        }
        // right slider will be used by all Slider types
        const rightDefaultVal = this.sliderType === 'double' ? defaultEndValue : defaultStartValue;
        this._sliderRightInputElm = (0, domUtilities_1.createDomElement)('input', {
            type: 'range',
            className: `slider-filter-input`,
            ariaLabel: (_r = (_q = this.columnFilter) === null || _q === void 0 ? void 0 : _q.ariaLabel) !== null && _r !== void 0 ? _r : `${(0, utils_1.toSentenceCase)(columnId + '')} Search Filter`,
            defaultValue: `${rightDefaultVal}`, value: `${rightDefaultVal}`,
            min: `${minValue}`, max: `${maxValue}`, step: `${step}`,
        });
        // put all DOM elements together to create the final Slider
        const hideSliderNumbers = (_s = (0, filterUtilities_1.getFilterOptionByName)(this.columnFilter, 'hideSliderNumber')) !== null && _s !== void 0 ? _s : (0, filterUtilities_1.getFilterOptionByName)(this.columnFilter, 'hideSliderNumbers');
        const sliderNumberClass = hideSliderNumbers ? '' : 'input-group';
        this._divContainerFilterElm = (0, domUtilities_1.createDomElement)('div', { className: `${sliderNumberClass} search-filter slider-container slider-values filter-${columnId}`.trim() });
        this._sliderRangeContainElm.appendChild(this._sliderTrackElm);
        if (this.sliderType === 'double' && this._sliderLeftInputElm) {
            this._sliderRangeContainElm.appendChild(this._sliderLeftInputElm);
        }
        this._sliderRangeContainElm.appendChild(this._sliderRightInputElm);
        if (hideSliderNumbers) {
            this._divContainerFilterElm.appendChild(this._sliderRangeContainElm);
        }
        else {
            let leftDivGroupElm;
            if (this.sliderType === 'compound' && this._selectOperatorElm) {
                leftDivGroupElm = (0, domUtilities_1.createDomElement)('span', { className: 'input-group-addon input-group-prepend operator' });
                leftDivGroupElm.appendChild(this._selectOperatorElm);
            }
            else if (this.sliderType === 'double') {
                leftDivGroupElm = (0, domUtilities_1.createDomElement)('div', { className: `input-group-addon input-group-prepend slider-range-value` });
                this._leftSliderNumberElm = (0, domUtilities_1.createDomElement)('span', { className: `input-group-text lowest-range-${columnId}`, textContent: `${defaultStartValue}` });
                leftDivGroupElm.appendChild(this._leftSliderNumberElm);
            }
            const rightDivGroupElm = (0, domUtilities_1.createDomElement)('div', { className: `input-group-addon input-group-append slider-range-value` });
            this._rightSliderNumberElm = (0, domUtilities_1.createDomElement)('span', { className: `input-group-text highest-range-${columnId}`, textContent: `${rightDefaultVal}` }, rightDivGroupElm);
            if (leftDivGroupElm) {
                this._divContainerFilterElm.appendChild(leftDivGroupElm);
            }
            this._divContainerFilterElm.appendChild(this._sliderRangeContainElm);
            this._divContainerFilterElm.appendChild(rightDivGroupElm);
        }
        // merge options with optional user's custom options
        this._sliderOptions = { minValue, maxValue, step };
        // if we are preloading searchTerms, we'll keep them for reference
        this._currentValues = [defaultStartValue, defaultEndValue];
        // if there's a search term, we will add the "filled" class for styling purposes
        if (Array.isArray(searchTerms) && searchTerms.length > 0 && searchTerms[0] !== '') {
            this._divContainerFilterElm.classList.add('filled');
            this._currentValue = defaultStartValue;
        }
        if ((0, filterUtilities_1.getFilterOptionByName)(this.columnFilter, 'sliderStartValue') !== undefined || ((_t = this.columnFilter) === null || _t === void 0 ? void 0 : _t.minValue) !== undefined) {
            this._currentValue = defaultStartValue;
        }
        // append the new DOM element to the header row
        this._argFilterContainerElm.appendChild(this._divContainerFilterElm);
        this.updateTrackFilledColorWhenEnabled();
        // attach events
        this._bindEventService.bind(this._sliderTrackElm, 'click', this.sliderTrackClicked.bind(this));
        this._bindEventService.bind(this._sliderRightInputElm, ['input', 'change'], this.slideRightInputChanged.bind(this));
        this._bindEventService.bind(this._sliderRightInputElm, ['change', 'mouseup', 'touchend'], this.onValueChanged.bind(this));
        if (this.sliderType === 'compound' && this._selectOperatorElm) {
            this._bindEventService.bind(this._selectOperatorElm, ['change'], this.onValueChanged.bind(this));
        }
        else if (this.sliderType === 'double' && this._sliderLeftInputElm) {
            this._bindEventService.bind(this._sliderLeftInputElm, ['input', 'change'], this.slideLeftInputChanged.bind(this));
            this._bindEventService.bind(this._sliderLeftInputElm, ['change', 'mouseup', 'touchend'], this.onValueChanged.bind(this));
        }
        return this._divContainerFilterElm;
    }
    /** Get the available operator option values to populate the operator select dropdown list */
    getOperatorOptionValues() {
        var _a;
        if ((_a = this.columnFilter) === null || _a === void 0 ? void 0 : _a.compoundOperatorList) {
            return this.columnFilter.compoundOperatorList;
        }
        return (0, filterUtilities_1.compoundOperatorNumeric)(this.gridOptions, this.translaterService);
    }
    /** handle value change event triggered, trigger filter callback & update "filled" class name */
    onValueChanged(e) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        const sliderRightVal = parseInt((_b = (_a = this._sliderRightInputElm) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : '', 10);
        let value;
        let searchTerms;
        if (this.sliderType === 'compound' || this.sliderType === 'single') {
            // only update ref when the value from the input
            if (((_d = (_c = e === null || e === void 0 ? void 0 : e.target) === null || _c === void 0 ? void 0 : _c.tagName) === null || _d === void 0 ? void 0 : _d.toLowerCase()) !== 'select') {
                this._currentValue = +sliderRightVal;
            }
            value = this._currentValue;
            searchTerms = [value || '0'];
        }
        else if (this.sliderType === 'double') {
            const sliderLeftVal = parseInt((_f = (_e = this._sliderLeftInputElm) === null || _e === void 0 ? void 0 : _e.value) !== null && _f !== void 0 ? _f : '', 10);
            const values = [sliderLeftVal, sliderRightVal];
            value = values.join('..');
            searchTerms = values;
        }
        if (this._clearFilterTriggered) {
            this._filterElm.classList.remove('filled');
            this.callback(e, { columnDef: this.columnDef, clearFilterTriggered: this._clearFilterTriggered, searchTerms: [], shouldTriggerQuery: this._shouldTriggerQuery });
        }
        else {
            const selectedOperator = ((_h = (_g = this._selectOperatorElm) === null || _g === void 0 ? void 0 : _g.value) !== null && _h !== void 0 ? _h : this.operator);
            value === '' ? this._filterElm.classList.remove('filled') : this._filterElm.classList.add('filled');
            // when changing compound operator, we don't want to trigger the filter callback unless the filter input is also provided
            const skipCompoundOperatorFilterWithNullInput = (_j = this.columnFilter.skipCompoundOperatorFilterWithNullInput) !== null && _j !== void 0 ? _j : this.gridOptions.skipCompoundOperatorFilterWithNullInput;
            if (this.sliderType !== 'compound' || (!skipCompoundOperatorFilterWithNullInput || this._currentValue !== undefined)) {
                this.callback(e, { columnDef: this.columnDef, operator: selectedOperator || '', searchTerms: searchTerms, shouldTriggerQuery: this._shouldTriggerQuery });
            }
        }
        // reset both flags for next use
        this._clearFilterTriggered = false;
        this._shouldTriggerQuery = true;
        this.changeBothSliderFocuses(false);
        // trigger mouse enter event on the filter for optionally hooked SlickCustomTooltip
        // the minimum requirements for tooltip to work are the columnDef and targetElement
        this.grid.onHeaderRowMouseEnter.notify({ column: this.columnDef, grid: this.grid }, { ...new Slick.EventData(), target: this._argFilterContainerElm });
    }
    changeBothSliderFocuses(isAddingFocus) {
        var _a, _b;
        const addRemoveCmd = isAddingFocus ? 'add' : 'remove';
        (_a = this._sliderLeftInputElm) === null || _a === void 0 ? void 0 : _a.classList[addRemoveCmd]('focus');
        (_b = this._sliderRightInputElm) === null || _b === void 0 ? void 0 : _b.classList[addRemoveCmd]('focus');
    }
    slideLeftInputChanged() {
        var _a, _b, _c, _d;
        const sliderLeftVal = parseInt((_b = (_a = this._sliderLeftInputElm) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : '', 10);
        const sliderRightVal = parseInt((_d = (_c = this._sliderRightInputElm) === null || _c === void 0 ? void 0 : _c.value) !== null && _d !== void 0 ? _d : '', 10);
        if (this._sliderLeftInputElm && sliderRightVal - sliderLeftVal <= (0, filterUtilities_1.getFilterOptionByName)(this.columnFilter, 'stopGapBetweenSliderHandles', GAP_BETWEEN_SLIDER_HANDLES)) {
            this._sliderLeftInputElm.value = String(sliderLeftVal - (0, filterUtilities_1.getFilterOptionByName)(this.columnFilter, 'stopGapBetweenSliderHandles', GAP_BETWEEN_SLIDER_HANDLES));
        }
        // change which handle has higher z-index to make them still usable,
        // ie when left handle reaches the end, it has to have higher z-index or else it will be stuck below
        // and we cannot move right because it cannot go below min value
        if (this._sliderLeftInputElm && this._sliderRightInputElm) {
            if (+this._sliderLeftInputElm.value >= +this._sliderRightInputElm.value - Z_INDEX_MIN_GAP) {
                this._sliderLeftInputElm.style.zIndex = '1';
                this._sliderRightInputElm.style.zIndex = '0';
            }
            else {
                this._sliderLeftInputElm.style.zIndex = '0';
                this._sliderRightInputElm.style.zIndex = '1';
            }
        }
        this.sliderLeftOrRightChanged(sliderLeftVal, sliderRightVal);
    }
    slideRightInputChanged() {
        var _a, _b, _c, _d;
        const sliderLeftVal = parseInt((_b = (_a = this._sliderLeftInputElm) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : '', 10);
        const sliderRightVal = parseInt((_d = (_c = this._sliderRightInputElm) === null || _c === void 0 ? void 0 : _c.value) !== null && _d !== void 0 ? _d : '', 10);
        if (this.sliderType === 'double' && this._sliderRightInputElm && sliderRightVal - sliderLeftVal <= (0, filterUtilities_1.getFilterOptionByName)(this.columnFilter, 'stopGapBetweenSliderHandles', GAP_BETWEEN_SLIDER_HANDLES)) {
            this._sliderRightInputElm.value = String(sliderLeftVal + (0, filterUtilities_1.getFilterOptionByName)(this.columnFilter, 'stopGapBetweenSliderHandles', GAP_BETWEEN_SLIDER_HANDLES));
        }
        this.sliderLeftOrRightChanged(sliderLeftVal, sliderRightVal);
    }
    sliderLeftOrRightChanged(sliderLeftVal, sliderRightVal) {
        var _a, _b, _c, _d, _e, _f, _g;
        this.updateTrackFilledColorWhenEnabled();
        this.changeBothSliderFocuses(true);
        this._sliderRangeContainElm.title = this.sliderType === 'double' ? `${sliderLeftVal} - ${sliderRightVal}` : `${sliderRightVal}`;
        const hideSliderNumbers = (_a = (0, filterUtilities_1.getFilterOptionByName)(this.columnFilter, 'hideSliderNumber')) !== null && _a !== void 0 ? _a : (0, filterUtilities_1.getFilterOptionByName)(this.columnFilter, 'hideSliderNumbers');
        if (!hideSliderNumbers) {
            if ((_b = this._leftSliderNumberElm) === null || _b === void 0 ? void 0 : _b.textContent) {
                this._leftSliderNumberElm.textContent = (_d = (_c = this._sliderLeftInputElm) === null || _c === void 0 ? void 0 : _c.value) !== null && _d !== void 0 ? _d : '';
            }
            if ((_e = this._rightSliderNumberElm) === null || _e === void 0 ? void 0 : _e.textContent) {
                this._rightSliderNumberElm.textContent = (_g = (_f = this._sliderRightInputElm) === null || _f === void 0 ? void 0 : _f.value) !== null && _g !== void 0 ? _g : '';
            }
        }
        // also trigger mouse enter event on the filter in case a SlickCustomTooltip is attached
        this.grid.onHeaderRowMouseEnter.notify({ column: this.columnDef, grid: this.grid }, { ...new Slick.EventData(), target: this._argFilterContainerElm });
    }
    sliderTrackClicked(e) {
        e.preventDefault();
        const sliderTrackX = e.offsetX;
        const sliderTrackWidth = this._sliderTrackElm.offsetWidth;
        const trackPercentPosition = (sliderTrackX + 0) * 100 / sliderTrackWidth;
        if (this._sliderRightInputElm && this.sliderType !== 'double') {
            // when slider is compound/single, we'll automatically move to calculated clicked percentage
            // dispatch a change event to update its value & number when shown
            this._sliderRightInputElm.value = `${trackPercentPosition}`;
            this._sliderRightInputElm.dispatchEvent(new Event('change'));
        }
        else {
            // when tracker position is below 50% we'll auto-place the left slider thumb or else auto-place right slider thumb
            if (this._sliderLeftInputElm && this._sliderRightInputElm) {
                if (trackPercentPosition <= 50) {
                    this._sliderLeftInputElm.value = `${trackPercentPosition}`;
                    this._sliderLeftInputElm.dispatchEvent(new Event('change'));
                }
                else {
                    this._sliderRightInputElm.value = `${trackPercentPosition}`;
                    this._sliderRightInputElm.dispatchEvent(new Event('change'));
                }
            }
        }
    }
    updateTrackFilledColorWhenEnabled() {
        var _a, _b, _c, _d;
        if ((0, filterUtilities_1.getFilterOptionByName)(this.columnFilter, 'enableSliderTrackColoring') && this._sliderRightInputElm) {
            let percent1 = 0;
            if (this._sliderLeftInputElm) {
                percent1 = ((+this._sliderLeftInputElm.value - +this._sliderLeftInputElm.min) / ((_b = (_a = this.sliderOptions) === null || _a === void 0 ? void 0 : _a.maxValue) !== null && _b !== void 0 ? _b : 0 - +this._sliderLeftInputElm.min)) * 100;
            }
            const percent2 = ((+this._sliderRightInputElm.value - +this._sliderRightInputElm.min) / ((_d = (_c = this.sliderOptions) === null || _c === void 0 ? void 0 : _c.maxValue) !== null && _d !== void 0 ? _d : 0 - +this._sliderRightInputElm.min)) * 100;
            const bg = 'linear-gradient(to right, %b %p1, %c %p1, %c %p2, %b %p2)'
                .replace(/%b/g, '#eee')
                .replace(/%c/g, (0, filterUtilities_1.getFilterOptionByName)(this.columnFilter, 'sliderTrackFilledColor') || this._sliderTrackFilledColor || DEFAULT_SLIDER_TRACK_FILLED_COLOR)
                .replace(/%p1/g, `${percent1}%`)
                .replace(/%p2/g, `${percent2}%`);
            this._sliderTrackElm.style.background = bg;
            this._sliderOptions.sliderTrackBackground = bg;
        }
    }
}
exports.SliderFilter = SliderFilter;
//# sourceMappingURL=sliderFilter.js.map