"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputMaskFilter = void 0;
const inputFilter_1 = require("./inputFilter");
class InputMaskFilter extends inputFilter_1.InputFilter {
    /** Initialize the Filter */
    constructor(translaterService) {
        super(translaterService);
        this.translaterService = translaterService;
        this._inputMask = '';
        this.inputType = 'text';
    }
    /** Getter of the input mask, when provided */
    get inputMask() {
        return this._inputMask;
    }
    /**
     * Override the Filter init used by SlickGrid
     */
    init(args) {
        var _a, _b, _c, _d;
        if (!args) {
            throw new Error('[Slickgrid-Universal] A filter must always have an "init()" with valid arguments.');
        }
        this.grid = args.grid;
        this.callback = args.callback;
        this.columnDef = args.columnDef;
        this.searchTerms = (args.hasOwnProperty('searchTerms') ? args.searchTerms : []) || [];
        this._cellContainerElm = args.filterContainerElm;
        // get input mask from params (can be in columnDef or columnFilter params)
        if ((_b = (_a = this.columnDef) === null || _a === void 0 ? void 0 : _a.params) === null || _b === void 0 ? void 0 : _b.mask) {
            this._inputMask = this.columnDef.params.mask;
        }
        else if ((_d = (_c = this.columnFilter) === null || _c === void 0 ? void 0 : _c.params) === null || _d === void 0 ? void 0 : _d.mask) {
            this._inputMask = this.columnFilter.params.mask;
        }
        if (!this._inputMask) {
            throw new Error(`[Slickgrid-Universal] The Filters.inputMask requires the mask to be passed in the filter params or the column definition params
        for example:: this.columnDefinitions: [{ id: 'phone', field: 'phone', filter: { model: Filters.inputMask, params: { mask: '000-000-0000' }}}]`);
        }
        // filter input can only have 1 search term, so we will use the 1st array index if it exist
        const searchTerm = (Array.isArray(this.searchTerms) && this.searchTerms.length >= 0) ? this.searchTerms[0] : '';
        // step 1, create the DOM Element of the filter & initialize it if searchTerm is filled
        this.createDomFilterElement(searchTerm);
        // step 2, subscribe to the input event and run the callback when that happens
        // also add/remove "filled" class for styling purposes
        this._bindEventService.bind(this._filterInputElm, ['keyup', 'blur', 'change'], this.onTriggerEvent.bind(this));
    }
    /**
     * Event handler to cover the following (keyup, blur, change)
     * We will trigger the Filter Service callback from this handler
     */
    onTriggerEvent(event, isClearFilterEvent = false) {
        var _a, _b, _c;
        let value = '';
        if ((_a = event === null || event === void 0 ? void 0 : event.target) === null || _a === void 0 ? void 0 : _a.value) {
            let targetValue = (_c = (_b = event === null || event === void 0 ? void 0 : event.target) === null || _b === void 0 ? void 0 : _b.value) !== null && _c !== void 0 ? _c : '';
            const enableWhiteSpaceTrim = this.gridOptions.enableFilterTrimWhiteSpace || this.columnFilter.enableTrimWhiteSpace;
            if (typeof targetValue === 'string' && enableWhiteSpaceTrim) {
                targetValue = targetValue.trim();
            }
            // if it has a mask, we need to do a bit more work
            // and replace the filter string by the masked output without triggering an event
            const unmaskedValue = this.unmaskValue(targetValue);
            const maskedValue = this.maskValue(unmaskedValue);
            value = unmaskedValue;
            if ((event === null || event === void 0 ? void 0 : event.keyCode) >= 48) {
                this._filterInputElm.value = maskedValue; // replace filter string with masked string
                event.preventDefault();
            }
        }
        if (isClearFilterEvent) {
            this.callback(event, { columnDef: this.columnDef, clearFilterTriggered: isClearFilterEvent, shouldTriggerQuery: this._shouldTriggerQuery });
            this._filterInputElm.classList.remove('filled');
        }
        else {
            this._filterInputElm.classList.add('filled');
            this.callback(event, { columnDef: this.columnDef, operator: this.operator, searchTerms: [value], shouldTriggerQuery: this._shouldTriggerQuery });
        }
        // reset both flags for next use
        this._shouldTriggerQuery = true;
    }
    /** From a regular string, we will use the mask to output a new string */
    maskValue(inputValue) {
        let i = 0;
        let maskedValue = '';
        if (this._inputMask) {
            maskedValue = this._inputMask.replace(/[09A]/gi, (match) => {
                // only replace the char when the mask is a 0 or 9 for a digit OR the mask is "A" and the char is a non-digit meaning a string char
                if (((match === '0' || match === '9') && /\d+/g.test(inputValue[i])) // mask is 0 or 9 and value is a digit
                    || (match.toUpperCase() === 'A' && /[^\d]+/gi.test(inputValue[i])) // OR mask is an "A" and value is non-digit
                ) {
                    return inputValue[i++] || '';
                }
                return '';
            });
        }
        return maskedValue;
    }
    /** From a masked string, we will remove the mask and make a regular string again */
    unmaskValue(maskedValue) {
        // remove anything else but digits and chars from both the input mask and the input masked value for later comparison
        // e.g. (000) 000-0000 would return 0000000000
        const valueWithoutSymbols = maskedValue.replace(/[^0-9a-z]*/gi, '');
        const maskWithoutSymbols = this._inputMask.replace(/[^0-9a-z]*/gi, '');
        // then we can analyze if each char on each indexes equals what the mask requires, if not the char will be disregarded from the output
        // basically, if our mask is "0A0" and input value is "2ab", then only "2a" will be returned since the last char "b" is not part of the mask and is invalid
        let output = '';
        for (let i = 0; i < maskWithoutSymbols.length; i++) {
            if (valueWithoutSymbols[i]) {
                if (((maskWithoutSymbols[i] === '0' || maskWithoutSymbols[i] === '9') && /\d+/g.test(valueWithoutSymbols[i])) // mask is 0 or 9 and value is a digit
                    || (maskWithoutSymbols[i].toUpperCase() === 'A' && /[^\d]+/gi.test(valueWithoutSymbols[i])) // OR mask is an "A" and value is non-digit
                ) {
                    output += valueWithoutSymbols[i]; // valid and matches the Mask, so we can add it up to the string output
                }
            }
        }
        return output;
    }
}
exports.InputMaskFilter = InputMaskFilter;
//# sourceMappingURL=inputMaskFilter.js.map